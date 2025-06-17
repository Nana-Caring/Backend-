const Account = require('../models/Account');
const Beneficiary = require('../models/Beneficiary');
const FunderBeneficiary = require('../models/FunderBeneficiary');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.sendFunds = async (req, res) => {
    try {
        const { funderId, beneficiaryId, accountNumber, amount } = req.body;

        // Check if the beneficiary exists
        const beneficiary = await Beneficiary.findOne({ where: { id: beneficiaryId } });
        if (!beneficiary) {
            return res.status(404).json({ error: 'Beneficiary not found' });
        }

        // Check if the beneficiary is linked to the funder
        const association = await FunderBeneficiary.findOne({ where: { funderId, beneficiaryId } });
        if (!association) {
            return res.status(403).json({ error: 'Beneficiary not associated with funder' });
        }

        // Check if the account exists and belongs to the beneficiary
        const account = await Account.findOne({ where: { accountNumber, userId: beneficiaryId } });
        if (!account) {
            return res.status(404).json({ error: 'Account not found for this beneficiary' });
        }

        // Create payment intent with account number in metadata
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'zar',
            metadata: { account_number: accountNumber }
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                const accountNumber = paymentIntent.metadata.account_number;
                const amount = paymentIntent.amount / 100;

                try {
                    const account = await Account.findOne({ where: { accountNumber } });
                    if (!account) {
                        console.error(`Account ${accountNumber} not found.`);
                        return res.status(404).end();
                    }
                    account.balance += amount;
                    await account.save();
                    console.log(`Payment succeeded for account: ${accountNumber}, Amount: ${amount}`);
                } catch (err) {
                    console.error('Database error:', err.message);
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook Error:', err.message);
        res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
};