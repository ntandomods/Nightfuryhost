const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Host = require('../models/Host');
const CoinTransaction = require('../models/CoinTransaction');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const hosts = await Host.find({ userId: req.user.id });
    const transactions = await CoinTransaction.find({ userId: req.user.id })
      .limit(10)
      .sort('-createdAt');

    const stats = {
      coins: user.coins,
      hosts: hosts.length,
      activeHosts: hosts.filter(h => h.status === 'running').length,
      totalSpent: user.totalCoinsSpent,
      tier: user.tier,
      recentTransactions: transactions
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const hosts = await Host.find({ userId: req.user.id });

    const totalMessages = hosts.reduce((sum, h) => sum + (h.stats?.messagesProcessed || 0), 0);
    const totalUptime = hosts.reduce((sum, h) => sum + (h.stats?.uptime || 0), 0);

    const summary = {
      user: {
        username: user.username,
        email: user.email,
        tier: user.tier,
        coins: user.coins
      },
      hosts: {
        total: hosts.length,
        running: hosts.filter(h => h.status === 'running').length,
        stopped: hosts.filter(h => h.status === 'stopped').length,
        error: hosts.filter(h => h.status === 'error').length
      },
      performance: {
        totalMessages,
        totalUptime,
        averageUptime: hosts.length > 0 ? totalUptime / hosts.length : 0
      }
    };

    res.status(200).json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;
