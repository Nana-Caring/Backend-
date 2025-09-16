# Fund Splitting Documentation

## Overview

The NANA Project backend now includes **automatic fund splitting** functionality. When a beneficiary (dependent) receives money from a funder, the incoming amount is automatically distributed among their sub-accounts according to predefined allocation rules.

## How Fund Splitting Works

### 1. **Automatic Distribution**
When money is transferred to a beneficiary:
- The system identifies all active sub-accounts for the beneficiary
- Applies allocation percentages based on account types
- Creates individual transactions for each sub-account
- Updates balances for all affected accounts
- Returns detailed splitting information in the API response

### 2. **Default Allocation Percentages**

The system uses the following default allocation rules:

| Sub-Account Type | Percentage | Purpose |
|------------------|------------|---------|
| Education        | 25%        | School fees, books, learning materials |
| Healthcare       | 20%        | Medical expenses, insurance, wellness |
| Savings          | 20%        | Long-term savings and emergency fund |
| Clothing         | 15%        | Clothing, shoes, accessories |
| Baby Care        | 10%        | Diapers, formula, baby supplies |
| Entertainment    | 5%         | Recreation, toys, activities |
| Pregnancy        | 5%         | Maternity-related expenses |

**Total: 100%** - All incoming funds are distributed among sub-accounts.

### 3. **Smart Distribution Logic**

- **Perfect Distribution**: All money is allocated with no remainder
- **Rounding Handling**: Any rounding remainder goes to the last account to ensure total balance matches
- **Missing Accounts**: If some sub-account types don't exist, remaining percentages are redistributed proportionally
- **No Sub-Accounts**: If no sub-accounts exist, all money goes to the main account

## API Response Format

When a transfer occurs, the API response includes detailed splitting information:

```json
{
  "message": "Money sent successfully",
  "transfer": {
    "transactionRef": "TXN123456ABC",
    "amount": 200.00,
    "currency": "ZAR",
    "fromCard": {
      "bankName": "FNB",
      "cardNumber": "****-****-****-1234",
      "nickname": "My Card"
    },
    "toBeneficiary": {
      "name": "John Doe",
      "accountNumber": "1234567890"
    },
    "status": "completed",
    "timestamp": "2025-01-15T10:30:00Z",
    "description": "Monthly allowance"
  },
  "fundSplitting": {
    "enabled": true,
    "totalSplitAmount": 200.00,
    "remainingToMainAccount": 0.00,
    "splits": [
      {
        "accountId": "uuid-education",
        "accountType": "Education",
        "accountNumber": "9876543210",
        "amount": 50.00,
        "percentage": 25.0,
        "transactionId": "uuid-txn-edu"
      },
      {
        "accountId": "uuid-healthcare",
        "accountType": "Healthcare", 
        "accountNumber": "8765432109",
        "amount": 40.00,
        "percentage": 20.0,
        "transactionId": "uuid-txn-health"
      },
      // ... other splits
    ],
    "message": "Funds split among 7 sub-accounts"
  },
  "balanceUpdate": {
    "beneficiaryNewBalance": 0.00,
    "totalDistributed": 200.00
  }
}
```

## Transaction Records

Each split creates individual transaction records:

### Main Transaction
- **Account**: Beneficiary's main account
- **Type**: Credit
- **Description**: "Received from [Funder Name]"
- **Reference**: Original transaction reference
- **Metadata**: Includes payment intent ID, funder ID, card ID

### Sub-Account Transactions
- **Account**: Individual sub-account
- **Type**: Credit  
- **Description**: "Split from transfer: [Funder Name] (XX.X% split)"
- **Reference**: "[Original-Ref]-SUB-[ACCOUNT-TYPE]"
- **Metadata**: Includes split percentage, original transaction reference, split type

## Usage Examples

### Example 1: R100 Transfer with All Sub-Accounts

**Input**: R100 sent to beneficiary with 7 sub-accounts

**Result**:
- Education: R25.00 (25%)
- Healthcare: R20.00 (20%)  
- Savings: R20.00 (20%)
- Clothing: R15.00 (15%)
- Baby Care: R10.00 (10%)
- Entertainment: R5.00 (5%)
- Pregnancy: R5.00 (5%)
- Main Account: R0.00 (0%)

### Example 2: R150 Transfer with Missing Sub-Accounts

**Input**: R150 sent to beneficiary with only 3 sub-accounts (Education, Healthcare, Savings)

**Result**: 
- Percentages are proportionally adjusted
- Education: R56.25 (37.5% - adjusted from 25%)
- Healthcare: R45.00 (30% - adjusted from 20%)
- Savings: R45.00 (30% - adjusted from 20%)
- Main Account: R3.75 (2.5% - rounding remainder)

### Example 3: No Sub-Accounts

**Input**: R200 sent to beneficiary with no sub-accounts

**Result**:
- Main Account: R200.00 (100%)
- Split message: "No sub-accounts found, all funds allocated to main account"

## Database Changes

### Transaction Metadata

Split transactions include enhanced metadata:

```json
{
  "splitFrom": "main-account-uuid",
  "splitPercentage": 25.0,
  "originalTransactionRef": "TXN123456ABC",
  "splitType": "automatic_allocation"
}
```

### Account Balance Updates

All affected accounts have their balances updated atomically:
- Main account receives remainder (if any)
- Each sub-account receives calculated split amount
- Last transaction date updated for all accounts

## Error Handling

### Fund Splitting Errors

If fund splitting fails:
1. **Database Rollback**: All changes are reverted
2. **Stripe Refund**: Automatic refund attempt if payment succeeded
3. **Error Response**: Clear error message returned
4. **Logging**: Detailed error logging for debugging

### Common Error Scenarios

- **Invalid sub-account**: Skip invalid accounts, continue with valid ones
- **Database constraint violation**: Full rollback and error response
- **Rounding errors**: Automatically handled with remainder allocation

## Configuration

### Customizing Allocation Percentages

The allocation percentages can be modified in the transfer controller:

```javascript
const DEFAULT_SUB_ACCOUNT_ALLOCATIONS = {
  'Education': 30,      // Increase education allocation
  'Healthcare': 25,     // Increase healthcare allocation
  'Savings': 25,        // Increase savings allocation
  'Clothing': 10,       // Reduce clothing allocation
  'Baby Care': 5,       // Reduce baby care allocation
  'Entertainment': 3,   // Reduce entertainment allocation
  'Pregnancy': 2        // Reduce pregnancy allocation
  // Total: 100%
};
```

### Future Enhancements

1. **Per-Beneficiary Rules**: Custom allocation rules per beneficiary
2. **Dynamic Allocation**: Rules based on age, gender, or other factors
3. **Minimum Amounts**: Set minimum amounts for each sub-account type
4. **Maximum Caps**: Set maximum amounts to prevent over-allocation
5. **Admin Configuration**: Web interface for managing allocation rules

## Testing

### Test Scripts Available

1. **`test-fund-splitting.js`**: Tests the splitting logic in isolation
2. **`test-money-transfer-splitting.js`**: Tests complete integration

### Running Tests

```bash
# Test fund splitting logic
node test-fund-splitting.js

# Test complete transfer integration  
node test-money-transfer-splitting.js
```

### Test Data Requirements

- Funder with active payment cards
- Dependent with main account and sub-accounts
- Valid funder-dependent relationship
- Active Stripe payment methods

## Integration Notes

### With Existing Systems

- **Compatible** with existing transfer endpoints
- **Backward compatible** - old transfers without splitting still work
- **Enhanced responses** - new fields added to existing response structure
- **Database safe** - uses transactions to ensure data consistency

### Performance Considerations

- **Minimal overhead**: Only 1-2 additional database queries per transfer
- **Atomic operations**: All updates happen in single database transaction
- **Efficient queries**: Uses bulk operations where possible
- **Logging optimized**: Structured logging for monitoring and debugging

## Monitoring and Analytics

### Key Metrics to Track

1. **Split Success Rate**: Percentage of transfers with successful splits
2. **Average Split Count**: Average number of sub-accounts per transfer
3. **Allocation Distribution**: Which account types receive the most funds
4. **Error Rates**: Frequency of splitting errors and types

### Recommended Monitoring

```javascript
// Example monitoring points
console.log(`Split completed: ${splits.length} accounts, R${totalSplitAmount} distributed`);
console.log(`Allocation breakdown: ${splits.map(s => `${s.accountType}:${s.percentage}%`).join(', ')}`);
```

## Security Considerations

### Data Protection

- **Transaction integrity**: All splits are atomic and consistent
- **Audit trail**: Complete transaction history maintained
- **Access control**: Only authorized funders can transfer to their beneficiaries
- **Data validation**: All amounts and percentages validated before processing

### Compliance

- **Financial regulations**: Maintains proper transaction records
- **Data privacy**: No sensitive data exposed in logs
- **Auditability**: Full transaction trail for compliance reporting

---

## Quick Start Guide

### For Developers

1. **Ensure Dependencies**: Verify all models and associations are loaded
2. **Test Environment**: Run test scripts to verify functionality
3. **Monitor Logs**: Watch for splitting success/failure messages
4. **Validate Results**: Check that account balances match expected distributions

### For System Administrators

1. **Database Monitoring**: Watch for transaction volume increases
2. **Performance Metrics**: Monitor query performance during peak transfers
3. **Error Tracking**: Set up alerts for splitting failures
4. **Balance Reconciliation**: Regular checks that split amounts sum correctly

The fund splitting feature enhances the NANA Project by ensuring that beneficiary funds are automatically allocated according to their needs, providing better financial management and transparency for all stakeholders.
