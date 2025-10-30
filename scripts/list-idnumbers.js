// scripts/list-idnumbers.js
// Retrieve all users' ID numbers with optional filters/output formats.
// Usage:
//   node scripts/list-idnumbers.js [--role funder|caregiver|dependent] [--json] [--csv]
// Example:
//   node scripts/list-idnumbers.js --role dependent --csv

require('dotenv').config();

const { User } = require('../models');

function parseArgs(argv) {
  const args = { role: null, json: false, csv: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--role') {
      args.role = argv[i + 1];
      i++;
    } else if (a === '--json') {
      args.json = true;
    } else if (a === '--csv') {
      args.csv = true;
    }
  }
  return args;
}

(async function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const where = {};
    if (args.role) {
      where.role = args.role;
    }

    const users = await User.findAll({
      where,
      attributes: ['id', 'firstName', 'surname', 'email', 'role', 'Idnumber'],
      order: [['id', 'ASC']]
    });

    const rows = users.map(u => ({
      id: u.id,
      role: u.role,
      firstName: u.firstName,
      surname: u.surname,
      email: u.email,
      Idnumber: u.Idnumber
    }));

    if (args.json) {
      console.log(JSON.stringify({ count: rows.length, users: rows }, null, 2));
      process.exit(0);
    }

    if (args.csv) {
      const header = 'id,role,firstName,surname,email,Idnumber';
      const body = rows.map(r => [r.id, r.role, r.firstName, r.surname, r.email, r.Idnumber]
        .map(v => (v == null ? '' : String(v).replace(/"/g, '""')))
        .map(v => (/,|\n|\r|"/.test(v) ? `"${v}"` : v))
        .join(',')
      ).join('\n');
      console.log(header + '\n' + body);
      process.exit(0);
    }

    // Default: pretty table
    console.log(`Found ${rows.length} user(s)`);
    console.log('-----------------------------------------------');
    rows.forEach(r => {
      console.log(`#${r.id} [${r.role}] ${r.firstName} ${r.surname} <${r.email}>`);
      console.log(`   ID Number: ${r.Idnumber}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Failed to list ID numbers:', err.message || err);
    process.exit(1);
  }
})();
