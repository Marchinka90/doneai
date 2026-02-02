# DoneAI

A task management application with an intuitive design supporting filtration and different views.

## Tech Stack

- **Backend**: Express.js + TypeScript + MongoDB (Mongoose)
- **Frontend**: React + TypeScript + Redux Toolkit (RTK Query) + Material UI
- **Build Tool**: Vite

## Prerequisites

- Node.js (v18 or higher)
- Docker & Docker Compose (for MongoDB)
- MongoDB (local installation or Docker)

## Setup

### 1. Install Dependencies

From the root directory, run:

```bash
npm run install:all
```

Or install each separately:

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Variables

**Server** (`server/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:password123@localhost:27017/doneai?authSource=admin
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB with Docker Compose

From the root directory:

```bash
# Start MongoDB container
docker-compose up -d

# Stop MongoDB container
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v
```

### 4. Run the Application

From the root directory:

```bash
npm run dev
```

This will start both the backend (port 5000) and frontend (port 5173) concurrently.

Or run them separately:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get all tasks |
| GET | /api/tasks/:id | Get a single task |
| POST | /api/tasks | Create a new task |
| PUT | /api/tasks/:id | Update a task |
| DELETE | /api/tasks/:id | Delete a task |

## Task Model

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (MongoDB _id) |
| title | string | Task title |
| description | string | Task description |
| status | enum | `todo` \| `in-progress` \| `done` |
| priority | number (optional) | Integer 1–9 |
| dueDate | number (optional) | Unix seconds (UTC) |
| createdAt | number | Unix seconds (UTC) |
| updatedAt | number | Unix seconds (UTC) |

Notes:
- All Task date/time fields returned by the API are unix seconds (numbers).

## MongoDB Management

### Docker Compose Commands

```bash
# Start MongoDB
docker-compose up -d

# View logs
docker-compose logs mongodb

# Access MongoDB shell
docker exec -it doneai-mongodb mongosh -u admin -p password123 --authenticationDatabase admin

# Stop MongoDB
docker-compose down
```

### Database Access

- **Host**: localhost
- **Port**: 27017
- **Database**: doneai
- **Username**: admin
- **Password**: password123

## Project Structure

```
DoneAI/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # RTK Query API slice
│   │   ├── app/            # Redux store
│   │   ├── components/     # React components
│   │   ├── theme/          # Material UI theme
│   │   └── types/          # TypeScript types
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   └── app.ts          # Express app setup
│   └── ...
└── package.json            # Root package.json with monorepo scripts
```
