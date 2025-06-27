const Account = require('../models/Account');
const SubAccount = require('../models/SubAccount');

async function distributeFunds(req, res){
    const transaction = await sequelize.transaction();
   try{
    const mainAccountId = req.params.mainAccountId;
    const mainAccount = await Account.findByPk(mainAccountId,{
        include: [{ model: SubAccount}],
    });

    if(!mainAccount){
        transaction.rollback();
        return res.status(404).json({ message: 'Main account not found' });
    }
    const availableBalance = mainAccount.balance - mainAccount.minBalance;

    if(availableBalance <= 0){
        transaction.rollback();
        return res.status(400).json({ message: 'Insuffient funds' });
    }

    for(const SubAccount of mainAccount.SubAccounts){

        const distributionAmount = availableBalance * (SubAccount.percentage / 100);

        mainAccount.balance -= distributionAmount;
        SubAccount.balance += distributionAmount;
        await mainAccount.save({transaction});
        await SubAccount.save({transaction});
    
    };

    await transaction.commit();

    res.json({message: 'Funds distributed successfully'});
}
catch(error){
    await transaction.rollback();
    res.status(500).json({ message: 'Error distributing funds'});

}
 async function receiveFunds(req, res) {
    try{
        const mainAccountId = req.params.mainAccountId;
        const amount = req.body.amount;

        const mainAccount = await Account.findByPk(mainAccountId);
        
        if(!mainAccount){
            return res.status(404).json({ message: 'Main account not found' });
        }

        mainAccount.balance += amount;
        
        await mainAccount.save();

        distributeFundsInternally(mainAccountId);

        res.json({ message: 'Funds received successfully' });
    } catch(error){
        res.status(500).json({ message: 'Error receiving funds' });
    }
    
 }
  async function distributeFundsInternally(mainAccountId) {
    const mainAccount = await Account.findByPk(mainAccountId, {
        include: [{ model: SubAccount }],
    });

    const availableBalance = mainAccount.balance - mainAccount.minBalance;

    if (availableBalance <= 0) {
        return;
    }
    mainAccount.SubAccounts.forEach(async (subAccount) => {
        const distributionAmount = availableBalance * (subAccount.percentage / 100);

        mainAccount.balance -= distributionAmount;
        subAccount.balance += distributionAmount;

        await mainAccount.save();
        await subAccount.save();
    });
    module.exports = {distributeFunds, receiveFunds};
    
  }
}



   
