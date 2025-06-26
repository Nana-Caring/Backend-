router.post("/spend", authenticate, authorize(["Caregiver", "Dependent"]), async (req, res) => {
    const { accountId, amount } = req.body;
    
    const account = await Account.findByPk(accountId);
    if (!account || account.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
  
    account.balance -= amount;
    await account.save();
  
    await Transaction.create({ accountId, amount, type: "Debit" });
    
    res.json({ message: "Transaction successful!", account });
  });
  