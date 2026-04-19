import { SQLiteDatabase } from 'expo-sqlite';

export async function initializeDatabase(db: SQLiteDatabase) {
  // Create tables using execAsync for multiple statements
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plate TEXT UNIQUE NOT NULL,
      owner_id INTEGER NOT NULL,
      make TEXT,
      model TEXT,
      FOREIGN KEY (owner_id) REFERENCES Users(id)
    );

    CREATE TABLE IF NOT EXISTS Zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      total_capacity INTEGER NOT NULL,
      current_occupancy INTEGER NOT NULL DEFAULT 0
    );

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

  // Seed Data: Check if we have users, if not, create them
  const firstUserRow = await db.getFirstAsync('SELECT * FROM Users LIMIT 1');
  if (!firstUserRow) {
    await db.execAsync(`
      INSERT INTO Users (name, role, email) VALUES ('Diego Estudiante', 'student', 'diego@student.com');
      INSERT INTO Users (name, role, email) VALUES ('Admin Luis', 'admin', 'admin@keyalumnos.com');
      
      INSERT INTO Vehicles (plate, owner_id, make, model) VALUES ('ABC-123', 1, 'Toyota', 'Corolla');
      INSERT INTO Vehicles (plate, owner_id, make, model) VALUES ('XYZ-987', 1, 'Honda', 'Civic');
      
      INSERT INTO Zones (name, total_capacity, current_occupancy) VALUES ('Parqueo Norte', 100, 45);
      INSERT INTO Zones (name, total_capacity, current_occupancy) VALUES ('Parqueo Sur', 50, 10);
      INSERT INTO Zones (name, total_capacity, current_occupancy) VALUES ('Parqueo VIP', 20, 19);

      INSERT INTO AccessEvents (vehicle_plate, zone_id, event_type) VALUES ('ABC-123', 1, 'ENTRY');
    `);
    console.log("Database seeded successfully!");
  }
}
