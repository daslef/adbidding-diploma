# Ad Bidding Project

A quick bidding system built as a technical demonstration for a startup.

## Tech Stack

**Frontend:**
- Next.js
- TypeScript
- Tailwind CSS
- TanStack Query
- shadcn/ui components

**Backend:**
- Node.js
- WebSockets for real-time updates
- Redis for caching
- PostgreSQL database

## Setup

### Prerequisites
- Node.js
- npm or yarn
- Redis
- PostgreSQL

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Features
- Real-time bidding system
- User authentication
- Bid history tracking

## Environment Variables

### Backend (.env)
```
# Application
NODE_ENV=development
PORT=5010

# Database 
DATABASE_URL=your_postgresql_connection_string

# Redis
REDIS_URL=your_redis_url
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
REDIS_USERNAME=default

# JWT
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### Frontend (.env.local)
```
REACT_EDITOR=code

# Backend API URL
NEXT_PUBLIC_API_URL=http://127.0.0.1:5010/api

# WebSocket URL for real-time updates
NEXT_PUBLIC_SOCKET_URL=http://127.0.0.1:5010

# Enable development tools
NEXT_PUBLIC_DEBUG=true
```