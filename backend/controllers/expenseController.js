// ============================================================
// expenseController.js — Business Logic for CRUD Operations
// ============================================================
// Each function here handles ONE specific API operation.
// The controller talks to MySQL and sends back the result.
//
// Flow:  Route → Controller → MySQL → Response
// ============================================================

const db = require('../db'); // Import the database connection pool

// ─────────────────────────────────────────────
// VALID VALUES for category and payment_method
// ─────────────────────────────────────────────
const VALID_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Education', 'Entertainment', 'Bills', 'Other'];
const VALID_PAYMENTS    = ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Bank Transfer'];

// ─────────────────────────────────────────────
// HELPER: Validate expense input fields
// Returns an array of error messages (empty = valid)
// ─────────────────────────────────────────────
function validateExpense(data) {
  const errors = [];
  const { title, amount, category, expense_date, payment_method } = data;

  if (!title || title.trim() === '') {
    errors.push('Title cannot be empty.');
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.push('Amount must be a number greater than 0.');
  }

  if (!category || !VALID_CATEGORIES.includes(category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}.`);
  }

  if (!expense_date || isNaN(Date.parse(expense_date))) {
    errors.push('A valid date is required.');
  }

  if (!payment_method || !VALID_PAYMENTS.includes(payment_method)) {
    errors.push(`Payment method must be one of: ${VALID_PAYMENTS.join(', ')}.`);
  }

  return errors;
}

// ============================================================
// READ ALL — GET /api/expenses
// ============================================================
// Fetches all expenses from MySQL.
// Supports optional query parameters for search, filter, sort.
//
// Query params:
//   ?search=groceries        → filter by title (LIKE)
//   ?category=Food           → filter by category
//   ?payment_method=Cash     → filter by payment method
//   ?sort_by=amount          → sort field (amount or expense_date)
//   ?sort_order=DESC         → sort direction
// ============================================================
const getAllExpenses = async (req, res) => {
  try {
    const { search, category, payment_method, sort_by, sort_order } = req.query;

    // Start building the SQL query
    let sql    = 'SELECT * FROM expenses WHERE 1=1';
    let params = []; // Values that will replace the ? placeholders

    // Add filters dynamically based on query parameters
    if (search) {
      sql += ' AND title LIKE ?';
      params.push(`%${search}%`); // LIKE '%keyword%' matches anywhere in the title
    }

    if (category && VALID_CATEGORIES.includes(category)) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (payment_method && VALID_PAYMENTS.includes(payment_method)) {
      sql += ' AND payment_method = ?';
      params.push(payment_method);
    }

    // Add sorting (whitelist allowed columns to prevent SQL injection)
    const allowedSortFields = ['amount', 'expense_date', 'title', 'created_at'];
    const sortField  = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDir    = sort_order === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortField} ${sortDir}`;

    // Execute the query
    const [rows] = await db.query(sql, params);

    // Send the results as JSON
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    console.error('getAllExpenses error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching expenses.' });
  }
};

// ============================================================
// READ ONE — GET /api/expenses/:id
// ============================================================
// Fetches a single expense by its ID.
// ============================================================
const getExpenseById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Validate that :id is a valid positive integer
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid expense ID. ID must be a positive number.' });
    }

    const [rows] = await db.query('SELECT * FROM expenses WHERE id = ?', [id]);

    // If no rows returned, the expense doesn't exist
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Expense with ID ${id} not found.` });
    }

    res.status(200).json({ success: true, data: rows[0] });

  } catch (error) {
    console.error('getExpenseById error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching expense.' });
  }
};

// ============================================================
// CREATE — POST /api/expenses
// ============================================================
// Inserts a new expense into MySQL.
// Validates all required fields before inserting.
// ============================================================
const createExpense = async (req, res) => {
  try {
    const { title, amount, category, description, expense_date, payment_method } = req.body;

    // Run validation — if there are errors, return 400 with the error list
    const errors = validateExpense({ title, amount, category, expense_date, payment_method });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // INSERT the new record into the database
    // The ? placeholders prevent SQL injection
    const sql = `
      INSERT INTO expenses (title, amount, category, description, expense_date, payment_method)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      title.trim(),
      parseFloat(amount),
      category,
      description ? description.trim() : null, // description is optional
      expense_date,
      payment_method
    ];

    const [result] = await db.query(sql, values);

    // result.insertId is the auto-generated ID of the new row
    res.status(201).json({
      success: true,
      message: 'Expense added successfully!',
      data: { id: result.insertId, ...values }
    });

  } catch (error) {
    console.error('createExpense error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating expense.' });
  }
};

// ============================================================
// UPDATE — PUT /api/expenses/:id
// ============================================================
// Updates an existing expense by ID.
// Validates that the expense exists before updating.
// ============================================================
const updateExpense = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid expense ID.' });
    }

    // Check if the expense exists first
    const [existing] = await db.query('SELECT id FROM expenses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Expense with ID ${id} not found.` });
    }

    const { title, amount, category, description, expense_date, payment_method } = req.body;

    // Validate the updated data
    const errors = validateExpense({ title, amount, category, expense_date, payment_method });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // UPDATE the record
    const sql = `
      UPDATE expenses
      SET title = ?, amount = ?, category = ?, description = ?, expense_date = ?, payment_method = ?
      WHERE id = ?
    `;
    const values = [
      title.trim(),
      parseFloat(amount),
      category,
      description ? description.trim() : null,
      expense_date,
      payment_method,
      id
    ];

    await db.query(sql, values);

    res.status(200).json({ success: true, message: 'Expense updated successfully!' });

  } catch (error) {
    console.error('updateExpense error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating expense.' });
  }
};

// ============================================================
// DELETE — DELETE /api/expenses/:id
// ============================================================
// Deletes an expense by ID.
// Returns 404 if the expense doesn't exist.
// ============================================================
const deleteExpense = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid expense ID.' });
    }

    // Check if the expense exists
    const [existing] = await db.query('SELECT id FROM expenses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Expense with ID ${id} not found.` });
    }

    // DELETE the record
    await db.query('DELETE FROM expenses WHERE id = ?', [id]);

    res.status(200).json({ success: true, message: 'Expense deleted successfully!' });

  } catch (error) {
    console.error('deleteExpense error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting expense.' });
  }
};

// ============================================================
// DASHBOARD STATS — GET /api/dashboard
// ============================================================
// Returns aggregate statistics calculated from the database.
// Uses SQL aggregate functions: SUM, COUNT, MAX, AVG.
// ============================================================
const getDashboardStats = async (req, res) => {
  try {
    const sql = `
      SELECT
        COALESCE(SUM(amount), 0)   AS total_amount,
        COUNT(*)                    AS total_count,
        COALESCE(MAX(amount), 0)   AS highest_expense,
        COALESCE(AVG(amount), 0)   AS average_expense
      FROM expenses
    `;

    const [rows] = await db.query(sql);

    res.status(200).json({
      success: true,
      data: {
        total_amount:     parseFloat(rows[0].total_amount).toFixed(2),
        total_count:      rows[0].total_count,
        highest_expense:  parseFloat(rows[0].highest_expense).toFixed(2),
        average_expense:  parseFloat(rows[0].average_expense).toFixed(2)
      }
    });

  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching stats.' });
  }
};

// Export all controller functions so routes can use them
module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getDashboardStats
};
