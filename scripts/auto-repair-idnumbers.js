// scripts/auto-repair-idnumbers.js
// Attempts to auto-repair malformed SA ID numbers that end with 'NaN'
// Strategy:
// - Detect IDs like YYMMDDSSSNaN (9 digits + 'NaN')
// - Build SSSS by appending a digit to SSS (e.g., SSS0), set citizenship C=0, A=8
// - Compute Luhn checksum for the 13th digit
// - Ensure uniqueness; if collision or invalid date, skip or try next SSSS suffix 1..9
// Usage:
//   node scripts/auto-repair-idnumbers.js            # dry-run (default)
//   node scripts/auto-repair-idnumbers.js --apply    # apply fixes
// Options:
//   --citizenship 0|1  (default 0)

require('dotenv').config();

const { Op } = require('sequelize');
const { User } = require('../models');
const { calculateAgeFromSAId } = require('../utils/ageCalculator');

function luhnCheckDigit12(d12) {
  // Input: 12-digit numeric string
  const digits = d12.split('').map(d => parseInt(d, 10));
  // SA ID Luhn per Home Affairs:
  // 1) Sum of digits in odd positions (1,3,5,7,9,11)  => index 0,2,4,6,8,10
  // 2) Concatenate even position digits (2,4,6,8,10,12), multiply by 2, sum digits of result
  // 3) total = step1 + step2; check = 10 - (total % 10); if 10 then 0
  const oddSum = digits.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
  const evenConcat = digits.filter((_, i) => i % 2 === 1).join('');
  const evenNum = String(parseInt(evenConcat, 10) * 2);
  const evenSum = evenNum.split('').reduce((a, b) => a + parseInt(b, 10), 0);
  const total = oddSum + evenSum;
  const check = (10 - (total % 10)) % 10;
  return String(check);
}

function isNineDigitsNaN(val) {
  return typeof val === 'string' && /^\d{9}NaN$/.test(val);
}

function isValid12(d12) {
  return /^\d{12}$/.test(d12);
}

async function main() {
  const argv = process.argv.slice(2);
  const apply = argv.includes('--apply');
  const cIndex = argv.indexOf('--citizenship');
  const citizenship = cIndex !== -1 ? argv[cIndex + 1] : '0';
  if (!['0', '1'].includes(citizenship)) {
    console.error('Citizenship must be 0 (citizen) or 1 (permanent resident)');
    process.exit(1);
  }

  try {
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'surname', 'email', 'role', 'Idnumber'],
      where: { Idnumber: { [Op.not]: null } },
      order: [['id', 'ASC']]
    });

    const existingIds = new Set(users.map(u => String(u.Idnumber)));

    const candidates = users.filter(u => {
      const id = String(u.Idnumber);
      if (!/^\d{13}$/.test(id)) return true; // malformed length
      const info = calculateAgeFromSAId(id);
      return !info.isValid; // invalid by date rules
    });

    const toRepair = candidates.filter(u => isNineDigitsNaN(String(u.Idnumber)));

    if (toRepair.length === 0) {
      console.log('✅ No IDs matching 9-digit + NaN pattern to repair.');
      process.exit(0);
    }

    console.log(`Found ${toRepair.length} candidate(s) to repair (dry-run = ${!apply})`);

    let success = 0;
    let skipped = 0;

    for (const u of toRepair) {
      const raw = String(u.Idnumber);
      const yymmdd = raw.substring(0, 6);
      const sss = raw.substring(6, 9); // we have 3 of the 4 required

      // Try SSSS: prefer preserving sss + x with x=0..9
      let repaired = null;
      for (let x = 0; x <= 9; x++) {
        const ssss = sss + String(x);
        const A = '8';
        const d12 = yymmdd + ssss + citizenship + A; // 12 digits
        if (!isValid12(d12)) continue;
        const check = luhnCheckDigit12(d12);
        const candidate = d12 + check;
        // Check validity and uniqueness
        const info = calculateAgeFromSAId(candidate);
        if (info.isValid && !existingIds.has(candidate)) {
          repaired = candidate;
          break;
        }
      }

      if (!repaired) {
        console.log(`⚠️  Skip user #${u.id}: unable to generate valid non-duplicate ID from ${raw}`);
        skipped++;
        continue;
      }

      console.log(`#${u.id} ${u.firstName} ${u.surname} <${u.email}>`);
      console.log(`   ${raw}  =>  ${repaired}`);

      if (apply) {
        await u.update({ Idnumber: repaired });
        existingIds.add(repaired);
        success++;
      }
    }

    if (apply) {
      console.log(`\n✅ Applied repairs: ${success} updated, ${skipped} skipped.`);
    } else {
      console.log(`\nDry-run complete. Use --apply to perform updates.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Auto-repair failed:', err);
    process.exit(1);
  }
}

main();
