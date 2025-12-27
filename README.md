# EVM Voting Portal

A secure, scalable online election system built using Next.js, designed to simulate an EVM-style voting process with strong validation, user authentication, and administrative control.

Users register using verified email OTPs, vote only once, and access responsive dashboards while all votes are stored securely in MySQL.

<!-- > Hosted on Vercel: https://evm-portal.vercel.app/ -->

> [Demo Video](https://youtu.be/hXw9c5eQ3ko?si=9N28HtCFgjVlu59O)

## Features

### Authentication & Access

- Redis-based session management and OTP system
- Email verification before account creation
- Separate dashboards for voters and admins


### Voting Integrity

- Prevents double voting
- Maintains voter traceability without exposing identity publicly
- Handles concurrent voting transactions correctly

### System Reliability

- Optimized MySQL relational schema
- Atomic updates ensuring vote integrity
- Redis caching for fast session access


## Tech Stack

### Frontend

- Next.js
- Tailwind CSS / ShadCN UI / Accertainity UI / Radix UI

### Backend

- Next.js App Router APIs

### Database

- MySQL as primary database
- Redis for OTP/session caching

## Getting Started (Local Development)

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd evm
```

### 2. Start Database Services

Start MySQL and Redis using Docker:

```bash
docker-compose up -d
```

This will start:
- MySQL on `localhost:3306` with database `evm_db`
- Redis on `localhost:6379`

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# The default values are already set for Docker:
# DB_HOST=localhost
# DB_USER=evm_user
# DB_PASSWORD=evm_password
# DB_NAME=evm_db
# REDIS_URL=redis://localhost:6379
```

> **Important:** Generate secure secrets for production:


### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### Sample Credentials

The database is pre-seeded with sample data:

**Admin Account:**
- Email: `admin@evm.gov.in`
- Password: `Admin@123`

**Voter Accounts:**
- Email: `rajesh.kumar@example.com`
- Password: `Voter@123`

(See `database/seed.sql` for more sample accounts)

## Database Schema

![ER Diagram](./assets/er-model.png)

## Screenshots

### Landing Page
![Landing Page](./assets/landing.png)

### Voter Dashboard
![Dashboard](./assets/voter-dashboard.png)

### Admin Dashboard
![Admin Dashboard](./assets/admin-dashboard.png)

### Vote Menu
![Voting Menu](./assets/vote.png)

### Results
![Results](./assets/results.png)