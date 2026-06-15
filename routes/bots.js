const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/templates', async (req, res) => {
  try {
    const templates = [
      { id: 1, name: 'NightFury Standard', description: 'Full featured bot', commands: 100 },
      { id: 2, name: 'NightFury Lite', description: 'Essential features only', commands: 50 },
      { id: 3, name: 'NightFury Enterprise', description: 'Full customization', commands: 200 }
    ];
    res.status(200).json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

router.get('/commands', auth, async (req, res) => {
  try {
    const commands = [
      { name: 'help', description: 'Show help menu' },
      { name: 'menu', description: 'Show main menu' },
      { name: 'owner', description: 'Show owner info' },
      { name: 'ping', description: 'Bot latency' },
      { name: 'status', description: 'Bot status' }
    ];
    res.status(200).json({ success: true, commands });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch commands' });
  }
});

module.exports = router;
