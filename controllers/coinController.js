const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');
const Stripe = require('stripe');

// Lazy-initialize Stripe so missing key doesn't crash startup
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// Coin pricing
const COIN_PACKAGES = {
  starter: { coins: 100, price: 4.99 },
  basic: { coins: 500, price: 19.99 },
  standard: { coins: 1000, price: 34.99 },
  premium: { coins: 2500, price: 79.99 },
  ultimate: { coins: 5000, price: 139.99 }
};

exports.getCoinsPackages = async (req, res) => {
  try {
    const packages = Object.entries(COIN_PACKAGES).map(([key, value]) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      coins: value.coins,
      price: value.price,
      pricePerCoin: (value.price / value.coins).toFixed(4),
      bonus: key === 'ultimate' ? '20% bonus' : key === 'premium' ? '10% bonus' : 'No bonus'
    }));

    res.status(200).json({
      success: true,
      packages
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packages', message: error.message });
  }
};

exports.getUserCoins = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      coins: user.coins,
      totalSpent: user.totalCoinsSpent,
      tier: user.tier
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coins', message: error.message });
  }
};

exports.purchaseCoins = async (req, res) => {
  try {
    const { packageId } = req.body;
    const userId = req.user.id;

    if (!COIN_PACKAGES[packageId]) {
      return res.status(400).json({ error: 'Invalid package' });
    }

    const packageData = COIN_PACKAGES[packageId];

    // Create Stripe payment intent
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(packageData.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId,
        packageId,
        coins: packageData.coins
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: packageData.price,
      coins: packageData.coins
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create payment intent', message: error.message });
  }
};

exports.confirmCoinPurchase = async (req, res) => {
  try {
    const { paymentIntentId, packageId } = req.body;
    const userId = req.user.id;

    // Verify payment with Stripe
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const packageData = COIN_PACKAGES[packageId];
    const coinsToAdd = packageData.coins;

    // Update user coins
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { coins: coinsToAdd } },
      { new: true }
    );

    // Create transaction record
    const transaction = new CoinTransaction({
      userId,
      type: 'purchase',
      amount: coinsToAdd,
      description: `Purchased ${coinsToAdd} coins (${packageId} package)`,
      stripeTransactionId: paymentIntentId,
      status: 'completed',
      completedAt: new Date()
    });

    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Coins purchased successfully',
      coinsAdded: coinsToAdd,
      totalCoins: user.coins
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to confirm purchase', message: error.message });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, skip = 0 } = req.query;

    const transactions = await CoinTransaction.find({ userId })
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await CoinTransaction.countDocuments({ userId });

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions', message: error.message });
  }
};

exports.addBonusCoins = async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;

    // Admin only
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { coins: amount } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const transaction = new CoinTransaction({
      userId,
      type: 'bonus',
      amount,
      description: reason || 'Bonus coins added by admin',
      status: 'completed',
      completedAt: new Date()
    });

    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Bonus coins added',
      user,
      transaction
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add bonus', message: error.message });
  }
};

exports.refundCoins = async (req, res) => {
  try {
    const { transactionId, reason } = req.body;
    const userId = req.user.id;

    // Admin only
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const transaction = await CoinTransaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Refund coins
    const user = await User.findByIdAndUpdate(
      transaction.userId,
      { $inc: { coins: transaction.amount } },
      { new: true }
    );

    // Update transaction
    transaction.status = 'refunded';
    await transaction.save();

    // Create refund transaction
    const refundTransaction = new CoinTransaction({
      userId: transaction.userId,
      type: 'refund',
      amount: transaction.amount,
      description: `Refund for transaction ${transactionId}: ${reason}`,
      status: 'completed',
      completedAt: new Date()
    });

    await refundTransaction.save();

    res.status(200).json({
      success: true,
      message: 'Coins refunded successfully',
      user,
      refundTransaction
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refund coins', message: error.message });
  }
};

exports.getCoinStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    const transactions = await CoinTransaction.find({ userId });

    const stats = {
      currentCoins: user.coins,
      totalSpent: user.totalCoinsSpent,
      totalPurchased: transactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0),
      totalBonus: transactions
        .filter(t => t.type === 'bonus')
        .reduce((sum, t) => sum + t.amount, 0),
      transactionCount: transactions.length
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats', message: error.message });
  }
};

module.exports = exports;
