const mongoose = require('mongoose');

const coinTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'spent', 'refund', 'bonus', 'penalty'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host'
  },
  paymentMethodId: String,
  stripeTransactionId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

// Create index for faster queries
coinTransactionSchema.index({ userId: 1, createdAt: -1 });
coinTransactionSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('CoinTransaction', coinTransactionSchema);
