#!/usr/bin/env node

/**
 * Seed script to promote a user to superadmin role
 * Usage: node scripts/seedSuperadmin.js <email>
 */

const db = require('../backend/database');

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/seedSuperadmin.js <email>');
  process.exit(1);
}

console.log(`Promoting user with email ${email} to superadmin...`);

db.get('SELECT * FROM Users WHERE email = ?', [email], (err, row) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }

  if (!row) {
    console.error(`User with email ${email} not found`);
    process.exit(1);
  }

  console.log(`Found user: ${row.name} (${row.email}) - Current role: ${row.role}`);

  db.run('UPDATE Users SET role = ? WHERE email = ?', ['superadmin', email], (err) => {
    if (err) {
      console.error('Error:', err);
      process.exit(1);
    }

    console.log(`✓ User ${email} promoted to superadmin`);
    process.exit(0);
  });
});
