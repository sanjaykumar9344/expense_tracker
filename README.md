# 💸 Expense Tracker — CRUD Application

A beginner-friendly full-stack **CRUD** application built to learn:
- **C**reate → Add expenses
- **R**ead → View all expenses
- **U**pdate → Edit existing expenses
- **D**elete → Remove expenses

## 🛠️ Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | HTML, CSS, JavaScript   |
| Backend  | Node.js + Express.js    |
| Database | SQLite (no password!)   |
| API      | REST API using fetch()  |

## 📁 Project Structure

```
expense-tracker/
├── frontend/
│   ├── index.html            # Main UI page
│   ├── style.css             # Dark theme styling
│   └── script.js             # All fetch() CRUD calls
│
├── backend/
│   ├── server.js             # Express app entry point
│   ├── db.js                 # SQLite connection (no password needed)
│   ├── .env                  # Config (not in GitHub)
│   ├── .env.example          # Template for .env
│   ├── railway.json          # Railway deployment config
│   ├── routes/
│   │   └── expenseRoutes.js  # REST API route definitions
│   └── controllers/
│       └── expenseController.js  # Full CRUD logic
│
└── database/
    └── schema.sql            # MySQL table reference
```

## 🚀 How to Run (Zero Setup!)

### 1. Clone the repository
```bash
git clone https://github.com/sanjaykumar9344/expense_tracker.git
cd expense_tracker
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Start the server
```bash
node server.js
```

### 4. Open the app
Open your browser and go to:
```
http://localhost:3000
```

> ✅ No MySQL needed! No password needed! The SQLite database (`expenses.db`) is created automatically.

## 📡 REST API Endpoints

| Method   | Endpoint              | Description           |
|----------|-----------------------|-----------------------|
| GET      | `/api/expenses`       | Get all expenses      |
| GET      | `/api/expenses/:id`   | Get one expense by ID |
| POST     | `/api/expenses`       | Create new expense    |
| PUT      | `/api/expenses/:id`   | Update expense        |
| DELETE   | `/api/expenses/:id`   | Delete expense        |
| GET      | `/api/dashboard`      | Get dashboard stats   |

## 💡 Expense Fields

| Field          | Type         | Description            |
|----------------|--------------|------------------------|
| id             | Integer      | Auto-generated ID      |
| title          | Text         | Expense name           |
| amount         | Decimal      | Amount spent (₹)       |
| category       | Text         | Food/Travel/Shopping…  |
| description    | Text         | Optional notes         |
| expense_date   | Date         | Date of expense        |
| payment_method | Text         | Cash/UPI/Card…         |

## 📊 Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Dashboard — Total, Count, Highest & Average expenses
- ✅ Search by expense title
- ✅ Filter by Category & Payment Method
- ✅ Sort by Date or Amount
- ✅ Form validation (frontend + backend)
- ✅ Toast notifications for success/error
- ✅ Responsive dark-theme UI
- ✅ No MySQL required — SQLite works out of the box

## 🧠 What I Learned

| Concept     | How it's used |
|-------------|---------------|
| CREATE      | `POST /api/expenses` → `INSERT INTO expenses` |
| READ        | `GET /api/expenses` → `SELECT * FROM expenses` |
| UPDATE      | `PUT /api/expenses/:id` → `UPDATE expenses SET …` |
| DELETE      | `DELETE /api/expenses/:id` → `DELETE FROM expenses WHERE id=?` |
| REST API    | Express.js routes with proper HTTP status codes |
| fetch()     | Browser JS calling the backend API |
| SQLite      | Lightweight database, zero configuration |

---

**Author:** sanjaykumar9344  
**Purpose:** Learning CRUD with Node.js + Express + SQLite
