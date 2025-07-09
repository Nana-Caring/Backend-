module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        accountId: {
            type: DataTypes.INTEGER,
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
