router.post("/deposit", authenticate, authorize(["Funder"]), async (req, res) => {
    const { accountId, amount } = req.body;
    
    const account = await Account.findByPk(accountId);
    if (!account) return res.status(404).json({ error: "Account not found" });
  
    account.balance += amount;
    await account.save();
    
    res.json({ message: "Deposit successful!", account });
  });
  