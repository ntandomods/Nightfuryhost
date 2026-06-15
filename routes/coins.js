const express = require('express');
const coinController = require('../controllers/coinController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/packages', coinController.getCoinsPackages);
router.get('/user/balance', auth, coinController.getUserCoins);
router.get('/stats', auth, coinController.getCoinStats);
router.get('/history', auth, coinController.getTransactionHistory);
router.post('/purchase', auth, coinController.purchaseCoins);
router.post('/confirm-purchase', auth, coinController.confirmCoinPurchase);
router.post('/bonus', auth, coinController.addBonusCoins);
router.post('/refund', auth, coinController.refundCoins);

module.exports = router;
