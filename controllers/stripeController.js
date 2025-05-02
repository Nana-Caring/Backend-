const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
    const {amount} = req.body;

    if(!amount || amount < 2000){
        return res.status(400).json({message: 'The minimum amount allowed is R20.00'});
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'ZAR',
        payment_method_types: ['card'],
    });

    res.json({clientSecret: paymentIntent.client_secret});

};

module.exports = { createPaymentIntent };