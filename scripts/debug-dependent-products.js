// scripts/debug-dependent-products.js
// Usage: node scripts/debug-dependent-products.js <dependentId>
// Prints dependent age, ageCategory, total product count, and counts per category.

require('dotenv').config();

const { Op } = require('sequelize');
const { User, Product } = require('../models');
const { calculateAgeFromSAId } = require('../utils/ageCalculator');

async function main() {
  const depId = parseInt(process.argv[2], 10);
  if (!depId) {
    console.error('Usage: node scripts/debug-dependent-products.js <dependentId>');
    process.exit(1);
  }

  try {
    const dependent = await User.findOne({
      where: { id: depId, role: 'dependent', isBlocked: false },
      attributes: ['id', 'firstName', 'surname', 'Idnumber', 'role']
    });

    if (!dependent) {
      console.error(`Dependent ${depId} not found or blocked`);
      process.exit(1);
    }

    const ageInfo = calculateAgeFromSAId(dependent.Idnumber);
    if (!ageInfo.isValid) {
      console.error(`Invalid ID for dependent ${depId}: ${dependent.Idnumber} -> ${ageInfo.error}`);
      process.exit(1);
    }

    const userAge = ageInfo.age;
    const where = { isActive: true, inStock: true };
    where[Op.and] = [
      { [Op.or]: [{ minAge: null }, { minAge: { [Op.lte]: userAge } }] },
      { [Op.or]: [{ maxAge: null }, { maxAge: { [Op.gte]: userAge } }] }
    ];

    const { rows, count } = await Product.findAndCountAll({
      where,
      attributes: ['id', 'name', 'category', 'brand', 'minAge', 'maxAge'],
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    console.log(`Dependent #${depId}: ${dependent.firstName} ${dependent.surname}`);
    console.log(`  Age: ${userAge} (${ageInfo.ageCategory})`);
    console.log(`  Total age-appropriate products: ${count}`);

    // Group by category
    const byCat = rows.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});

    console.log('  Counts by category:');
    Object.entries(byCat).forEach(([cat, c]) => console.log(`   - ${cat}: ${c}`));

    console.log('\n  Sample products:');
    rows.slice(0, 10).forEach(p => console.log(`   • [${p.category}] ${p.name}`));

    process.exit(0);
  } catch (err) {
    console.error('Debug dependent products failed:', err);
    process.exit(1);
  }
}

main();
