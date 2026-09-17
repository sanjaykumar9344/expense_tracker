# 💸 Expense Tracker — CRUD Application

A beginner-friendly full-stack **CRUD** application built to learn:
- **C**reate → Add expenses
- **R**ead → View expenses  
- **U**pdate → Edit expenses
- **D**elete → Remove expenses

## 🛠️ Tech Stack

| Layer    | Technology         |
|----------|--------------------|
| Frontend | HTML, CSS, JavaScript |
| Backend  | Node.js + Express.js |
| Database | MySQL              |
| API      | REST API (fetch)   |

## 📁 Project Structure

```
expense-tracker/
├── frontend/
│   ├── index.html      # Main UI
│   ├── style.css       # Dark theme styling
│   └── script.js       # fetch() API calls
│
├── backend/
│   ├── server.js           # Express app entry point
│   ├── db.js               # MySQL connection pool
│   ├── .env                # DB credentials (NOT in GitHub)
│   ├── .env.example        # Template for .env
│   ├── routes/
│   │   └── expenseRoutes.js    # API route definitions
│   └── controllers/
│       └── expenseController.js # CRUD logic
│
└── database/
    └── schema.sql      # MySQL table setup
```

## 🚀 Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/expense-tracker.git
cd expense-tracker
```

### 2. Set up the database
```bash
mysql -u root -p < database/schema.sql
```

### 3. Configure environment variables
```bash
cd backend
cp .env.example .env
# Edit .env and fill in your MySQL credentials
```

### 4. Install backend dependencies
```bash
cd backend
npm install
```

### 5. Start the backend server
```bash
npm run dev
```

### 6. Open the frontend
Open `frontend/index.html` in your browser.

## 📡 REST API Endpoints

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | `/api/expenses`       | Get all expenses     |
| GET    | `/api/expenses/:id`   | Get one expense      |
| POST   | `/api/expenses`       | Create new expense   |
| PUT    | `/api/expenses/:id`   | Update expense       |
| DELETE | `/api/expenses/:id`   | Delete expense       |
| GET    | `/api/dashboard`      | Get stats            |

## 📊 Features

- ✅ Full CRUD operations
- ✅ Dashboard with total, count, highest & average
- ✅ Search by title
- ✅ Filter by category & payment method
- ✅ Sort by date or amount
- ✅ Form validation (frontend + backend)
- ✅ Toast notifications
- ✅ Responsive dark-theme UI
