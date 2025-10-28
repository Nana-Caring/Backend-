require('dotenv').config();

async function testEmergencyFundLogic() {
  console.log('💰 TESTING EMERGENCY FUND LOGIC (SIMULATION)');
  console.log('='.repeat(50));
  
  // Simulate the new distribution logic
  const transferAmount = 100;
  
  console.log(`\n📊 Transfer Amount: ZAR ${transferAmount}`);
  
  // Emergency fund: 20% stays in Main account
  const emergencyFundPercentage = 0.20;
  const emergencyFundAmount = Math.round(transferAmount * emergencyFundPercentage * 100) / 100;
  
  console.log(`\n🚨 EMERGENCY FUND:`);
  console.log(`   Amount: ZAR ${emergencyFundAmount} (${emergencyFundPercentage * 100}%)`);
  console.log(`   Purpose: Accessible savings for emergencies`);
  console.log(`   Location: Main account balance`);
  
  // Category distribution: 80% distributed across categories
  const categoryAllocations = {
    'Healthcare': 0.20,    // 20% of total transfer
    'Groceries': 0.16,     // 16% of total transfer
    'Education': 0.16,     // 16% of total transfer
    'Transport': 0.08,     // 8% of total transfer
    'Entertainment': 0.04, // 4% of total transfer
    'Clothing': 0.04,      // 4% of total transfer
    'Baby Care': 0.04,     // 4% of total transfer
    'Pregnancy': 0.08      // 8% of total transfer
  };
  
  console.log(`\n📋 CATEGORY DISTRIBUTION (80% of transfer):`);
  
  let totalCategoryDistribution = 0;
  const distributions = [];
  
  Object.entries(categoryAllocations).forEach(([category, percentage]) => {
    const amount = Math.round(transferAmount * percentage * 100) / 100;
    const percentOfDistribution = Math.round((percentage / 0.80) * 100); // Percentage of the 80%
    
    distributions.push({
      category,
      amount,
      percentOfTotal: Math.round(percentage * 100),
      percentOfDistribution
    });
    
    totalCategoryDistribution += amount;
  });
  
  // Sort by amount for better display
  distributions.sort((a, b) => b.amount - a.amount);
  
  distributions.forEach(dist => {
    console.log(`   • ${dist.category.padEnd(12)}: ZAR ${dist.amount.toString().padStart(5)} (${dist.percentOfTotal}% of transfer, ${dist.percentOfDistribution}% of distribution)`);
  });
  
  console.log(`\n📊 TOTALS VERIFICATION:`);
  console.log(`   Emergency Fund:     ZAR ${emergencyFundAmount}`);
  console.log(`   Category Total:     ZAR ${totalCategoryDistribution}`);
  console.log(`   Grand Total:        ZAR ${emergencyFundAmount + totalCategoryDistribution}`);
  console.log(`   Original Transfer:  ZAR ${transferAmount}`);
  console.log(`   ✅ Match: ${(emergencyFundAmount + totalCategoryDistribution) === transferAmount ? 'YES' : 'NO'}`);
  
  console.log(`\n💡 EMERGENCY FUND CONCEPT:`);
  console.log(`   🎯 Dependent receives ZAR ${transferAmount} total`);
  console.log(`   📊 ZAR ${totalCategoryDistribution} (80%) auto-budgeted across spending categories`);
  console.log(`   🚨 ZAR ${emergencyFundAmount} (20%) kept in Main account for emergencies`);
  console.log(`   💳 Main account = Accessible emergency savings`);
  console.log(`   🔑 Dependent can withdraw emergency funds directly from Main`);
  console.log(`   🛡️ Prevents overspending in categories while ensuring emergency access`);
  
  console.log(`\n🎉 BENEFITS:`);
  console.log(`   ✅ Automatic budgeting (80% allocated to priorities)`);
  console.log(`   ✅ Emergency accessibility (20% available immediately)`);
  console.log(`   ✅ Financial discipline (prevents full spending)`);
  console.log(`   ✅ Peace of mind (always have emergency funds)`);
  
  return true;
}

testEmergencyFundLogic()
  .then(() => {
    console.log('\n✅ Emergency fund logic simulation complete!');
  })
  .catch(error => {
    console.error('\n❌ Simulation failed:', error);
  });