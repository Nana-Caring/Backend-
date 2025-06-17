module.exports = (sequelize, DataTypes) => {
  const FunderBeneficiary = sequelize.define('FunderBeneficiary', {
    funderId: DataTypes.INTEGER,
    beneficiaryId: DataTypes.INTEGER,
  });
  return FunderBeneficiary;
};