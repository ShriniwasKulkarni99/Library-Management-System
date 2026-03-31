# LibraryMS — Library Management System

A full-stack, production-ready Library Management System built with React + Vite (frontend) and Node.js + Express + MySQL (backend).

---

## ✨ Features

- **3-role authentication** — Admin, Student, Staff (JWT-based)
- **Admin** — full CRUD for books, users, book issues/returns, dashboard analytics
- **Student / Staff** — dashboard, browse books, view issued books, profile management
- Secure password hashing (bcrypt, 12 rounds)
- Role-based route protection (frontend + backend)
- Search, filter, and pagination on all list pages
- Profile image upload (multer)
- Toast notifications and loading states
- Responsive design — desktop and mobile

---

## 🗂 Folder Structure

```
library-system/
├── backend/
│   ├── src/
│   │   ├── app.js                   # Express entry point
│   │   ├── config/
│   │   │   └── db.js                # MySQL connection pool
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── users.controller.js
│   │   │   ├── books.controller.js
│   │   │   ├── issues.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js   # JWT verify + role guard
│   │   │   ├── upload.middleware.js # Multer
│   │   │   ├── validate.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── users.routes.js
│   │   │   ├── books.routes.js
│   │   │   ├── issues.routes.js
│   │   │   └── dashboard.routes.js
│   │   ├── services/
│   │   │   └── auth.service.js
│   │   └── validators/
│   │       ├── auth.validator.js
│   │       └── book.validator.js
│   ├── uploads/profiles/            # Uploaded profile images
│   ├── schema.sql                   # MySQL schema
│   ├── seed.sql                     # Sample seed data
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── App.jsx                  # Root router
    │   ├── main.jsx
    │   ├── index.css                # Design system / CSS variables
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── routes/
    │   │   └── ProtectedRoute.jsx
    │   ├── services/
    │   │   └── api.js               # Axios instance with interceptors
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── DashboardLayout.jsx
    │   │   │   └── DashboardLayout.module.css
    │   │   └── common/
    │   │       ├── Button.jsx / .module.css
    │   │       ├── FormInput.jsx / .module.css
    │   │       ├── Modal.jsx / .module.css
    │   │       ├── Table.jsx / .module.css
    │   │       ├── SearchBar.jsx / .module.css
    │   │       └── PageHeader.jsx / .module.css
    │   └── pages/
    │       ├── auth/Login.jsx
    │       ├── admin/
    │       │   ├── Dashboard.jsx
    │       │   ├── BooksPage.jsx
    │       │   ├── BookFormPage.jsx
    │       │   ├── IssuesPage.jsx
    │       │   ├── IssueBookPage.jsx
    │       │   ├── UsersListPage.jsx
    │       │   ├── UserDetailPage.jsx
    │       │   ├── RegisterPage.jsx
    │       │   └── ProfilePage.jsx
    │       ├── student/
    │       │   ├── Dashboard.jsx
    │       │   ├── BooksPage.jsx
    │       │   └── MyIssuesPage.jsx
    │       ├── staff/
    │       │   └── Dashboard.jsx
    │       └── NotFound.jsx
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env.example
```

---

## ⚙️ Prerequisites

- Node.js v18+
- MySQL 8.0+
- npm or yarn

---

## 🚀 Setup Instructions

### 1. Clone / copy the project

```bash
# Place the two folders side by side
library-system/
├── backend/
└── frontend/
```

### 2. Set up the database

```sql
-- In MySQL client (e.g. MySQL Workbench or CLI)
mysql -u root -p < backend/schema.sql
mysql -u root -p library_db < backend/seed.sql
```

Or run both files from within MySQL:
```sql
SOURCE /path/to/backend/schema.sql;
USE library_db;
SOURCE /path/to/backend/seed.sql;
```

### 3. Configure backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials and a strong JWT_SECRET
npm install
```

**`.env` values you must set:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=library_db
JWT_SECRET=change_this_to_a_long_random_string
CLIENT_URL=http://localhost:5173
```

### 4. Start the backend

```bash
cd backend
npm run dev        # Development (nodemon)
# or
npm start          # Production
```

Backend runs on: **http://localhost:5000**

### 5. Configure frontend

```bash
cd frontend
cp .env.example .env
# .env is pre-set to use the Vite proxy — no changes needed for local dev
npm install
```

### 6. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## 👤 Sample Login Credentials

All accounts use password: **`Password@123`**

| Role    | Email                  | Password      |
|---------|------------------------|---------------|
| Admin   | admin@library.com      | Password@123  |
| Student | student1@library.com   | Password@123  |
| Student | student2@library.com   | Password@123  |
| Staff   | staff1@library.com     | Password@123  |
| Staff   | staff2@library.com     | Password@123  |

---

## 📡 API Documentation

### Base URL: `http://localhost:5000/api`

#### Auth
| Method | Endpoint          | Auth    | Description              |
|--------|-------------------|---------|--------------------------|
| POST   | /auth/login       | None    | Login and receive JWT    |
| POST   | /auth/register    | Admin   | Register a new user      |
| GET    | /auth/me          | Any     | Get current user info    |

#### Users
| Method | Endpoint               | Auth      | Description              |
|--------|------------------------|-----------|--------------------------|
| GET    | /users                 | Admin     | List users (filterable)  |
| GET    | /users/:id             | Admin/Self| Get user by ID           |
| PUT    | /users/:id             | Admin/Self| Update user profile      |
| DELETE | /users/:id             | Admin     | Delete user              |
| PUT    | /users/:id/password    | Admin/Self| Change password          |

#### Books
| Method | Endpoint               | Auth    | Description              |
|--------|------------------------|---------|--------------------------|
| GET    | /books                 | Any     | List books (search/filter)|
| GET    | /books/:id             | Any     | Get book details         |
| POST   | /books                 | Admin   | Create book              |
| PUT    | /books/:id             | Admin   | Update book              |
| DELETE | /books/:id             | Admin   | Delete book              |
| GET    | /books/stats/summary   | Admin   | Book statistics          |

#### Book Issues
| Method | Endpoint               | Auth    | Description                    |
|--------|------------------------|---------|-------------------------------|
| GET    | /issues                | Any     | List issues (own or all)       |
| GET    | /issues/:id            | Any     | Get single issue               |
| POST   | /issues                | Admin   | Issue a book                   |
| PUT    | /issues/:id/return     | Admin   | Mark book as returned          |
| GET    | /issues/stats/summary  | Admin   | Issue statistics               |

#### Dashboard
| Method | Endpoint               | Auth    | Description              |
|--------|------------------------|---------|--------------------------|
| GET    | /dashboard/admin       | Admin   | Admin dashboard stats    |
| GET    | /dashboard/student     | Student | Student dashboard stats  |
| GET    | /dashboard/staff       | Staff   | Staff dashboard stats    |

---

## 🔐 How Authentication Works

1. User POSTs credentials to `/api/auth/login`
2. Server verifies email + bcrypt password comparison
3. On success, returns a signed JWT with `{ id, email, role, name }`
4. Frontend stores JWT in `localStorage` as `lms_token`
5. All subsequent API requests include `Authorization: Bearer <token>`
6. Backend `authenticate` middleware verifies the token on protected routes
7. `authorize(...roles)` middleware checks the decoded role against allowed roles

**Token expiry:** 7 days (configurable via `JWT_EXPIRES_IN`)

On 401, Axios interceptor automatically clears storage and redirects to `/login`.

---

## 🏗 Build for Production

### Backend
```bash
cd backend
NODE_ENV=production npm start
```

### Frontend
```bash
cd frontend
npm run build
# Output in dist/ — deploy to Nginx/Vercel/Netlify
```

For production, update `VITE_API_BASE_URL` in frontend `.env` to your live backend URL, and update `CLIENT_URL` in backend `.env` to your live frontend domain.

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| MySQL connection refused | Check `DB_HOST`, `DB_PORT`, MySQL is running |
| ER_NOT_SUPPORTED_AUTH_MODE | Run `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_pass';` |
| CORS errors | Ensure `CLIENT_URL` in backend `.env` matches your frontend URL |
| Uploads not serving | Ensure `uploads/profiles/` dir exists in backend root |
| JWT errors on refresh | Clear `localStorage` and log in again |
