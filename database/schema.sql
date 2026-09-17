-- ============================================================
-- Expense Tracker Database Schema
-- Run this file to set up the database and table
-- Command: mysql -u root -p < database/schema.sql
-- ============================================================

-- Create the database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS expense_tracker;

-- Switch to the expense_tracker database
USE expense_tracker;

-- Drop the table if it exists (for clean re-runs during development)
DROP TABLE IF EXISTS expenses;

-- Create the expenses table
CREATE TABLE expenses (
  id             INT            NOT NULL AUTO_INCREMENT,  -- Unique ID for each expense
  title          VARCHAR(100)   NOT NULL,                 -- Short name for the expense
  amount         DECIMAL(10,2)  NOT NULL,                 -- Amount spent (e.g. 250.75)
  category       VARCHAR(50)    NOT NULL,                 -- Category: Food, Travel, etc.
  description    VARCHAR(255)   DEFAULT NULL,             -- Optional description
  expense_date   DATE           NOT NULL,                 -- Date of the expense
  payment_method VARCHAR(50)    NOT NULL,                 -- Cash, UPI, Card, etc.
  created_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP, -- Auto-set when row is inserted

  PRIMARY KEY (id)
);

-- ============================================================
-- Verify the table was created successfully
-- ============================================================
DESCRIBE expenses;
