// ============================================================
// db.js — Database Connection
// ============================================================
// This file creates a MySQL connection POOL.
// A pool keeps multiple connections ready so the server can
// handle many requests at the same time efficiently.
//
// We use mysql2 (not mysql) because it:
// - Supports Promises (async/await)
// - Is faster and more modern
// ============================================================

const mysql = require('mysql2');
require('dotenv').config(); // Load variables from .env file

// Create a connection pool using environment variables
const pool = mysql.createPool({
  host:     process.env.DB_HOST,     // e.g. 'localhost'
  port:     process.env.DB_PORT,     // e.g. 3306
  user:     process.env.DB_USER,     // e.g. 'root'
  password: process.env.DB_PASSWORD, // Your MySQL password
  database: process.env.DB_NAME,     // 'expense_tracker'
  waitForConnections: true,          // Wait if all connections are busy
  connectionLimit: 10,               // Max 10 simultaneous connections
  queueLimit: 0                      // Unlimited queue
});

// .promise() converts the pool to use async/await (Promises)
// instead of old-style callbacks
const promisePool = pool.promise();

// Test the connection when the server starts
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Check your .env credentials and make sure MySQL is running.');
    return;
  }
  console.log('✅ Connected to MySQL database:', process.env.DB_NAME);
  connection.release(); // Release the connection back to the pool
});

// Export the promise-based pool so controllers can use it
module.exports = promisePool;
