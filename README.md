# Store Rating Platform

A full-stack web application developed for the Roxiler Systems coding challenge. The platform allows users to browse stores, submit ratings (1 to 5 stars), and access role-specific dashboards with Role-Based Access Control (RBAC).

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Authentication:** JSON Web Tokens (JWT), bcryptjs password hashing
- **Frontend:** React.js (Vite)
- **Styling:** Custom CSS design system (responsive dark layout, micro-animations)
- **Icons:** Lucide React

---

## User Roles and Features

### 1. System Administrator
- **Dashboard Metrics:** Displays real-time statistics:
  - Total number of registered users
  - Total number of registered stores
  - Total number of submitted ratings
- **User Management:** Create new users (Administrator, Normal User, Store Owner) with field validation.
- **Store Management:** Add new stores with address, email, and optional Store Owner assignment.
- **Directories and Filtering:**
  - View full store directory with Name, Email, Address, and Overall Rating.
  - View full user directory with Name, Email, Address, Role, and Store Owner ratings.
  - Multi-column sorting (ascending and descending) across Name, Email, Address, Role, and Rating.
  - Search and filter by Name, Email, Address, and Role.
- **Session:** Secure logout.

### 2. Normal User
- **Registration & Login:** Self-service registration and unified authentication.
- **Store Directory:** View all registered stores with real-time search by Store Name and Address.
- **Ratings:**
  - View overall store rating and customer count.
  - View personal submitted rating for each store.
  - Submit ratings (1 to 5 stars).
  - Modify existing ratings with instant calculation updates.
- **Account Security:** Change password after login.
- **Session:** Secure logout.

### 3. Store Owner
- **Dashboard:**
  - Overall average store rating and total review count.
  - List of customers who rated the store (Name, Email, Address, Rating, Date).
  - Ascending and descending table sorting on customer feedback.
- **Account Security:** Change password after login.
- **Session:** Secure logout.

---

## Form Validations

The following validation rules are strictly enforced on both frontend and backend:
- **Name:** Minimum 20 characters, Maximum 60 characters.
- **Address:** Maximum 400 characters.
- **Password:** 8–16 characters, must include at least one uppercase letter and one special character.
- **Email:** Standard email format validation.
- **Rating:** Integer range between 1 and 5.

---

## Setup and Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL 14+ installed and running locally on port 5432

---

### 1. Database Setup
Create a PostgreSQL database named `roxiler_db`:
```sql
CREATE DATABASE roxiler_db;
```

---

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Push schema to PostgreSQL database
npx prisma db push

# Seed initial accounts and demo stores
npm run seed

# Start Express server
npm run dev
```
The backend API runs on `http://localhost:5000`.

---

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The React frontend runs on `http://localhost:3000`.

---

## Pre-seeded Test Accounts

The seed script creates the following accounts adhering to all validation rules:

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Administrator** | `admin@roxiler.com` | `Admin@12345` |
| **Store Owner** | `owner@freshmart.com` | `Owner@12345` |
| **Normal User** | `user@example.com` | `User@12345` |
