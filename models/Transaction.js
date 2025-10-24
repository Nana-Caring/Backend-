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
            type: DataTypes.ENUM('Debit', 'Credit', 'deposit', 'transfer_out', 'transfer_in'),
            allowNull: false
        },
        balanceAfter: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
            allowNull: false,
            defaultValue: 'completed'
        },
        recipientAccountId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Accounts',
                key: 'id'
            }
        },
        senderAccountId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Accounts',
                key: 'id'
            }
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

        // Association for recipient account in transfers
        Transaction.belongsTo(models.Account, {
            foreignKey: 'recipientAccountId',
            as: 'recipientAccount',
            onDelete: 'SET NULL'
        });

        // Association for sender account in transfers
        Transaction.belongsTo(models.Account, {
            foreignKey: 'senderAccountId',
            as: 'senderAccount',
            onDelete: 'SET NULL'
        });
    };

    return Transaction;
};
