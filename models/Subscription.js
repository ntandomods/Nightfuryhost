const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tier: {
    type: String,
    enum: ['free', 'starter', 'pro', 'enterprise'],
    default: 'free'
  },
  price: {
    type: Number,
    default: 0
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active'
  },
  stripeSubscriptionId: String,
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  renewalDate: Date,
  autoRenew: {
    type: Boolean,
    default: true
  },
  features: {
    maxHosts: { type: Number, default: 1 },
    coinsPerMonth: { type: Number, default: 100 },
    prioritySupport: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    webhookSupport: { type: Boolean, default: false },
    whiteLabel: { type: Boolean, default: false }
  },
  cancellationReason: String,
  cancelledAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
