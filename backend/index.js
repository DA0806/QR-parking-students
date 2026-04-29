require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('@clerk/express');
const db = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'qr_parking_super_secret_5m_key';

const app = express();
app.use(cors());
app.use(express.json());

// --- RATE LIMITERS ---
const qrLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per `window` (here, per minute)
  message: { error: 'Too many requests for QR generation, please try again later.' }
});

const scanLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: { error: 'Too many scan requests, please wait.' }
});

// --- QR API ---
app.post('/api/qr/generate', qrLimiter, requireAuth(), (req, res) => {
  const { userId, plate, type } = req.body;

  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  // Prevent generating QRs for other users
  if (req.auth.userId !== userId) {
    return res.status(403).json({ error: 'Unauthorized to generate QR for this user' });
  }
  
  const payload = { userId, plate, type };
  // Generate a token valid for 5 minutes
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '5m' });
  res.json({ token });
});


// --- USERS API ---
// Called when a user logs in via Clerk. Upserts the user and returns their role.
app.post('/api/users/sync', (req, res) => {
  const { clerk_id, email, name } = req.body;
  if (!clerk_id || !email || !name) {
    return res.status(400).json({ error: 'Missing user data' });
  }

  // Use subquery to check existence and insert or do nothing, then return row.
  // Actually, we can use "INSERT ON CONFLICT" (SQLite 3.24+) but just doing a select first is easy.
  db.get('SELECT * FROM Users WHERE clerk_id = ?', [clerk_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (row) {
      return res.json(row); // Return existing user (with role)
    } else {
      // Create new user (default role: student, unless email is admin/superadmin for testing)
      let role = 'student';
      if (email.includes('admin@')) role = 'admin';
      if (email.includes('super@')) role = 'superadmin';

      const stmt = db.prepare('INSERT INTO Users (clerk_id, email, name, role) VALUES (?, ?, ?, ?)');
      stmt.run([clerk_id, email, name, role], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ clerk_id, email, name, role });
      });
    }
  });
});

app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM Users', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/users/:clerk_id/role', (req, res) => {
  const { role } = req.body;
  db.run('UPDATE Users SET role = ? WHERE clerk_id = ?', [role, req.params.clerk_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- VEHICLES API ---
app.get('/api/vehicles/:clerk_id', (req, res) => {
  db.all('SELECT * FROM Vehicles WHERE owner_clerk_id = ?', [req.params.clerk_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/vehicles', (req, res) => {
  const { plate, owner_clerk_id, make, model } = req.body;
  db.run('INSERT INTO Vehicles (plate, owner_clerk_id, make, model) VALUES (?, ?, ?, ?)', 
    [plate.toUpperCase(), owner_clerk_id, make, model], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, plate: plate.toUpperCase(), owner_clerk_id, make, model });
  });
});

app.delete('/api/vehicles/:id', (req, res) => {
  db.run('DELETE FROM Vehicles WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- ZONES API ---
app.get('/api/zones', (req, res) => {
  db.all('SELECT * FROM Zones', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/zones', (req, res) => {
  const { name, total_capacity } = req.body;
  db.run('INSERT INTO Zones (name, total_capacity, current_occupancy) VALUES (?, ?, 0)', [name, total_capacity], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, total_capacity, current_occupancy: 0 });
  });
});

app.put('/api/zones/:id', (req, res) => {
  const { name, total_capacity } = req.body;
  db.run('UPDATE Zones SET name = ?, total_capacity = ? WHERE id = ?', [name, total_capacity, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/zones/:id', (req, res) => {
  db.run('DELETE FROM Zones WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- EVENTS API (Scanner) ---
app.post('/api/events/scan', (req, res) => {
    const { token, zone_id } = req.body;
    
    if (!token || !zone_id) return res.status(400).json({ error: 'Faltan datos del escaneo' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'QR Token inválido o ha expirado.' });
        }

        const vehicle_plate = decoded.plate || 'PEATON';
        const isPedestrian = !decoded.plate;

        // Obtain last event to determine isEntry status
        db.get('SELECT event_type FROM AccessEvents WHERE vehicle_plate = ? ORDER BY timestamp DESC LIMIT 1', [vehicle_plate], (err, lastEvent) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const isEntry = !lastEvent || lastEvent.event_type === 'EXIT';

            db.get('SELECT current_occupancy, total_capacity FROM Zones WHERE id = ?', [zone_id], (err, zone) => {
                if (err) return res.status(500).json({ error: err.message });
                if (!zone) return res.status(404).json({ error: 'Zona no encontrada' });

                if (isEntry && !isPedestrian && zone.current_occupancy >= zone.total_capacity) {
                    return res.status(400).json({ error: 'Zona llena' });
                }

                const eventType = isEntry ? 'ENTRY' : 'EXIT';
                const delta = (isEntry && !isPedestrian) ? 1 : (!isEntry && !isPedestrian) ? -1 : 0;

                db.serialize(() => {
                    db.run('BEGIN TRANSACTION');
                    db.run('INSERT INTO AccessEvents (vehicle_plate, zone_id, event_type) VALUES (?, ?, ?)', 
                           [vehicle_plate, zone_id, eventType]);
                    if (delta !== 0) {
                        db.run('UPDATE Zones SET current_occupancy = MAX(0, current_occupancy + ?) WHERE id = ?', 
                               [delta, zone_id]);
                    }
                    db.run('COMMIT', (err) => {
                        if (err) return res.status(500).json({ error: err.message });
                        res.json({ success: true, eventType, vehicle_plate, isEntry });
                    });
                });
            });
        });
    });
});

app.get('/api/events/last/:plate', (req, res) => {
    db.get('SELECT * FROM AccessEvents WHERE vehicle_plate = ? ORDER BY timestamp DESC LIMIT 1', [req.params.plate], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'No previous events' });
        res.json(row);
    });
});

app.post('/api/events', (req, res) => {
    const { vehicle_plate, zone_id, isEntry } = req.body;
    
    db.get('SELECT current_occupancy, total_capacity FROM Zones WHERE id = ?', [zone_id], (err, zone) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!zone) return res.status(404).json({ error: 'Zona no encontrada' });

        if (isEntry && zone.current_occupancy >= zone.total_capacity) {
            return res.status(400).json({ error: 'Zona llena' });
        }

        const eventType = isEntry ? 'ENTRY' : 'EXIT';
        const delta = isEntry ? 1 : -1;

        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            db.run('INSERT INTO AccessEvents (vehicle_plate, zone_id, event_type) VALUES (?, ?, ?)', 
                   [vehicle_plate, zone_id, eventType]);
            db.run('UPDATE Zones SET current_occupancy = MAX(0, current_occupancy + ?) WHERE id = ?', 
                   [delta, zone_id]);
            db.run('COMMIT', (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, eventType });
            });
        });
    });
});

app.get('/api/events/recent', (req, res) => {
    db.all(`
        SELECT a.id, a.vehicle_plate, z.name as zone_name, a.event_type, a.timestamp 
        FROM AccessEvents a
        JOIN Zones z ON a.zone_id = z.id
        ORDER BY a.timestamp DESC
        LIMIT 20
    `, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Detect the last event of a vehicle to guess if they are entering or exiting automatically
app.get('/api/events/last/:plate', (req, res) => {
    db.get('SELECT event_type FROM AccessEvents WHERE vehicle_plate = ? ORDER BY timestamp DESC LIMIT 1', 
        [req.params.plate], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || null);
    });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API running on port ${PORT}`);
});
