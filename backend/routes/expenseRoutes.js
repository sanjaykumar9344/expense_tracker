// ============================================================
// expenseRoutes.js — API Route Definitions
// ============================================================
// This file maps HTTP method + URL path → Controller function.
//
// Think of routes as the "address book" of the API:
//   GET  /api/expenses        → getAllExpenses
//   GET  /api/expenses/1      → getExpenseById
//   POST /api/expenses        → createExpense
//   PUT  /api/expenses/1      → updateExpense
//   DELETE /api/expenses/1   → deleteExpense
//   GET  /api/dashboard       → getDashboardStats
// ============================================================

const express    = require('express');
const router     = express.Router(); // Creates a mini Express app for routing
const controller = require('../controllers/expenseController');

// ─────────────────────────────────────────────
// Dashboard Stats Route
// ─────────────────────────────────────────────
// GET /api/dashboard
// Must be defined BEFORE /api/expenses/:id to avoid
// 'dashboard' being interpreted as an :id parameter
router.get('/dashboard', controller.getDashboardStats);

// ─────────────────────────────────────────────
// Expense CRUD Routes
// ─────────────────────────────────────────────

// READ ALL — fetch every expense (with optional search/filter)
router.get('/expenses', controller.getAllExpenses);

// READ ONE — fetch a single expense by ID
router.get('/expenses/:id', controller.getExpenseById);

// CREATE — add a new expense
router.post('/expenses', controller.createExpense);

// UPDATE — edit an existing expense by ID
router.put('/expenses/:id', controller.updateExpense);

// DELETE — remove an expense by ID
router.delete('/expenses/:id', controller.deleteExpense);

module.exports = router;
