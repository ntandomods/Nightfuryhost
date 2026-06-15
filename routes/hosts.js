const express = require('express');
const hostController = require('../controllers/hostController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post('/', hostController.createHost);
router.get('/', hostController.getHosts);
router.get('/:hostId', hostController.getHost);
router.put('/:hostId', hostController.updateHost);
router.delete('/:hostId', hostController.deleteHost);
router.post('/:hostId/start', hostController.startHost);
router.post('/:hostId/stop', hostController.stopHost);
router.get('/:hostId/stats', hostController.getHostStats);

module.exports = router;
