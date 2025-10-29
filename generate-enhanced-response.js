const { User, Account, Transaction } = require('./models');

async function generateEnhancedTransactionResponse() {
    try {
        console.log('🔍 Generating Enhanced Transaction API Response Examples...\n');

        // Get recent transactions with enhanced fields
        const transactions = await Transaction.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{
                model: Account,
                as: 'account',
                attributes: ['id', 'accountNumber', 'accountType', 'balance'],
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'middleName', 'surname', 'email']
                }]
            }]
        });

        console.log('📝 Enhanced Transaction API Response Structure:');
        console.log('\n```json');
        console.log(JSON.stringify({
            success: true,
            message: "Transactions retrieved successfully",
            data: {
                transactions: transactions.map(txn => ({
                    id: txn.id,
                    amount: parseFloat(txn.amount),
                    currency: "ZAR",
                    type: txn.type,
                    description: txn.description,
                    reference: txn.reference,
                    
                    // Enhanced fields for better statement clarity
                    senderName: txn.senderName,
                    senderAccountNumber: txn.senderAccountNumber,
                    recipientName: txn.recipientName,
                    recipientAccountNumber: txn.recipientAccountNumber,
                    transactionCategory: txn.transactionCategory,
                    merchantName: txn.merchantName,
                    
                    // Existing fields
                    timestamp: txn.timestamp || txn.createdAt,
                    createdAt: txn.createdAt,
                    
                    // Account information
                    account: {
                        id: txn.account.id,
                        accountNumber: txn.account.accountNumber,
                        accountType: txn.account.accountType,
                        balance: parseFloat(txn.account.balance),
                        owner: txn.account.user ? {
                            id: txn.account.user.id,
                            name: `${txn.account.user.firstName} ${txn.account.user.middleName || ''} ${txn.account.user.surname}`.trim(),
                            email: txn.account.user.email
                        } : null
                    }
                })),
                summary: {
                    totalTransactions: transactions.length,
                    dateRange: {
                        from: transactions.length > 0 ? transactions[transactions.length - 1].createdAt : null,
                        to: transactions.length > 0 ? transactions[0].createdAt : null
                    }
                }
            }
        }, null, 2));
        console.log('```\n');

        // Generate specific transaction type examples
        console.log('📊 Transaction Type Examples:\n');

        // Fund Transfer Example
        console.log('**1. Fund Transfer Transaction:**');
        console.log('```json');
        console.log(JSON.stringify({
            id: "550e8400-e29b-41d4-a716-446655440000",
            amount: 500.00,
            currency: "ZAR",
            type: "Credit",
            description: "Weekly allowance from Sarah Williams",
            reference: "TRF-20241029-ABC123-IN",
            
            // Enhanced fields
            senderName: "Sarah Williams",
            senderAccountNumber: "1234567890",
            recipientName: "Emma Johnson",
            recipientAccountNumber: "6472659461",
            transactionCategory: "allowance",
            merchantName: null,
            
            timestamp: "2024-10-29T12:15:00.000Z",
            createdAt: "2024-10-29T12:15:00.000Z",
            
            account: {
                id: "account-uuid",
                accountNumber: "6472659461",
                accountType: "Main",
                balance: 2617.87,
                owner: {
                    id: 13,
                    name: "Emma Johnson",
                    email: "dependent@demo.com"
                }
            }
        }, null, 2));
        console.log('```\n');

        // Purchase Transaction Example
        console.log('**2. Purchase Transaction:**');
        console.log('```json');
        console.log(JSON.stringify({
            id: "550e8400-e29b-41d4-a716-446655440001",
            amount: -125.50,
            currency: "ZAR",
            type: "Debit",
            description: "Grocery shopping - Fresh produce",
            reference: "PUR-20241029-PNP001",
            
            // Enhanced fields
            senderName: "Emma Johnson",
            senderAccountNumber: "1335066315",
            recipientName: "Pick n Pay Hypermarket",
            recipientAccountNumber: "MERCHANT-PICK-N-PAY",
            transactionCategory: "purchase",
            merchantName: "Pick n Pay",
            
            timestamp: "2024-10-29T14:30:00.000Z",
            createdAt: "2024-10-29T14:30:00.000Z",
            
            account: {
                id: "groceries-account-uuid",
                accountNumber: "1335066315",
                accountType: "Groceries",
                balance: 25.10,
                owner: {
                    id: 13,
                    name: "Emma Johnson",
                    email: "dependent@demo.com"
                }
            }
        }, null, 2));
        console.log('```\n');

        // Smart Distribution Example
        console.log('**3. Smart Distribution Transaction:**');
        console.log('```json');
        console.log(JSON.stringify({
            id: "550e8400-e29b-41d4-a716-446655440002",
            amount: 75.60,
            currency: "ZAR",
            type: "Credit",
            description: "Smart distribution to Groceries account",
            reference: "DIST-20241029-GRC001",
            
            // Enhanced fields
            senderName: "Emma Johnson",
            senderAccountNumber: "6472659461",
            recipientName: "Emma Johnson",
            recipientAccountNumber: "1335066315",
            transactionCategory: "smart_distribution",
            merchantName: null,
            
            timestamp: "2024-10-29T12:20:00.000Z",
            createdAt: "2024-10-29T12:20:00.000Z",
            
            account: {
                id: "groceries-account-uuid",
                accountNumber: "1335066315",
                accountType: "Groceries", 
                balance: 151.20,
                owner: {
                    id: 13,
                    name: "Emma Johnson",
                    email: "dependent@demo.com"
                }
            }
        }, null, 2));
        console.log('```\n');

        console.log('🎯 **Key Enhancements:**');
        console.log('- `senderName` & `recipientName`: Clear identification of money source/destination');
        console.log('- `senderAccountNumber` & `recipientAccountNumber`: Account numbers for full traceability');
        console.log('- `transactionCategory`: Purpose-based categorization for better organization');
        console.log('- `merchantName`: Store/business name for purchases');
        console.log('- Enhanced `description`: More descriptive transaction details');

        console.log('\n💡 **Frontend Display Benefits:**');
        console.log('- Clear "From → To" transaction flow');
        console.log('- Merchant identification for purchases');
        console.log('- Category-based filtering and grouping');
        console.log('- Professional bank-style statements');
        console.log('- Complete audit trail for all transactions');

    } catch (error) {
        console.error('❌ Error generating response:', error);
    }
}

generateEnhancedTransactionResponse();