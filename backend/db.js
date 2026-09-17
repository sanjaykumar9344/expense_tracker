// ============================================================
// db.js — Database Connection (SQLite - No Password Required!)
// ============================================================
// We switched from MySQL to SQLite so you can run the app
// with ZERO configuration — no password, no server needed.
//
// SQLite stores everything in a single file: expenses.db
// It works exactly like MySQL for CRUD operations.
//
// The SQL syntax (INSERT, SELECT, UPDATE, DELETE) is identical!
// ============================================================

const Database = require('better-sqlite3');
const path     = require('path');

// The database file will be created automatically in the backend folder
const dbPath = path.join(__dirname, 'expenses.db');

// Open (or create) the SQLite database file
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// ─────────────────────────────────────────────
// CREATE THE TABLE if it doesn't exist yet
// This runs once when the server starts
// ─────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id             INTEGER       PRIMARY KEY AUTOINCREMENT,
    title          TEXT          NOT NULL,
    amount         REAL          NOT NULL,
    category       TEXT          NOT NULL,
    description    TEXT,
    expense_date   TEXT          NOT NULL,
    payment_method TEXT          NOT NULL,
    created_at     TEXT          DEFAULT (datetime('now','localtime'))
  )
`);

console.log('✅ SQLite database ready — file: expenses.db (no password needed!)');

// ============================================================
// ADAPTER: Make SQLite work with the same interface as mysql2
// ============================================================
// mysql2 uses: db.query(sql, params) → returns [rows]
// SQLite uses: db.prepare(sql).all(params) or .run(params)
//
// This adapter wraps SQLite in a promise-based interface
// so we don't need to change any controller code!
// ============================================================
const adapter = {
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      try {
        const upperSQL = sql.trim().toUpperCase();

        if (upperSQL.startsWith('SELECT') || upperSQL.startsWith('DESCRIBE')) {
          // SELECT → use .all() to get all rows
          const stmt = db.prepare(sql);
          const rows = params.length > 0 ? stmt.all(params) : stmt.all();
          resolve([rows]); // Return [rows] like mysql2 does
        } else {
          // INSERT / UPDATE / DELETE → use .run()
          const stmt = db.prepare(sql);
          const result = params.length > 0 ? stmt.run(params) : stmt.run();
          // Mimic mysql2's result object
          resolve([{
            insertId:    result.lastInsertRowid,
            affectedRows: result.changes
          }]);
        }
      } catch (err) {
        reject(err);
      }
    });
  }
};

module.exports = adapter;
