# SkillMatch - SME & Freelance Specialist Matching Platform

A matching platform connecting Small & Medium Enterprises (SMEs) with vetted freelance specialists and consultants for short-term projects.

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT + bcrypt

## Project Structure

```
skillmatch/
├── client/          # React frontend
├── server/          # Express backend
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Setup

1. **Install dependencies:**
   ```bash
   cd skillmatch
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

2. **Configure environment variables:**
   
   Copy `server/.env.example` to `server/.env` and update:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/skillmatch"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=5000
   ```

   Optionally create `client/.env` for production:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Initialize database:**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push    # or: npx prisma migrate dev
   npx prisma db seed    # creates 5 SMEs, 15 specialists, 10 projects, 1 admin
   ```

4. **Run development servers:**
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

   Or from root: `npm run dev` (requires concurrently)

### Test Accounts (after seeding)

| Role       | Email             | Password   |
|-----------|-------------------|-----------|
| Admin     | admin@skillmatch.com | password123 |
| SME       | sme1@test.com     | password123 |
| Specialist| specialist1@test.com | password123 |

### Deployment

- **Frontend:** Deploy to Vercel or Netlify
- **Backend:** Deploy to Railway, Render, or AWS
- Ensure CORS is configured for your frontend URL
- Set all environment variables in your deployment platform

## Features

- SME project posting and specialist matching
- Specialist profiles with portfolio
- Smart matching algorithm (skills, budget, availability)
- Application and consultation request flow
- Basic messaging system
- Admin panel for user/project management
