const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'keyalumnos.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Pragma commands for optimization and foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Users Table
  // Clerk is our auth provider, so we use their clerk_id as primary key string
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      clerk_id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'student' -- student, admin, superadmin
    );
  `);

  // Vehicles Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plate TEXT UNIQUE NOT NULL,
      owner_clerk_id TEXT NOT NULL,
      make TEXT,
      model TEXT,
      FOREIGN KEY (owner_clerk_id) REFERENCES Users(clerk_id) ON DELETE CASCADE
    );
  `);

  // Zones Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      total_capacity INTEGER NOT NULL,
      current_occupancy INTEGER NOT NULL DEFAULT 0
    );
  `);

  // AccessEvents Table
  db.run(`
    CREATE TABLE IF NOT EXISTS AccessEvents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_plate TEXT NOT NULL,
      zone_id INTEGER NOT NULL,
      event_type TEXT NOT NULL, -- 'ENTRY' or 'EXIT'
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_plate) REFERENCES Vehicles(plate),
      FOREIGN KEY (zone_id) REFERENCES Zones(id)
    );
  `);

  // Seed default data if Zones are empty
  db.get('SELECT COUNT(*) as count FROM Zones', (err, row) => {
    if (row.count === 0) {
      db.run("INSERT INTO Zones (name, total_capacity, current_occupancy) VALUES ('Parqueo Norte', 100, 45)");
      db.run("INSERT INTO Zones (name, total_capacity, current_occupancy) VALUES ('Parqueo Sur', 50, 10)");
      db.run("INSERT INTO Zones (name, total_capacity, current_occupancy) VALUES ('Parqueo VIP', 20, 19)");
      console.log('Seed data inserted for Zones.');
    }
  });
});

module.exports = db;
