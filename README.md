# SALTEDHASH: EcoWise Wealth Digest PWA

A Progressive Web App newsletter and content hub for sustainable investing education.

## Features
- Read issues and guides on sustainable investing.
- Save articles for offline reading.
- Progressive Web App: Installable, caches content for offline access.
- Role-based access: Subscribers and Admins.
- Admin dashboard to manage issues, guides, and users.

## Requirements
- Node.js

## Installation
1. Clone the repository.
2. Install client dependencies: `cd client && npm install`
3. Install server dependencies: `cd server && npm install`

## Configuration
- Create `client/.env` based on `client/.env.example`
- Create `server/.env` based on `server/.env.example`

## Running the App
- **Server:** `cd server && npx ts-node index.ts`
- **Client (Dev):** `cd client && npm run dev`
- **Client (Build):** `cd client && npm run build`

## Default Credentials
- **Admin:** `admin@ecowise.com` / `adminpass`
- **Subscriber:** `reader@ecowise.com` / `subpass`

## Seed Data
To reset the database to its initial state, run `cd server && npx ts-node seed.ts`.

## Backend Routes
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user
- `GET /api/issues` - Get all issues
- `POST /api/issues` - Create issue (Admin)
- `DELETE /api/issues/:id` - Delete issue (Admin)
- `GET /api/guides` - Get all guides
- `POST /api/guides` - Create guide (Admin)
- `DELETE /api/guides/:id` - Delete guide (Admin)
- `GET /api/topics` - Get all topics
- `GET /api/users` - Get all users
- `GET /api/users/:id/stats` - Get user stats
- `PATCH /api/users/:id` - Update user
- `PATCH /api/users/:id/role` - Update user role (Admin)
- `PUT /api/users/:id/topics` - Update user topics
- `GET /api/savedItems/:userId` - Get user saved items
- `POST /api/savedItems` - Save item
- `GET /api/auditLogs` - Get audit logs (Admin)
- `POST /api/auditLogs` - Create audit log
- `GET /api/health` - Health check

## Frontend Routes
- `/` - Home: Issues, Guides, and personal feed
- `/login` - Login Page
- `/register` - Registration Page
- `/article/:type/:id` - Article view (Issue or Guide)
- `/saved` - Saved items for offline reading
- `/profile` - User profile and preferences
- `/admin` - Admin dashboard
