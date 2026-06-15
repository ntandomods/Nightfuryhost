const Host = require('../models/Host');
const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');
const axios = require('axios');

exports.createHost = async (req, res) => {
  try {
    const { botName, hostProvider, whatsappPhoneNumber, ownerNumbers } = req.body;
    const userId = req.user.id;

    // Validation
    if (!botName || !hostProvider) {
      return res.status(400).json({ error: 'Bot name and provider are required' });
    }

    // Check user's host limit
    const user = await User.findById(userId);
    const hostCount = await Host.countDocuments({ userId });

    if (hostCount >= user.maxHosts) {
      return res.status(400).json({
        error: `You have reached your host limit (${user.maxHosts})`,
        maxHosts: user.maxHosts,
        currentHosts: hostCount
      });
    }

    // Check if user has enough coins
    const coinCost = 50; // Initial deployment cost
    if (user.coins < coinCost) {
      return res.status(400).json({
        error: `Insufficient coins. You need ${coinCost} coins but have ${user.coins}`,
        coinsNeeded: coinCost,
        coinsAvailable: user.coins
      });
    }

    // Create host
    const host = new Host({
      name: botName,
      userId,
      botName,
      hostProvider,
      whatsappPhoneNumber,
      ownerNumbers: ownerNumbers || [],
      status: 'deploying'
    });

    await host.save();

    // Deduct coins
    user.coins -= coinCost;
    user.totalCoinsSpent += coinCost;
    user.totalHostsCreated += 1;
    await user.save();

    // Log transaction
    const transaction = new CoinTransaction({
      userId,
      type: 'spent',
      amount: coinCost,
      description: `Host deployment: ${botName}`,
      hostId: host._id,
      status: 'completed'
    });
    await transaction.save();

    // Deploy to Render (or other provider)
    if (hostProvider === 'render') {
      await deployToRender(host, user);
    }

    res.status(201).json({
      success: true,
      message: 'Host created successfully',
      host,
      coinsDeducted: coinCost,
      remainingCoins: user.coins
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create host', message: error.message });
  }
};

exports.getHosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const hosts = await Host.find({ userId }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: hosts.length,
      hosts
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hosts', message: error.message });
  }
};

exports.getHost = async (req, res) => {
  try {
    const { hostId } = req.params;
    const host = await Host.findById(hostId);

    if (!host) {
      return res.status(404).json({ error: 'Host not found' });
    }

    // Check authorization
    if (host.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.status(200).json({
      success: true,
      host
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch host', message: error.message });
  }
};

exports.updateHost = async (req, res) => {
  try {
    const { hostId } = req.params;
    const { config, whatsappPhoneNumber, ownerNumbers } = req.body;

    let host = await Host.findById(hostId);

    if (!host) {
      return res.status(404).json({ error: 'Host not found' });
    }

    // Check authorization
    if (host.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (config) host.config = { ...host.config, ...config };
    if (whatsappPhoneNumber) host.whatsappPhoneNumber = whatsappPhoneNumber;
    if (ownerNumbers) host.ownerNumbers = ownerNumbers;

    host.updatedAt = Date.now();
    await host.save();

    res.status(200).json({
      success: true,
      message: 'Host updated successfully',
      host
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update host', message: error.message });
  }
};

exports.deleteHost = async (req, res) => {
  try {
    const { hostId } = req.params;
    const host = await Host.findById(hostId);

    if (!host) {
      return res.status(404).json({ error: 'Host not found' });
    }

    // Check authorization
    if (host.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete from Render if deployed
    if (host.renderServiceId) {
      await deleteFromRender(host);
    }

    await Host.findByIdAndDelete(hostId);

    res.status(200).json({
      success: true,
      message: 'Host deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete host', message: error.message });
  }
};

exports.startHost = async (req, res) => {
  try {
    const { hostId } = req.params;
    let host = await Host.findById(hostId);

    if (!host) {
      return res.status(404).json({ error: 'Host not found' });
    }

    if (host.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    host.status = 'running';
    host.stats.lastActive = new Date();
    await host.save();

    res.status(200).json({
      success: true,
      message: 'Host started successfully',
      host
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start host', message: error.message });
  }
};

exports.stopHost = async (req, res) => {
  try {
    const { hostId } = req.params;
    let host = await Host.findById(hostId);

    if (!host) {
      return res.status(404).json({ error: 'Host not found' });
    }

    if (host.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    host.status = 'stopped';
    await host.save();

    res.status(200).json({
      success: true,
      message: 'Host stopped successfully',
      host
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop host', message: error.message });
  }
};

exports.getHostStats = async (req, res) => {
  try {
    const { hostId } = req.params;
    const host = await Host.findById(hostId);

    if (!host) {
      return res.status(404).json({ error: 'Host not found' });
    }

    if (host.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.status(200).json({
      success: true,
      stats: host.stats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats', message: error.message });
  }
};

// Helper functions
async function deployToRender(host, user) {
  try {
    const renderApiKey = process.env.RENDER_API_KEY;
    
    const deploymentData = {
      name: `nightfury-${host._id}`,
      environmentId: 'env_' + host._id,
      serviceDetails: {
        env: 'node',
        buildCommand: 'npm install',
        startCommand: 'npm start',
        envVars: [
          { key: 'BOT_NAME', value: host.botName },
          { key: 'OWNER_NUMBERS', value: host.ownerNumbers.join(',') }
        ]
      }
    };

    // This is a mock - replace with actual Render API call
    host.deploymentUrl = `https://nightfury-${host._id}.onrender.com`;
    host.renderServiceId = `srv_${host._id}`;
    await host.save();

  } catch (error) {
    console.error('Render deployment error:', error);
    host.status = 'error';
    await host.save();
  }
}

async function deleteFromRender(host) {
  try {
    // Mock deletion - replace with actual Render API call
    console.log(`Deleting service ${host.renderServiceId}`);
  } catch (error) {
    console.error('Render deletion error:', error);
  }
}

module.exports = exports;
