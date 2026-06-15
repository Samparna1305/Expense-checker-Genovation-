# SpendSmart API Documentation

**Base URL:** `http://localhost:5000/api`  
**Auth:** Bearer token in `Authorization` header  
**Content-Type:** `application/json`

---

## Authentication

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:** 400 (validation), 400 (email exists)

---

### POST /auth/login
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:** 400 (validation), 401 (wrong credentials)

---

### GET /auth/me
Get current authenticated user. **Requires Auth.**

**Response 200:**
```json
{
  "success": true,
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Transactions

All transaction routes require `Authorization: Bearer <token>` header.

### GET /transactions
Get paginated list of transactions with optional filters.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| type | string | `income` or `expense` |
| category | string | Category name |
| startDate | string | ISO date (YYYY-MM-DD) |
| endDate | string | ISO date (YYYY-MM-DD) |
| page | number | Page number (default: 1) |
| limit | number | Per page (default: 20) |
| sort | string | Field to sort by (default: `-date`) |

**Response 200:**
```json
{
  "success": true,
  "count": 15,
  "total": 47,
  "totalPages": 3,
  "currentPage": 1,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "user": "64f1a2b3c4d5e6f7a8b9c0d1",
      "title": "Monthly Salary",
      "amount": 50000,
      "type": "income",
      "category": "Salary",
      "description": "June salary",
      "date": "2024-06-01T00:00:00.000Z",
      "createdAt": "2024-06-01T08:00:00.000Z"
    }
  ]
}
```

---

### GET /transactions/:id
Get a single transaction by ID.

**Response 200:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Errors:** 404 (not found)

---

### POST /transactions
Create a new transaction.

**Request Body:**
```json
{
  "title": "Grocery Shopping",
  "amount": 1500,
  "type": "expense",
  "category": "Food & Dining",
  "description": "Weekly groceries",
  "date": "2024-06-13"
}
```

**Income Categories:** `Salary`, `Freelance`, `Investment`, `Business`, `Gift`, `Other Income`

**Expense Categories:** `Food & Dining`, `Shopping`, `Transport`, `Housing`, `Utilities`, `Healthcare`, `Entertainment`, `Education`, `Travel`, `Personal Care`, `Subscriptions`, `Insurance`, `Other Expense`

**Response 201:**
```json
{
  "success": true,
  "message": "Transaction added successfully",
  "data": { ... }
}
```

**Errors:** 400 (validation)

---

### PUT /transactions/:id
Update an existing transaction.

**Request Body:** Same as POST (all fields)

**Response 200:**
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": { ... }
}
```

**Errors:** 404, 400 (validation)

---

### DELETE /transactions/:id
Delete a transaction.

**Response 200:**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

**Errors:** 404

---

### GET /transactions/export/csv
Export transactions to CSV file.

**Query Parameters:** Same filters as GET /transactions (type, category, startDate, endDate)

**Response:** CSV file download  
**Content-Type:** `text/csv`  
**Filename:** `transactions_<timestamp>.csv`

**Errors:** 404 (no transactions to export)

---

## Analytics

All analytics routes require `Authorization: Bearer <token>` header.

### GET /analytics/summary
Get financial summary for current month, last month, and all time.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "currentMonth": {
      "income": 50000,
      "expense": 18500,
      "balance": 31500,
      "incomeCount": 2,
      "expenseCount": 12
    },
    "lastMonth": {
      "income": 50000,
      "expense": 22000,
      "balance": 28000
    },
    "allTime": {
      "income": 350000,
      "expense": 210000,
      "balance": 140000
    }
  }
}
```

---

### GET /analytics/monthly
Get month-by-month income/expense data for a year.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| year | number | Year (default: current year) |

**Response 200:**
```json
{
  "success": true,
  "year": 2024,
  "data": [
    { "month": "Jan", "income": 50000, "expense": 18000, "net": 32000 },
    { "month": "Feb", "income": 50000, "expense": 21000, "net": 29000 },
    ...
  ]
}
```

---

### GET /analytics/categories
Get category-wise spending breakdown.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| type | string | `income` or `expense` (default: `expense`) |
| year | number | Year filter |
| month | number | Month filter (1-12), requires year |

**Response 200:**
```json
{
  "success": true,
  "type": "expense",
  "totalAmount": 18500,
  "data": [
    {
      "category": "Food & Dining",
      "total": 5500,
      "count": 8,
      "percentage": "29.7"
    },
    ...
  ]
}
```

---

### GET /analytics/recent
Get the 5 most recent transactions.

**Response 200:**
```json
{
  "success": true,
  "data": [ ... ]
}
```

---

## Error Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

Validation errors:
```json
{
  "success": false,
  "errors": [
    { "field": "email", "msg": "Please provide a valid email" }
  ]
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error / Bad request |
| 401 | Unauthorized (missing or invalid token) |
| 404 | Resource not found |
| 500 | Internal server error |
