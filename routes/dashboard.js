const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Host = require('../models/Host');
const CoinTransaction = require('../models/CoinTransaction');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let user, hosts, transactions;

    if (global.dbConnected) {
      user = await User.findById(req.user.id);
      hosts = await Host.find({ userId: req.user.id });
      transactions = await CoinTransaction.find({ userId: req.user.id })
        .limit(10)
        .sort('-createdAt');
    } else {
      user = global.inMemoryDB.findUserById(req.user.id);
      hosts = global.inMemoryDB.getHostsByUser(req.user.id);
      transactions = global.inMemoryDB.getTransactionsByUser
        ? global.inMemoryDB.getTransactionsByUser(req.user.id).slice(0, 10)
        : [];
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    const stats = {
      coins: user.coins || 0,
      hosts: hosts.length,
      activeHosts: hosts.filter(h => h.status === 'running').length,
      totalSpent: user.totalCoinsSpent || 0,
      tier: user.tier || 'free',
      recentTransactions: transactions
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard', message: error.message });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    let user, hosts;

    if (global.dbConnected) {
      user = await User.findById(req.user.id);
      hosts = await Host.find({ userId: req.user.id });
    } else {
      user = global.inMemoryDB.findUserById(req.user.id);
      hosts = global.inMemoryDB.getHostsByUser(req.user.id);
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    const totalMessages = hosts.reduce((sum, h) => sum + (h.stats?.messagesProcessed || 0), 0);
    const totalUptime = hosts.reduce((sum, h) => sum + (h.stats?.uptime || 0), 0);

    const summary = {
      user: {
        username: user.username,
        email: user.email,
        tier: user.tier || 'free',
        coins: user.coins || 0
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
    res.status(500).json({ error: 'Failed to fetch summary', message: error.message });
  }
});

module.exports = router;
