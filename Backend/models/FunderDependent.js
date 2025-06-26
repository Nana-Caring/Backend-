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
    }
  });

  return FunderDependent;
};