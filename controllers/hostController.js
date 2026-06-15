const Host = require('../models/Host');
const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');
const axios = require('axios');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getUser(id) {
  if (global.dbConnected) return User.findById(id);
  return global.inMemoryDB.findUserById(id);
}

async function getHostsByUser(userId) {
  if (global.dbConnected) return Host.find({ userId }).sort('-createdAt');
  return global.inMemoryDB.getHostsByUser(userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getHostById(id) {
  if (global.dbConnected) return Host.findById(id);
  return global.inMemoryDB.findHostById(id);
}

async function removeHost(id) {
  if (global.dbConnected) return Host.findByIdAndDelete(id);
  return global.inMemoryDB.deleteHost(id);
}

async function saveUser(user) {
  if (global.dbConnected) return user.save();
  return global.inMemoryDB.updateUser(user._id, user);
}

async function logTransaction(data) {
  if (global.dbConnected) {
    const txn = new CoinTransaction(data);
    await txn.save();
    return txn;
  }
  return global.inMemoryDB.createCoinTransaction(data);
}

async function deployToRender(host, user) {
  if (!process.env.RENDER_API_KEY) return;
  try {
    // Build env vars for the bot — SESSION_ID is required for WhatsApp auth
    const envVars = [
      { key: 'NODE_ENV',      value: 'production' },
      { key: 'BOT_NAME',      value: host.botName },
      { key: 'HOST_ID',       value: String(host._id) },
      // Suppress puppeteer download (not needed by NightFuryBot)
      { key: 'PUPPETEER_SKIP_DOWNLOAD',          value: 'true' },
      { key: 'PUPPETEER_SKIP_CHROMIUM_DOWNLOAD', value: 'true' },
    ];

    if (host.sessionId)    envVars.push({ key: 'SESSION_ID',    value: host.sessionId });
    if (host.ownerNumbers) {
      const owners = Array.isArray(host.ownerNumbers)
        ? host.ownerNumbers.join(',')
        : String(host.ownerNumbers);
      if (owners) envVars.push({ key: 'OWNER_NUMBER', value: owners });
    }
    if (host.openaiKey)    envVars.push({ key: 'OPENAI_KEY',    value: host.openaiKey });

    const response = await axios.post(
      'https://api.render.com/v1/services',
      {
        // background_worker so Render doesn't kill it for missing HTTP port
        type: 'background_worker',
        name: ('nightfury-' + host.botName + '-' + host._id)
          .toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 63),
        ownerId: process.env.RENDER_OWNER_ID,
        // Use the repo the user specified, fall back to the official NightFuryBot repo
        repo: host.gitRepo || 'https://github.com/ntando-deeev/NightFuryBot',
        branch: host.gitBranch || 'main',
        // Skip puppeteer download during build too
        buildCommand: 'PUPPETEER_SKIP_DOWNLOAD=true PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install',
        startCommand: 'npm start',
        envVars,
      },
      { headers: { Authorization: 'Bearer ' + process.env.RENDER_API_KEY } }
    );

    // Render v1 returns { service: {...} }
    const svc = response.data && (response.data.service || response.data);
    const serviceId = svc && svc.id;
    if (serviceId) {
      const updates = {
        renderServiceId: serviceId,
        status: 'running',
        deployUrl: svc.serviceDetails && svc.serviceDetails.url
          ? svc.serviceDetails.url
          : 'https://dashboard.render.com/worker/' + serviceId,
      };
      if (global.dbConnected) {
        await Host.findByIdAndUpdate(host._id, updates);
      } else {
        global.inMemoryDB.updateHost(host._id, updates);
      }
    }
  } catch (err) {
    console.error('Render deploy error:', err.response ? JSON.stringify(err.response.data) : err.message);
    // Mark host as failed so user can see it rather than spinning forever
    const failUpdate = { status: 'error', errorMessage: err.message };
    if (global.dbConnected) {
      await Host.findByIdAndUpdate(host._id, failUpdate).catch(() => {});
    } else {
      global.inMemoryDB.updateHost(host._id, failUpdate);
    }
  }
}

async function deleteFromRender(host) {
  if (!process.env.RENDER_API_KEY || !host.renderServiceId) return;
  try {
    await axios.delete(
      'https://api.render.com/v1/services/' + host.renderServiceId,
      { headers: { Authorization: 'Bearer ' + process.env.RENDER_API_KEY } }
    );
  } catch (err) {
    console.error('Render delete error:', err.message);
  }
}

exports.createHost = async (req, res) => {
  try {
    const { botName, hostProvider, whatsappPhoneNumber, ownerNumbers, sessionId, openaiKey, gitRepo, gitBranch } = req.body;
    const userId = req.user.id;

    if (!botName || !hostProvider) {
      return res.status(400).json({ error: 'Bot name and provider are required' });
    }

    const user = await getUser(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hosts = await getHostsByUser(userId);
    const maxHosts = user.maxHosts || 1;

    if (hosts.length >= maxHosts) {
      return res.status(400).json({
        error: 'You have reached your host limit (' + maxHosts + ')',
        maxHosts,
        currentHosts: hosts.length,
      });
    }

    const coinCost = 50;
    if ((user.coins || 0) < coinCost) {
      return res.status(400).json({
        error: 'Insufficient coins. You need ' + coinCost + ' coins but have ' + (user.coins || 0),
        coinsNeeded: coinCost,
        coinsAvailable: user.coins || 0,
      });
    }

    // Normalise ownerNumbers — accept comma string or array
    const normaliseOwners = (raw) => {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw.map(s => String(s).trim()).filter(Boolean);
      return String(raw).split(',').map(s => s.trim()).filter(Boolean);
    };

    // Normalise git repo URL — strip trailing slashes and .git suffix for consistency
    const normaliseRepo = (raw) => {
      if (!raw || !raw.trim()) return 'https://github.com/ntando-deeev/NightFuryBot';
      return raw.trim().replace(/\.git$/, '').replace(/\/$/, '');
    };

    let host;
    if (global.dbConnected) {
      host = new Host({
        name: botName,
        userId,
        botName,
        hostProvider,
        whatsappPhoneNumber,
        ownerNumbers: normaliseOwners(ownerNumbers),
        sessionId: sessionId || '',
        openaiKey: openaiKey || '',
        gitRepo: normaliseRepo(gitRepo),
        gitBranch: (gitBranch || 'main').trim(),
        status: 'deploying',
      });
      await host.save();
    } else {
      host = global.inMemoryDB.createHost({
        name: botName,
        userId: parseInt(userId) || userId,
        botName,
        hostProvider,
        whatsappPhoneNumber,
        ownerNumbers: normaliseOwners(ownerNumbers),
        sessionId: sessionId || '',
        openaiKey: openaiKey || '',
        gitRepo: normaliseRepo(gitRepo),
        gitBranch: (gitBranch || 'main').trim(),
        status: 'deploying',
      });
    }

    user.coins = (user.coins || 0) - coinCost;
    user.totalCoinsSpent = (user.totalCoinsSpent || 0) + coinCost;
    user.totalHostsCreated = (user.totalHostsCreated || 0) + 1;
    await saveUser(user);

    await logTransaction({
      userId: parseInt(userId) || userId,
      type: 'spent',
      amount: coinCost,
      description: 'Host deployment: ' + botName,
      hostId: host._id,
      status: 'completed',
    });

    if (hostProvider === 'render') {
      deployToRender(host, user).catch(console.error);
    } else {
      if (global.dbConnected) {
        await Host.findByIdAndUpdate(host._id, { status: 'running' });
      } else {
        global.inMemoryDB.updateHost(host._id, { status: 'running' });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Host created successfully',
      host,
      coinsDeducted: coinCost,
      remainingCoins: user.coins,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create host', message: error.message });
  }
};

exports.getHosts = async (req, res) => {
  try {
    const hosts = await getHostsByUser(req.user.id);
    res.status(200).json({ success: true, count: hosts.length, hosts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hosts', message: error.message });
  }
};

exports.getHost = async (req, res) => {
  try {
    const host = await getHostById(req.params.hostId);
    if (!host) return res.status(404).json({ error: 'Host not found' });
    if (String(host.userId) !== String(req.user.id)) return res.status(403).json({ error: 'Unauthorized' });
    res.status(200).json({ success: true, host });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch host', message: error.message });
  }
};

exports.updateHost = async (req, res) => {
  try {
    const { config, whatsappPhoneNumber, ownerNumbers } = req.body;
    let host = await getHostById(req.params.hostId);
    if (!host) return res.status(404).json({ error: 'Host not found' });
    if (String(host.userId) !== String(req.user.id)) return res.status(403).json({ error: 'Unauthorized' });

    if (global.dbConnected) {
      if (config) host.config = Object.assign({}, host.config, config);
      if (whatsappPhoneNumber) host.whatsappPhoneNumber = whatsappPhoneNumber;
      if (ownerNumbers) host.ownerNumbers = ownerNumbers;
      host.updatedAt = Date.now();
      await host.save();
    } else {
      const updates = {};
      if (config) updates.config = config;
      if (whatsappPhoneNumber) updates.whatsappPhoneNumber = whatsappPhoneNumber;
      if (ownerNumbers) updates.ownerNumbers = ownerNumbers;
      host = global.inMemoryDB.updateHost(host._id, updates);
    }

    res.status(200).json({ success: true, message: 'Host updated successfully', host });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update host', message: error.message });
  }
};

exports.deleteHost = async (req, res) => {
  try {
    const host = await getHostById(req.params.hostId);
    if (!host) return res.status(404).json({ error: 'Host not found' });
    if (String(host.userId) !== String(req.user.id)) return res.status(403).json({ error: 'Unauthorized' });

    if (host.renderServiceId) await deleteFromRender(host);
    await removeHost(req.params.hostId);

    res.status(200).json({ success: true, message: 'Host deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete host', message: error.message });
  }
};

exports.startHost = async (req, res) => {
  try {
    const host = await getHostById(req.params.hostId);
    if (!host) return res.status(404).json({ error: 'Host not found' });
    if (String(host.userId) !== String(req.user.id)) return res.status(403).json({ error: 'Unauthorized' });

    if (global.dbConnected) { host.status = 'running'; await host.save(); }
    else { global.inMemoryDB.updateHost(host._id, { status: 'running' }); }

    res.status(200).json({ success: true, message: 'Host started', host });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start host', message: error.message });
  }
};

exports.stopHost = async (req, res) => {
  try {
    const host = await getHostById(req.params.hostId);
    if (!host) return res.status(404).json({ error: 'Host not found' });
    if (String(host.userId) !== String(req.user.id)) return res.status(403).json({ error: 'Unauthorized' });

    if (global.dbConnected) { host.status = 'stopped'; await host.save(); }
    else { global.inMemoryDB.updateHost(host._id, { status: 'stopped' }); }

    res.status(200).json({ success: true, message: 'Host stopped', host });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop host', message: error.message });
  }
};

exports.getHostStats = async (req, res) => {
  try {
    const host = await getHostById(req.params.hostId);
    if (!host) return res.status(404).json({ error: 'Host not found' });
    if (String(host.userId) !== String(req.user.id)) return res.status(403).json({ error: 'Unauthorized' });

    res.status(200).json({
      success: true,
      stats: {
        status: host.status,
        messagesProcessed: (host.stats && host.stats.messagesProcessed) || 0,
        uptime: (host.stats && host.stats.uptime) || 0,
        lastActive: (host.stats && host.stats.lastActive) || host.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch host stats', message: error.message });
  }
};
