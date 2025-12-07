// Vercel Serverless Function - Create Stripe Payment Intent
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Product details
    const PRODUCT_NAME = 'Reflections Of You';
    const PRODUCT_PRICE = 32400; // $324.00 in cents
    const CURRENCY = 'usd';

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: PRODUCT_PRICE,
      currency: CURRENCY,
      description: PRODUCT_NAME,
      automatic_payment_methods: {
        enabled: true, // Enables Apple Pay, Google Pay, and other payment methods
      },
      metadata: {
        product_name: PRODUCT_NAME,
        integration_source: 'coloring_with_gray',
      },
    });

    // Return the client secret
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      productName: PRODUCT_NAME,
      amount: PRODUCT_PRICE,
      currency: CURRENCY,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
};
