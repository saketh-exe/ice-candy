# SkillSync - Internship Matching Platform

A full-stack web application connecting students with internship opportunities. Built with Node.js, Express, MongoDB, React, and Vite.

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone and configure**

   ```pwsh
   git clone https://github.com/saketh-exe/ice-candy.git
   cd ice-candy
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start all services**

   ```pwsh
   docker-compose up -d --build
   ```

3. **Create admin user**

   ```pwsh
   docker-compose exec backend node scripts/createAdmin.js
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

See [DOCKER.md](./DOCKER.md) for detailed Docker documentation.

### Local Development

See individual setup guides:

- **Backend**: [backend/QUICK_START.md](./backend/QUICK_START.md)
- **Frontend**: [frontend/README.md](./frontend/README.md)

## 📁 Project Structure

```
iceCandy/
├── backend/              # Node.js/Express API
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation, error handling
│   └── Dockerfile       # Backend container config
├── frontend/            # React/Vite UI
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── store/       # Zustand state management
│   ├── Dockerfile       # Frontend container config
│   └── nginx.conf       # Nginx configuration
├── docker-compose.yml   # Multi-container orchestration
├── .env.example         # Environment template
└── DOCKER.md           # Docker documentation
```

## 🎯 Features

- **Multi-role System**: Students, Companies, and Admins with isolated features
- **Authentication**: JWT-based auth with automatic token refresh
- **Internship Management**: Post, browse, apply, and manage internships
- **Application Tracking**: Complete application workflow with status updates
- **File Uploads**: Resume and company logo management
- **Responsive Design**: Modern UI built with TailwindCSS

## 🛠️ Tech Stack

### Backend

- Node.js 20 LTS
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Joi for validation

### Frontend

- React 18.2
- Vite 5.0
- React Router v6
- Zustand (state management)
- TailwindCSS 3.3
- Axios

### DevOps

- Docker & Docker Compose
- Nginx (production frontend server)
- MongoDB 7

## 📖 Documentation

- [Docker Setup & Deployment](./DOCKER.md) - Complete Docker guide
- [Backend API Documentation](./backend/API_DOCS.md) - API endpoints reference
- [Backend Quick Start](./backend/QUICK_START.md) - Local backend setup
- [Frontend README](./frontend/README.md) - Frontend setup and structure
- [Environment Configuration](./frontend/ENVIRONMENT.md) - Dev/Prod environment setup
- [Recommendations API](./backend/RECOMMENDATIONS_API.md) - AI-powered recommendations
- [Project Summary](./PROJECT_SUMMARY.md) - Complete architecture overview
- [AI Agent Instructions](./.github/copilot-instructions.md) - For AI coding assistants

## 🔐 Default Credentials

After creating the admin user:

- **Email**: admin@skillsync.com
- **Password**: Admin@123

⚠️ **Change these credentials immediately after first login!**

## 📝 Environment Configuration

### Quick Setup

**Development** (uses localhost):

```pwsh
cd frontend
npm run dev  # Automatically uses http://localhost:5000/api
```

**Production** (uses server IP):

```pwsh
cd frontend
npm run build  # Uses http://65.0.18.1:5000/api (or your configured URL)
```

### Environment Files

- `.env` - Local default (localhost)
- `.env.development` - Development mode (localhost)
- `.env.production` - Production mode (server IP/domain)
- `.env.example` - Template file

**See [frontend/ENVIRONMENT.md](./frontend/ENVIRONMENT.md) for complete environment configuration guide.**

### Backend Configuration

Copy `.env.example` to `.env` and configure:

```env
# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure_password

# CORS
CORS_ORIGIN=http://localhost:3000

# Frontend API URL (set in frontend/.env files)
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🐳 Docker Commands

```pwsh
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build

# Create admin user
docker-compose exec backend node scripts/createAdmin.js
```

## 🧪 API Testing

Use the API documentation to test endpoints:

- See [backend/API_DOCS.md](./backend/API_DOCS.md) for all endpoints
- Test with Postman, Thunder Client, or curl
- Health check: `curl http://localhost:5000/health`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Saketh** - [saketh-exe](https://github.com/saketh-exe)

## 🙏 Acknowledgments

- Built as a learning project for full-stack development
- Inspired by internship matching platforms like Internshala and LinkedIn

---

For detailed setup instructions, troubleshooting, and deployment guides, see the documentation files listed above.
