module.exports = (sequelize, DataTypes) => {
  const FunderDependent = sequelize.define('FunderDependent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    funderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dependentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    customName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Custom name/alias that funder gives to the dependent for easy identification'
    }
  });

  FunderDependent.associate = function(models) {
    // FunderDependent belongs to User (funder)
    FunderDependent.belongsTo(models.User, {
      foreignKey: 'funderId',
      as: 'funder'
    });

    // FunderDependent belongs to User (dependent)
    FunderDependent.belongsTo(models.User, {
      foreignKey: 'dependentId',
      as: 'dependent'
    });
  };

  return FunderDependent;
};