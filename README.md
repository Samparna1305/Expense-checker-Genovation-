# SpendSmart — Expense Tracker

A full-stack personal finance application with income/expense tracking, analytics, and CSV export.

## Tech Stack

**Frontend:** React.js, Tailwind CSS, Chart.js, Axios  
**Backend:** Node.js, Express.js, MongoDB (Mongoose)  
**Auth:** JWT (JSON Web Tokens)

---

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v16 or higher
- [MongoDB Compass](https://www.mongodb.com/products/compass) (already installed)
- MongoDB Community Server running locally on port 27017

### Start MongoDB (if not running)

Open MongoDB Compass and connect to: `mongodb://localhost:27017`

---

## Project Structure

```
expense-tracker/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   └── analytics.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/        (Login, Register)
│   │   │   ├── charts/      (MonthlyChart, CategoryChart)
│   │   │   ├── dashboard/   (SummaryCards, RecentTransactions, AnalyticsPage)
│   │   │   ├── layout/      (Navbar)
│   │   │   └── transactions/(TransactionList, TransactionForm)
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── categories.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── API_DOCUMENTATION.md
└── README.md
```

---

## Setup Instructions

### Step 1: Clone / Extract the Project

Extract the zip file to a folder, e.g., `C:\Projects\expense-tracker`

### Step 2: Setup Backend

Open a terminal in VS Code (`Ctrl + ` ` or Terminal > New Terminal):

```bash
cd backend
npm install
```

The `.env` file is pre-configured. Review and update if needed:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense_tracker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

Start the backend server:

```bash
# For development (with auto-reload)
npm run dev

# OR for production
npm start
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on http://localhost:5000
```

### Step 3: Setup Frontend

Open a **second terminal** in VS Code:

```bash
cd frontend
npm install
npm start
```

The app will open automatically at `http://localhost:3000`

---

## Usage

1. **Register** — Create a new account with name, email, and password
2. **Login** — Sign in with your credentials
3. **Dashboard** — View summary cards, monthly chart, and recent transactions
4. **Transactions** — Add, edit, delete transactions with category filters
5. **Analytics** — Deep dive into monthly trends and category breakdowns
6. **Export** — Download your transactions as CSV

---

## Features

- Dark-themed, responsive UI
- Secure authentication with JWT
- Add income and expense transactions with 19 categories
- Filter by type, category, and date range
- Monthly bar and line charts
- Category-wise doughnut charts
- Savings rate calculation
- CSV export with filters
- Pagination for large datasets

---

## Troubleshooting

**MongoDB not connecting?**
- Open MongoDB Compass and connect to `mongodb://localhost:27017`
- Make sure MongoDB service is running in Windows Services

**Port 5000 already in use?**
- Change `PORT=5001` in `backend/.env`

**npm install fails?**
- Delete `node_modules` folder and try again
- Make sure Node.js is installed: `node -v`

**Frontend shows blank page?**
- Make sure backend is running first
- Check the browser console for errors
