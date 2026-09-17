// ============================================================
// server.js — Express Application Entry Point
// ============================================================
// This is the main file that starts the backend server.
//
// What it does:
//   1. Loads environment variables from .env
//   2. Creates an Express app
//   3. Sets up middleware (CORS, JSON parsing)
//   4. Mounts the API routes at /api
//   5. Starts listening on the configured port
// ============================================================

require('dotenv').config(); // MUST be first — loads .env variables

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const routes  = require('./routes/expenseRoutes');

// Create the Express application
const app  = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// MIDDLEWARE
// Middleware runs on every request before reaching routes
// ─────────────────────────────────────────────

// CORS — Cross-Origin Resource Sharing
// Allows the frontend (running at file:// or a different port)
// to make API calls to this backend without being blocked by the browser
app.use(cors());

// JSON Body Parser
// Parses incoming request bodies as JSON
// Without this, req.body would be undefined in POST/PUT routes
app.use(express.json());

// URL-Encoded Body Parser (for form submissions)
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// ROUTES
// Mount all API routes under the /api prefix
// So a route defined as /expenses becomes /api/expenses
// ─────────────────────────────────────────────
app.use('/api', routes);

// ─────────────────────────────────────────────
// SERVE FRONTEND (Static Files)
// In production (Railway), serve the frontend folder
// so both frontend and backend run from one URL
// ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Serve index.html for the root route
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'frontend', 'index.html');
  const fs = require('fs');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  // Fallback API info if no frontend folder
  res.json({
    message: '✅ Expense Tracker API is running!',
    version: '1.0.0',
    endpoints: {
      'GET  /api/expenses':        'Get all expenses',
      'GET  /api/expenses/:id':    'Get one expense by ID',
      'POST /api/expenses':        'Create a new expense',
      'PUT  /api/expenses/:id':    'Update an expense',
      'DELETE /api/expenses/:id':  'Delete an expense',
      'GET  /api/dashboard':       'Get dashboard statistics'
    }
  });
});

// ─────────────────────────────────────────────
// 404 HANDLER — For unknown routes
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// This catches any unhandled errors from route handlers
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
});

// ─────────────────────────────────────────────
// START THE SERVER
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Expense Tracker Backend Started!');
  console.log(`   Server running at: http://localhost:${PORT}`);
  console.log(`   API base URL:      http://localhost:${PORT}/api`);
  console.log('');
  console.log('📋 Available Endpoints:');
  console.log(`   GET    http://localhost:${PORT}/api/expenses`);
  console.log(`   GET    http://localhost:${PORT}/api/expenses/:id`);
  console.log(`   POST   http://localhost:${PORT}/api/expenses`);
  console.log(`   PUT    http://localhost:${PORT}/api/expenses/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/expenses/:id`);
  console.log(`   GET    http://localhost:${PORT}/api/dashboard`);
  console.log('');
});
