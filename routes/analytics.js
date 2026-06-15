const express = require('express');
const auth = require('../middleware/auth');
const Host = require('../models/Host');

const router = express.Router();

router.get('/overview', auth, async (req, res) => {
  try {
    const hosts = await Host.find({ userId: req.user.id });

    const overview = {
      totalHosts: hosts.length,
      activeHosts: hosts.filter(h => h.status === 'running').length,
      totalMessages: hosts.reduce((sum, h) => sum + (h.stats?.messagesProcessed || 0), 0),
      totalCommands: hosts.reduce((sum, h) => sum + (h.stats?.commandsUsed || 0), 0),
      averageUptime: hosts.length > 0 
        ? hosts.reduce((sum, h) => sum + (h.stats?.uptime || 0), 0) / hosts.length 
        : 0
    };

    res.status(200).json({ success: true, overview });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.get('/host/:hostId', auth, async (req, res) => {
  try {
    const host = await Host.findById(req.params.hostId);

    if (!host || host.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.status(200).json({
      success: true,
      analytics: {
        messages: host.stats?.messagesProcessed || 0,
        commands: host.stats?.commandsUsed || 0,
        uptime: host.stats?.uptime || 0,
        groups: host.stats?.groupsJoined || 0,
        errorRate: host.stats?.errorRate || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
