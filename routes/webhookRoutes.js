const express = require('express');
const router = express.Router();
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Ensure this is set in your .env file


//Webhook endpoint to listen for events from Stripe
router.post('/webhoook', (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = Stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!');
            break;
        case 'payment_method.attached':
            const paymentMethod = event.data.object;
            console.log('PaymentMethod was attached to a Customer!');
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    //Handle the event
    
    /*if(event.type === 'payment_intent.succeeded'){
    //     const paymentIntent = event.data.object;
    //     const{accountType, AccountId} = paymentIntent.metadata;
    } */



    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
});

module.exports = router;