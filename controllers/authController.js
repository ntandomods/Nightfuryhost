const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Lazy email transporter — only created when SMTP is actually configured
const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return null;
  }
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // port 465 uses SSL, everything else uses STARTTLS
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    let user;

    if (global.dbConnected) {
      // Use MongoDB
      user = await User.findOne({ $or: [{ email }, { username }] });
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }

      user = new User({
        username,
        email,
        password,
        coins: 100
      });

      await user.save();
    } else {
      // Use In-Memory DB
      const bcrypt = require('bcryptjs');
      
      if (global.inMemoryDB.findUserByEmail(email) || global.inMemoryDB.findUserByUsername(username)) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = global.inMemoryDB.createUser({
        username,
        email,
        password: hashedPassword,
        coins: 100,
        tier: 'free'
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        tier: user.tier
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const bcrypt = require('bcryptjs');

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let user;

    if (global.dbConnected) {
      // Use MongoDB
      user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      user.loginHistory.push({
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      if (user.loginHistory.length > 10) {
        user.loginHistory.shift();
      }

      await user.save();
    } else {
      // Use In-Memory DB
      user = global.inMemoryDB.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        tier: user.tier || 'free',
        isAdmin: user.isAdmin || false
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    let user;
    if (global.dbConnected) {
      user = await User.findById(req.user.id);
    } else {
      user = global.inMemoryDB.findUserById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        tier: user.tier || 'free',
        isAdmin: user.isAdmin || false,
        profileImage: user.profileImage || null,
        phoneNumber: user.phoneNumber || null,
        subscriptionStatus: user.subscriptionStatus || 'inactive'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user', message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, phoneNumber, profileImage } = req.body;

    let user;
    if (global.dbConnected) {
      user = await User.findByIdAndUpdate(
        req.user.id,
        { username, phoneNumber, profileImage, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );
    } else {
      user = global.inMemoryDB.updateUser(req.user.id, { username, phoneNumber, profileImage });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        tier: user.tier || 'free'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile', message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password', message: error.message });
  }
};

exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
