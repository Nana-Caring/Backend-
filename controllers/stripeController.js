const Account = require('../models/Account');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'zar' } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: currency.toLowerCase(),
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Payment Intent Error:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
};

const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                // Handle successful payment
                const paymentIntent = event.data.object;

                const accountNumber = paymentIntent.metadata.account_number;
                const amount = paymentIntent.amount / 100; // Convert cents to ZAR

                try {
                    // Update the account balance in the database
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

module.exports = {
    createPaymentIntent,
    handleWebhook
};