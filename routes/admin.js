const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Host = require('../models/Host');
const CoinTransaction = require('../models/CoinTransaction');

// ─── All admin routes require adminAuth ───────────────────────────────────────
router.use(adminAuth);

// ─── Dashboard stats ─────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    let totalUsers, totalHosts, activeHosts, totalTransactions, recentUsers;

    if (global.dbConnected) {
      totalUsers = await User.countDocuments();
      totalHosts = await Host.countDocuments();
      activeHosts = await Host.countDocuments({ status: 'running' });
      totalTransactions = await CoinTransaction.countDocuments();
      recentUsers = await User.find().sort('-createdAt').limit(5).select('-password');
    } else {
      const users = global.inMemoryDB.getAllUsers();
      const hosts = global.inMemoryDB.getAllHosts();
      totalUsers = users.length;
      totalHosts = hosts.length;
      activeHosts = hosts.filter(h => h.status === 'running').length;
      totalTransactions = 0;
      recentUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    }

    res.json({
      success: true,
      stats: { totalUsers, totalHosts, activeHosts, totalTransactions },
      recentUsers
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats', message: err.message });
  }
});

// ─── Users management ────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    let users;
    if (global.dbConnected) {
      users = await User.find().sort('-createdAt').select('-password');
    } else {
      users = global.inMemoryDB.getAllUsers().map(u => {
        const { password: _p, ...safe } = u;
        return safe;
      });
    }
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', message: err.message });
  }
});

router.get('/users/:userId', async (req, res) => {
  try {
    let user;
    if (global.dbConnected) {
      user = await User.findById(req.params.userId).select('-password');
    } else {
      user = global.inMemoryDB.findUserById(req.params.userId);
    }
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user', message: err.message });
  }
});

router.put('/users/:userId', async (req, res) => {
  try {
    const { tier, coins, isAdmin, subscriptionStatus, maxHosts } = req.body;
    const updates = {};
    if (tier !== undefined) updates.tier = tier;
    if (coins !== undefined) updates.coins = coins;
    if (isAdmin !== undefined) updates.isAdmin = isAdmin;
    if (subscriptionStatus !== undefined) updates.subscriptionStatus = subscriptionStatus;
    if (maxHosts !== undefined) updates.maxHosts = maxHosts;

    let user;
    if (global.dbConnected) {
      user = await User.findByIdAndUpdate(req.params.userId, updates, { new: true }).select('-password');
    } else {
      user = global.inMemoryDB.updateUser(req.params.userId, updates);
    }
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user', message: err.message });
  }
});

router.delete('/users/:userId', async (req, res) => {
  try {
    if (String(req.params.userId) === String(req.user.id)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    if (global.dbConnected) {
      await User.findByIdAndDelete(req.params.userId);
      await Host.deleteMany({ userId: req.params.userId });
    } else {
      // In-memory: just mark as deleted (no hard delete method yet)
      global.inMemoryDB.updateUser(req.params.userId, { deleted: true });
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user', message: err.message });
  }
});

// ─── Bonus coins ─────────────────────────────────────────────────────────────
router.post('/users/:userId/bonus-coins', async (req, res) => {
  try {
    const { amount, reason } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid coin amount required' });

    let user;
    if (global.dbConnected) {
      user = await User.findByIdAndUpdate(
        req.params.userId,
        { $inc: { coins: amount } },
        { new: true }
      );
    } else {
      user = global.inMemoryDB.findUserById(req.params.userId);
      if (user) {
        user = global.inMemoryDB.updateUser(req.params.userId, { coins: (user.coins || 0) + amount });
      }
    }
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Log it
    if (global.dbConnected) {
      const CoinTransaction = require('../models/CoinTransaction');
      await new CoinTransaction({
        userId: req.params.userId,
        type: 'bonus',
        amount,
        description: reason || 'Admin bonus',
        status: 'completed'
      }).save();
    } else {
      global.inMemoryDB.createCoinTransaction({
        userId: parseInt(req.params.userId) || req.params.userId,
        type: 'bonus',
        amount,
        description: reason || 'Admin bonus',
        status: 'completed'
      });
    }

    res.json({ success: true, message: amount + ' coins added', newBalance: user.coins });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add coins', message: err.message });
  }
});

// ─── Suspend / unsuspend user ────────────────────────────────────────────────
router.post('/users/:userId/suspend', async (req, res) => {
  try {
    const { suspended } = req.body;
    const status = suspended ? 'suspended' : 'active';
    let user;
    if (global.dbConnected) {
      user = await User.findByIdAndUpdate(req.params.userId, { subscriptionStatus: status }, { new: true });
    } else {
      user = global.inMemoryDB.updateUser(req.params.userId, { subscriptionStatus: status });
    }
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, message: 'User ' + (suspended ? 'suspended' : 'unsuspended'), user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status', message: err.message });
  }
});

// ─── All hosts ────────────────────────────────────────────────────────────────
router.get('/hosts', async (req, res) => {
  try {
    let hosts;
    if (global.dbConnected) {
      hosts = await Host.find().sort('-createdAt');
    } else {
      hosts = global.inMemoryDB.getAllHosts();
    }
    res.json({ success: true, count: hosts.length, hosts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hosts', message: err.message });
  }
});

router.delete('/hosts/:hostId', async (req, res) => {
  try {
    if (global.dbConnected) {
      await Host.findByIdAndDelete(req.params.hostId);
    } else {
      global.inMemoryDB.deleteHost(req.params.hostId);
    }
    res.json({ success: true, message: 'Host deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete host', message: err.message });
  }
});

// ─── Promote user to admin ───────────────────────────────────────────────────
router.post('/users/:userId/make-admin', async (req, res) => {
  try {
    let user;
    if (global.dbConnected) {
      user = await User.findByIdAndUpdate(req.params.userId, { isAdmin: true }, { new: true });
    } else {
      user = global.inMemoryDB.updateUser(req.params.userId, { isAdmin: true });
    }
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, message: 'User promoted to admin', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to promote user', message: err.message });
  }
});

// ─── Seed admin (first-time setup) ──────────────────────────────────────────
router.post('/seed', async (req, res) => {
  // Allow only if no admin exists yet - not protected by adminAuth for initial setup
  res.status(404).json({ error: 'Use /api/admin/init-admin for initial setup' });
});

module.exports = router;
