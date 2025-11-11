# Docker Deployment Guide

This guide explains how to run SkillSync using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

## Quick Start

### 1. Configure Environment Variables

Copy the example environment file and configure it:

```pwsh
cp .env.example .env
```

Edit `.env` and set your values:

```env
# REQUIRED: Change these secrets in production!
JWT_SECRET=your-unique-secret-key-here
JWT_REFRESH_SECRET=your-unique-refresh-secret-here

# MongoDB credentials
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure_password_here

# CORS origin (frontend URL)
CORS_ORIGIN=http://localhost:3000

# Frontend API endpoint
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2. Build and Start Services

Build and start all services (MongoDB, Backend, Frontend):

```pwsh
docker-compose up -d --build
```

This will:

- Build the backend and frontend images
- Pull the MongoDB image
- Create and start all containers
- Set up networking between services

### 3. Create Admin User

Once the backend is running, create an admin user:

```pwsh
docker-compose exec backend node scripts/createAdmin.js
```

Default credentials:

- Email: `admin@skillsync.com`
- Password: `Admin@123`

**⚠️ Change the password after first login!**

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

## Docker Commands

### View Running Containers

```pwsh
docker-compose ps
```

### View Logs

```pwsh
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Stop Services

```pwsh
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes all data)

```pwsh
docker-compose down -v
```

### Restart a Service

```pwsh
docker-compose restart backend
docker-compose restart frontend
```

### Rebuild a Service

```pwsh
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

### Execute Commands in Container

```pwsh
# Backend shell
docker-compose exec backend sh

# MongoDB shell
docker-compose exec mongodb mongosh -u admin -p admin123
```

## Development with Docker

### Hot Reload Development Setup

For development with hot reload, you can override the compose file:

Create `docker-compose.dev.yml`:

```yaml
version: "3.8"

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    environment:
      NODE_ENV: development
    command: npm run dev
```

Run with:

```pwsh
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Container Architecture

```
┌─────────────────────────────────────────┐
│           Frontend Container            │
│         (Nginx + React Build)           │
│              Port: 3000                 │
└────────────────┬────────────────────────┘
                 │
                 │ HTTP Requests
                 │
┌────────────────▼────────────────────────┐
│           Backend Container             │
│          (Node.js/Express)              │
│              Port: 5000                 │
└────────────────┬────────────────────────┘
                 │
                 │ MongoDB Protocol
                 │
┌────────────────▼────────────────────────┐
│          MongoDB Container              │
│         (Database + Volume)             │
│              Port: 27017                │
└─────────────────────────────────────────┘
```

## Volumes

- **mongodb_data**: Persists MongoDB database files
- **mongodb_config**: Persists MongoDB configuration
- **./backend/uploads**: Persists uploaded files (resumes, logos)

## Networking

All services run in an isolated bridge network (`skillsync-network`) for secure inter-container communication.

## Health Checks

All containers include health checks:

- **Backend**: Checks `/health` endpoint every 30s
- **Frontend**: Checks nginx server every 30s
- **MongoDB**: Checks database ping every 10s

## Environment Variables Reference

### Backend Container

| Variable             | Description               | Default                 |
| -------------------- | ------------------------- | ----------------------- |
| `NODE_ENV`           | Node environment          | `production`            |
| `PORT`               | Backend port              | `5000`                  |
| `MONGO_URI`          | MongoDB connection string | Auto-configured         |
| `JWT_SECRET`         | JWT signing secret        | Required                |
| `JWT_REFRESH_SECRET` | Refresh token secret      | Required                |
| `JWT_EXPIRE`         | Access token expiry       | `15m`                   |
| `JWT_REFRESH_EXPIRE` | Refresh token expiry      | `7d`                    |
| `CORS_ORIGIN`        | Allowed CORS origin       | `http://localhost:3000` |

### MongoDB Container

| Variable                     | Description      | Default     |
| ---------------------------- | ---------------- | ----------- |
| `MONGO_INITDB_ROOT_USERNAME` | Root username    | `admin`     |
| `MONGO_INITDB_ROOT_PASSWORD` | Root password    | `admin123`  |
| `MONGO_INITDB_DATABASE`      | Initial database | `skillsync` |

## Production Considerations

### Security

1. **Change all secrets** in `.env` file
2. **Use strong MongoDB credentials**
3. **Enable HTTPS** with a reverse proxy (nginx, Caddy, Traefik)
4. **Restrict MongoDB port** (don't expose 27017 publicly)
5. **Use Docker secrets** for sensitive data in production

### Performance

1. **Resource limits**: Add resource constraints in compose file
2. **Scaling**: Use `docker-compose up --scale backend=3` for horizontal scaling
3. **Monitoring**: Add monitoring tools (Prometheus, Grafana)
4. **Logging**: Configure centralized logging

### Backup

Backup MongoDB data:

```pwsh
docker-compose exec mongodb mongodump --username admin --password admin123 --authenticationDatabase admin --out /backup
```

## Troubleshooting

### Backend can't connect to MongoDB

Check if MongoDB is healthy:

```pwsh
docker-compose ps
docker-compose logs mongodb
```

### Frontend shows connection errors

1. Check if backend is running: `docker-compose ps`
2. Verify `VITE_API_BASE_URL` in `.env`
3. Check CORS settings in backend `.env`

### Port conflicts

If ports 3000, 5000, or 27017 are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "8080:80" # Frontend on port 8080
```

### Clear and restart

```pwsh
docker-compose down -v
docker-compose up -d --build
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
