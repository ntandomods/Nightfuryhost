const express = require('express');
const auth = require('../middleware/auth');
const Stripe = require('stripe');

// Lazy-initialize Stripe so a missing key doesn't crash startup
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const router = express.Router();

router.get('/methods', auth, async (req, res) => {
  try {
    const stripe = getStripe();
    const paymentMethods = await stripe.paymentMethods.list({
      customer: req.user.id,
      type: 'card'
    });

    res.status(200).json({
      success: true,
      methods: paymentMethods.data
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      console.log('Payment succeeded:', event.data.object);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    res.status(400).send('Webhook Error: ' + error.message);
  }
});

module.exports = router;
