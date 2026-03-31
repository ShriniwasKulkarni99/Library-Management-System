const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const path         = require('path');
const { validateEnv } = require('./config/env');
const { pingDb } = require('./config/db');
const { hasCloudinaryConfig } = require('./services/storage.service');

const errorHandler = require('./middlewares/error.middleware');

// Route modules
const authRoutes      = require('./routes/auth.routes');
const usersRoutes     = require('./routes/users.routes');
const booksRoutes     = require('./routes/books.routes');
const issuesRoutes    = require('./routes/issues.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

validateEnv();

const app = express();

// ── Security ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// ── Logging ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Body parsing ──────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files (local uploaded images only) ─────────────
if (!hasCloudinaryConfig()) {
  app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_PATH || 'uploads/profiles')));
}

// ── API routes ────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/users',     usersRoutes);
app.use('/api/books',     booksRoutes);
app.use('/api/issues',    issuesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/ready', async (_req, res) => {
  try {
    await pingDb();
    res.json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'not_ready',
      database: 'disconnected',
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ── 404 ───────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// ── Global error handler ──────────────────────────────────
app.use(errorHandler);

module.exports = app;
