# System Design

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Version: 1.0

---

## 1. Architecture Overview

### 1.1 Architecture Pattern
**Monolithic Web Application** — Single deployable unit with clear separation of concerns.

### 1.2 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React + TypeScript | Component-based, type-safe, large ecosystem |
| Backend | Node.js + Express | Simple, lightweight, matches frontend stack |
| Database | SQLite | Zero-config, file-based, sufficient for 10,000 records |
| Authentication | JWT + bcrypt | Stateless, secure, simple to implement |
| File Storage | Local filesystem | Self-hosted, no external services |

### 1.3 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   React UI  │  │   Charts    │  │   Forms     │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │
┌─────────────────────────────────────────────────────────┐
│                     Server (Node.js)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Routes    │  │  Controllers│  │  Services   │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Models    │  │  Middleware  │  │   Utils     │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                            │
                            │ SQL
                            │
┌─────────────────────────────────────────────────────────┐
│                     Database (SQLite)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Users     │  │  Expenses   │  │  Categories │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Budgets   │  │  Approvals  │  │  AuditLog   │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Component Design

### 2.1 Frontend Components

| Component | Purpose | Dependencies |
|-----------|---------|--------------|
| App | Root component, routing | React Router |
| Dashboard | Main landing page | Summary, Charts, RecentExpenses |
| ExpenseEntry | Expense form | Form validation, API calls |
| MonthlySummary | Summary view | Charts, ExpenseList |
| BudgetManagement | Budget form | API calls |
| ApprovalQueue | Manager view | API calls |
| Export | Export interface | API calls, file download |
| CategoryManagement | Admin interface | API calls, drag-drop |

### 2.2 Backend Components

| Component | Purpose | Dependencies |
|-----------|---------|--------------|
| Server | HTTP server | Express |
| Routes | API endpoints | Express Router |
| Controllers | Request handlers | Services |
| Services | Business logic | Models |
| Models | Data access | SQLite |
| Middleware | Auth, validation, logging | JWT, bcrypt |
| Utils | Helper functions | None |

---

## 3. API Design

### 3.1 REST Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | /api/auth/login | User login | None |
| POST | /api/auth/register | User registration | None |
| GET | /api/expenses | List expenses | Required |
| POST | /api/expenses | Create expense | Required |
| PUT | /api/expenses/:id | Update expense | Required |
| DELETE | /api/expenses/:id | Delete expense | Required |
| GET | /api/categories | List categories | Required |
| POST | /api/categories | Create category | Admin |
| PUT | /api/categories/:id | Update category | Admin |
| DELETE | /api/categories/:id | Delete category | Admin |
| GET | /api/budgets | List budgets | Required |
| POST | /api/budgets | Create budget | Manager |
| PUT | /api/budgets/:id | Update budget | Manager |
| GET | /api/summary | Monthly summary | Required |
| GET | /api/approvals | List approvals | Manager |
| POST | /api/approvals/:id/approve | Approve request | Manager |
| POST | /api/approvals/:id/reject | Reject request | Manager |
| POST | /api/export | Export data | Auditor |

### 3.2 Request/Response Format

**Request:**
```json
{
  "amount": 25.50,
  "category_id": "uuid",
  "date": "2026-06-28",
  "description": "Lunch"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 25.50,
    "category": "Food",
    "date": "2026-06-28",
    "description": "Lunch",
    "created_at": "2026-06-28T12:00:00Z"
  }
}
```

---

## 4. Data Flow

### 4.1 Expense Entry Flow

```
User → Frontend → API → Controller → Service → Model → Database
  │                                                    │
  │←── Confirmation ←── Response ←── Query Result ←────┘
```

### 4.2 Budget Approval Flow

```
Manager → Frontend → API → Controller → Service → Model → Database
  │                                                    │
  │←── Notification ←── Response ←── Query Result ←────┘
  │
  └→ Requester (notification)
```

### 4.3 Export Flow

```
Auditor → Frontend → API → Controller → Service → Model → Database
  │                                                    │
  │←── File Download ←── Response ←── Query Result ←────┘
```

---

## 5. Deployment

### 5.1 Deployment Target
**Self-hosted on Sri's laptop** — no external services.

### 5.2 Deployment Process

1. Build frontend: `npm run build`
2. Start server: `node server.js`
3. Access at: `http://localhost:3000`

### 5.3 Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 6. Key Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| react | 18.x | Frontend framework |
| express | 4.x | Backend framework |
| better-sqlite3 | 9.x | SQLite driver |
| bcrypt | 5.x | Password hashing |
| jsonwebtoken | 9.x | JWT authentication |
| multer | 1.x | File upload |
| chart.js | 4.x | Data visualization |

---

## 7. Development Structure

```
finance-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls
│   │   └── utils/         # Helper functions
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── models/            # Data access
│   ├── middleware/         # Auth, validation
│   └── package.json
├── database/               # SQLite database
│   └── finance.db
├── uploads/                # Receipt storage
└── README.md
```

---

## Status

- [x] Architecture pattern defined
- [x] Technology stack selected
- [x] Components designed
- [x] API endpoints documented
- [x] Data flows mapped
- [x] Deployment plan defined
- [x] Dependencies listed
