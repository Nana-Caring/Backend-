module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        accountId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Accounts',
                key: 'id'
            }
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('Debit', 'Credit'),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        reference: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        // Enhanced fields for better transaction clarity
        senderName: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Name of the person/entity sending money'
        },
        senderAccountNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Account number money is coming from'
        },
        recipientName: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Name of the person receiving money'
        },
        recipientAccountNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Account number money is going to'
        },
        transactionCategory: {
            type: DataTypes.ENUM(
                'fund_transfer', 
                'purchase', 
                'allowance', 
                'emergency_fund',
                'smart_distribution', 
                'manual_transfer', 
                'refund', 
                'fee',
                'deposit',
                'withdrawal'
            ),
            allowNull: true,
            comment: 'Category of transaction for better organization'
        },
        merchantName: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'For purchases - name of store/merchant'
        }
    }, {
        tableName: 'Transactions',
        timestamps: true
    });

    Transaction.associate = (models) => {
        Transaction.belongsTo(models.Account, {
            foreignKey: 'accountId',
            as: 'account',
            onDelete: 'CASCADE'
        });
    };

    return Transaction;
};
