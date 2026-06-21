const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { generalLimiter } = require('./middleware/rateLimiters');

const app = express();

// Trust the first proxy hop (needed for correct rate-limiting/IP detection behind
// Render/Railway/Heroku-style platforms that sit behind a load balancer)
app.set('trust proxy', 1);

// Middleware
const allowedOrigin = process.env.CLIENT_URL || '*';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '100kb' }));
app.use(generalLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));

// Health check
app.get('/', (req, res) => {
  res.send('AI Job Tracker API Running! 🚀');
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// 404 handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ msg: 'Route not found' });
});

// Centralized error handler (catches anything thrown/rejected and not already handled)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ msg: 'Something went wrong on our end' });
});

module.exports = app;
