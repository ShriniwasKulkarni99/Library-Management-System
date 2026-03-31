const app = require('./app');
const { validateEnv } = require('./config/env');

validateEnv();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Library API running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => process.exit(0));
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
