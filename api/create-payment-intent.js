// Vercel Serverless Function - Create Stripe Payment Intent

module.exports = async (req, res) => {
  // Check if Stripe secret key is available
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY environment variable is not set');
    res.status(500).json({
      error: 'Stripe configuration error',
      details: 'STRIPE_SECRET_KEY environment variable is not set'
    });
    return;
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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

    // Check if it's a Stripe authentication error
    if (error.type === 'StripeAuthenticationError' || error.statusCode === 401) {
      res.status(401).json({
        error: 'Stripe authentication failed',
        type: 'authentication_error',
        details: 'Invalid API key. Make sure STRIPE_SECRET_KEY in Vercel matches your live publishable key (pk_live_...)',
        hint: 'Go to Stripe Dashboard > API Keys and copy the correct live secret key'
      });
      return;
    }

    res.status(500).json({
      error: error.message,
      type: error.type || 'unknown',
      details: error.raw ? error.raw.message : 'No additional details',
      statusCode: error.statusCode
    });
  }
};
