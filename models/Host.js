const mongoose = require('mongoose');

const hostSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  botName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['running', 'stopped', 'error', 'deploying'],
    default: 'stopped'
  },
  hostProvider: {
    type: String,
    enum: ['render', 'railway', 'heroku', 'custom'],
    default: 'render'
  },
  deploymentUrl: String,
  renderServiceId: String,
  whatsappPhoneNumber: String,
  sessionId: String,
  ownerNumbers: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  coinsPerMonth: {
    type: Number,
    default: 50
  },
  supportedCommands: {
    type: Number,
    default: 100
  },
  messageLimit: {
    type: Number,
    default: 10000
  },
  groupsSupported: {
    type: Number,
    default: 50
  },
  stats: {
    messagesProcessed: { type: Number, default: 0 },
    commandsUsed: { type: Number, default: 0 },
    groupsJoined: { type: Number, default: 0 },
    uptime: { type: Number, default: 0 },
    lastActive: Date,
    errorRate: { type: Number, default: 0 }
  },
  uptime: {
    type: Number,
    default: 0
  },
  cpu: {
    type: Number,
    default: 0
  },
  memory: {
    type: Number,
    default: 0
  },
  bandwidth: {
    type: Number,
    default: 0
  },
  config: {
    autoReply: { type: Boolean, default: true },
    antiSpam: { type: Boolean, default: true },
    antiLink: { type: Boolean, default: false },
    groupProtection: { type: Boolean, default: true },
    logsEnabled: { type: Boolean, default: true }
  },
  coinSpendingHistory: [{
    amount: Number,
    reason: String,
    date: { type: Date, default: Date.now }
  }],
  logs: [{
    timestamp: Date,
    level: String,
    message: String
  }],
  backups: [{
    filename: String,
    size: Number,
    createdAt: Date,
    expiresAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update timestamp
hostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Host', hostSchema);
