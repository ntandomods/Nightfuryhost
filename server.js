const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const socketIo = require('socket.io');
const http = require('http');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST']
  }
});

// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const connectDB = require('./config/database');
const inMemoryDB = require('./config/inMemoryDB');

// Initialize globals before async resolution
global.dbConnected = false;
global.inMemoryDB = inMemoryDB;

connectDB().then(conn => {
  if (conn) {
    global.dbConnected = true;
    console.log('✅ Using MongoDB');
  } else {
    global.dbConnected = false;
    console.log('✅ Using In-Memory Database');
  }
}).catch(err => {
  global.dbConnected = false;
  console.error('DB Error:', err.message);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/hosts', require('./routes/hosts'));
app.use('/api/coins', require('./routes/coins'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/bots', require('./routes/bots'));
app.use('/api/analytics', require('./routes/analytics'));

// Admin routes
app.use('/api/admin', require('./routes/admin'));

// Init first admin — only works if no admin exists yet
app.post('/api/init-admin', async (req, res) => {
  try {
    const { email, password, secret } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (secret !== (process.env.ADMIN_INIT_SECRET || 'nightfury-init')) {
      return res.status(403).json({ error: 'Invalid secret' });
    }

    const bcrypt = require('bcryptjs');
    const jwt   = require('jsonwebtoken');

    if (global.dbConnected) {
      const User = require('./models/User');
      const existing = await User.findOne({ isAdmin: true });
      if (existing) return res.status(400).json({ error: 'Admin already exists' });
      // User model hashes password in pre-save hook — pass plain text
      const admin = new User({
        username: 'admin',
        email,
        password,
        isAdmin: true,
        coins: 9999,
        tier: 'enterprise',
        subscriptionStatus: 'active',
        maxHosts: 999
      });
      await admin.save();
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ success: true, message: 'Admin created', token });
    } else {
      const existing = global.inMemoryDB.getAllUsers().find(u => u.isAdmin);
      if (existing) return res.status(400).json({ error: 'Admin already exists' });
      const hashed = await bcrypt.hash(password, 10);
      const admin  = global.inMemoryDB.createUser({
        username: 'admin',
        email,
        password: hashed,
        isAdmin: true,
        coins: 9999,
        tier: 'enterprise',
        subscriptionStatus: 'active',
        maxHosts: 999
      });
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ success: true, message: 'Admin created (in-memory)', token });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to create admin', message: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Server is running',
    timestamp: new Date(),
    database: global.dbConnected ? 'MongoDB connected' : 'In-Memory DB (Demo Mode)',
    mode: global.dbConnected ? 'Production' : 'Demo'
  });
});

// Demo status endpoint
app.get('/demo-status', (req, res) => {
  if (global.dbConnected) {
    return res.status(200).json({
      mode: 'Production',
      database: 'MongoDB',
      info: 'Using persistent MongoDB database'
    });
  }

  res.status(200).json({
    mode: 'Demo',
    database: 'In-Memory',
    info: 'Running in demo mode without MongoDB',
    stats: global.inMemoryDB.getStats(),
    warning: 'Data will be lost on server restart. Set MONGODB_URI env var for persistent storage.'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    socket.emit('connection_status', { connected: true });
  });

  socket.on('host_update', (data) => {
    io.emit('host_status_updated', data);
  });

  socket.on('bot_status_change', (data) => {
    io.to(`user_${data.userId}`).emit('bot_status_changed', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 NightFury Hosting Platform running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
});

module.exports = { app, server, io };
