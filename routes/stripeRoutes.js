const express = require('express');
const router = express.Router();
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const stripeController = require('../controllers/stripeController');

router.post('create-payment-intent', stripeController.createPaymentIntent);

//Card payments
router.post('/create-payment-intent', async (req, res) => {
    try{
        const { amount} = req.body;
        
        if(!amount || amount < 2000){
            return res.status(400).json({error: 'The minimum amount allowed is R20.00'});
        }

        const paymentIntent = await Stripe.paymentIntents.create({
            amount,
            currency: 'ZAR',
            payment_method_types: ['card'],
           
        });

        res.status(200).json({
            message: 'Payment intent created successfully',
            clientSecret: paymentIntent.client_secret,
            
    });
}catch(error){
    res.status(500).json({
        error: 'Failed to create card payment intent',
        details: error.message,
    });

}

});

//Bank Transfer

router.post('/bank-transfer', async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount < 2000) {
            return res.status(400).json({ error: 'The minimum amount allowed is R20.00' });
        }

        const paymentIntent = await Stripe.paymentIntents.create({
            amount,
            currency: 'ZAR',
            payment_method_types: ['bank_transfer'],
            payment_method_options:{
                bank_transfer: {
                    type: 'za_bank_transfer',
                    // Specify the bank account details here
                    requested_destination: 'account',
                },

            }
           
        });

        res.status(200).json({
            message: 'Bank transfer payment intent created successfully',
            clientSecret: paymentIntent.client_secret,
            bankTransferInstructions: paymentIntent.next_action?.bank_transfer_instructions,
        });

    } catch (error) {
        res.status(500).json({
            error: 'Failed to create bank transfer payment intent',
            details: error.message,
        });
    }

});

module.exports = router;