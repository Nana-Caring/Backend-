/**
 * Test script to verify the transfer endpoint
 * This helps debug what data is being sent to the backend
 */

const testTransferRequest = {
  // ✅ CORRECT FORMAT - Use this structure in your frontend
  beneficiaryId: 13,                    // Integer, from beneficiary.id
  accountNumber: "ACC202501001",        // String, from account.accountNumber
  amount: 200.00,                       // Float/Number
  description: "Test transfer"          // String (optional)
};

console.log('✅ CORRECT Request Body Format:');
console.log(JSON.stringify(testTransferRequest, null, 2));

// ❌ COMMON MISTAKES TO AVOID:

const wrongExamples = {
  
  // ❌ WRONG: Using 'id' instead of 'beneficiaryId'
  mistake1: {
    id: 13,  // Should be 'beneficiaryId'
    accountNumber: "ACC202501001",
    amount: 200.00
  },
  
  // ❌ WRONG: Using 'dependentId' instead of 'beneficiaryId'
  mistake2: {
    dependentId: 13,  // Should be 'beneficiaryId'
    accountNumber: "ACC202501001",
    amount: 200.00
  },
  
  // ❌ WRONG: Using account ID instead of account number
  mistake3: {
    beneficiaryId: 13,
    accountId: "b9856421-7829-4171-ac8b-e0d73a97da45",  // Should use accountNumber
    amount: 200.00
  },
  
  // ❌ WRONG: Missing beneficiaryId
  mistake4: {
    accountNumber: "ACC202501001",
    amount: 200.00
  },
  
  // ❌ WRONG: accountNumber as number instead of string
  mistake5: {
    beneficiaryId: 13,
    accountNumber: 123456,  // Should be a string
    amount: 200.00
  }
};

console.log('\n\n❌ Common Mistakes to Avoid:');
Object.keys(wrongExamples).forEach(key => {
  console.log(`\n${key}:`, JSON.stringify(wrongExamples[key], null, 2));
});

console.log('\n\n📋 How to Extract Data from Beneficiary Object:');
console.log(`
const beneficiary = {
  id: 13,                    // ← Use this for beneficiaryId
  name: "Emma Johnson",
  Accounts: [
    {
      id: "b9856421-7829-4171-ac8b-e0d73a97da45",
      accountNumber: "ACC202501001",  // ← Use this for accountNumber
      accountType: "Main",
      balance: "ZAR 1500.00"
    }
  ]
};

// ✅ Correct way to extract:
const selectedAccount = beneficiary.Accounts[0];  // or find the one user selected

const requestBody = {
  beneficiaryId: beneficiary.id,              // 13
  accountNumber: selectedAccount.accountNumber, // "ACC202501001"
  amount: 200.00,
  description: "Transfer description"
};
`);

console.log('\n\n🔍 Frontend Debug Checklist:');
console.log(`
1. ✅ Check beneficiary.id is a number (not undefined)
2. ✅ Check account.accountNumber is a string (not undefined)
3. ✅ Verify you're using 'beneficiaryId' not 'id' or 'dependentId'
4. ✅ Verify you're using 'accountNumber' not 'accountId' or 'id'
5. ✅ Console.log the request body before sending
6. ✅ Check network tab to see what was actually sent
`);

console.log('\n\n📝 Example Frontend Code:');
console.log(`
// React/JavaScript example
const handleTransfer = async (beneficiary, selectedAccount, amount) => {
  
  // Debug: Log what you're about to send
  console.log('Beneficiary:', beneficiary);
  console.log('Selected Account:', selectedAccount);
  console.log('Amount:', amount);
  
  const requestBody = {
    beneficiaryId: beneficiary.id,              // Make sure this is a number
    accountNumber: selectedAccount.accountNumber, // Make sure this is a string
    amount: parseFloat(amount),                  // Convert to number
    description: 'Monthly allowance'
  };
  
  // Debug: Log the final request body
  console.log('Request Body:', requestBody);
  
  // Verify all required fields are present
  if (!requestBody.beneficiaryId) {
    console.error('❌ ERROR: beneficiaryId is missing!');
    return;
  }
  
  if (!requestBody.accountNumber) {
    console.error('❌ ERROR: accountNumber is missing!');
    return;
  }
  
  if (!requestBody.amount || requestBody.amount <= 0) {
    console.error('❌ ERROR: Invalid amount!');
    return;
  }
  
  try {
    const response = await fetch('/api/funder/transfer', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('token')}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Transfer failed');
    }
    
    console.log('✅ Transfer successful:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Transfer error:', error.message);
    throw error;
  }
};
`);

module.exports = { testTransferRequest };
