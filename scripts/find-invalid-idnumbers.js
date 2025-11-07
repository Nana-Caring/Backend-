// scripts/find-invalid-idnumbers.js
// Scan the Users table for invalid South African ID numbers and report them.
// Optionally, pass --fix <userId> --id <newIdNumber> to update a specific user.

require('dotenv').config();

const { User } = require('../models');
const { calculateAgeFromSAId } = require('../utils/ageCalculator');

function isDigits13(id) {
  return typeof id === 'string' && /^\d{13}$/.test(id);
}

async function main() {
  const args = process.argv.slice(2);
  const fixIndex = args.indexOf('--fix');
  const idIndex = args.indexOf('--id');

  const fixUserId = fixIndex !== -1 ? parseInt(args[fixIndex + 1], 10) : null;
  const newIdValue = idIndex !== -1 ? args[idIndex + 1] : null;

  if ((fixUserId && !newIdValue) || (!fixUserId && newIdValue)) {
    console.error('If using --fix, provide both --fix <userId> and --id <13-digit-id>');
    process.exit(1);
  }

  try {
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'surname', 'email', 'role', 'Idnumber']
    });

    let invalid = [];

    for (const u of users) {
      const id = u.Idnumber ? String(u.Idnumber).trim() : '';
      const basicValid = isDigits13(id);
      const calc = basicValid ? calculateAgeFromSAId(id) : { isValid: false, error: 'Idnumber must be 13 digits' };

      if (!basicValid || !calc.isValid) {
        invalid.push({
          id: u.id,
          name: `${u.firstName} ${u.surname}`.trim(),
          email: u.email,
          role: u.role,
          Idnumber: u.Idnumber,
          reason: !basicValid ? 'Not 13 numeric digits' : calc.error || 'Invalid date encoded in ID'
        });
      }
    }

    if (invalid.length === 0) {
      console.log('✅ All users have valid 13-digit ID numbers with valid dates.');
    } else {
      console.log(`⚠️ Found ${invalid.length} user(s) with invalid ID numbers:`);
      invalid.forEach((rec, idx) => {
        console.log(`${idx + 1}. User #${rec.id} (${rec.role}) ${rec.name} <${rec.email}>`);
        console.log(`   ID: ${rec.Idnumber} -> ${rec.reason}`);
      });
    }

    if (fixUserId && newIdValue) {
      if (!isDigits13(newIdValue)) {
        console.error('New ID number must be exactly 13 numeric digits.');
        process.exit(1);
      }
      const ageInfo = calculateAgeFromSAId(newIdValue);
      if (!ageInfo.isValid) {
        console.error(`New ID number fails date validation: ${ageInfo.error}`);
        process.exit(1);
      }

      const user = await User.findByPk(fixUserId);
      if (!user) {
        console.error(`User with id ${fixUserId} not found`);
        process.exit(1);
      }

      const before = user.Idnumber;
      await user.update({ Idnumber: newIdValue });
      console.log(`✅ Updated user #${fixUserId} Idnumber: ${before} -> ${newIdValue}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error scanning/updating ID numbers:', err);
    process.exit(1);
  }
}

main();
