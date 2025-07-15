# QueueIT - Modern ITSM Platform

A modern, enterprise-grade IT Service Management platform built with Next.js 15, NestJS, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (if running locally)

### Development Setup

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd QueueIT
npm run install:all
```

2. **Set up environment variables**
```bash
# Copy environment files
cp apps/api-nest/.env.example apps/api-nest/.env
cp apps/portal/.env.local.example apps/portal/.env.local
cp apps/admin-next/.env.local.example apps/admin-next/.env.local
```

3. **Start with Docker (Recommended)**
```bash
npm run docker:up
```

4. **Or start development servers individually**
```bash
# Setup database
npm run db:migrate
npm run db:seed

# Start all services
npm run dev
```

### Access Points
- **Portal**: http://localhost:3000
- **Admin**: http://localhost:3002
- **API**: http://localhost:3001
- **Database**: postgresql://localhost:5432/queueit_db

## 🏗️ Architecture

### Modern Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Backend**: NestJS with Prisma ORM, PostgreSQL
- **Authentication**: Clerk (modern auth with RBAC)
- **UI**: Tailwind CSS + shadcn/ui components
- **Deployment**: Docker + Docker Compose

### Applications
```
├── apps/
│   ├── portal/          # Next.js 15 - End-user portal
│   ├── admin-next/      # Next.js 15 - Admin interface
│   ├── api-nest/        # NestJS - Backend API
│   ├── admin/           # Legacy - React admin (being phased out)
│   ├── kiosk/           # iOS - Kiosk application
│   ├── macos/           # macOS - Desktop application
│   └── slack/           # Slack - Integration bot
├── packages/
│   ├── api/             # Legacy - Express API (being phased out)
│   └── scripts/         # Build and deployment scripts
└── docs/                # Documentation
```

## 🔧 Development Commands

```bash
# Development
npm run dev                 # Start all services
npm run dev:api            # Start API only
npm run dev:portal         # Start portal only
npm run dev:admin          # Start admin only

# Building
npm run build              # Build all applications
npm run build:api          # Build API only
npm run build:portal       # Build portal only
npm run build:admin        # Build admin only

# Database
npm run db:migrate         # Run migrations
npm run db:generate        # Generate Prisma client
npm run db:seed           # Seed database
npm run db:studio         # Open Prisma Studio

# Docker
npm run docker:up         # Start all services
npm run docker:down       # Stop all services
npm run docker:build      # Build Docker images

# Utilities
npm run setup             # Complete setup
npm run clean             # Clean all build artifacts
```

## 📊 Features

### Core ITSM Features
- **Ticket Management**: Create, assign, track, and resolve tickets
- **Knowledge Base**: Searchable articles with categories and tags
- **User Management**: Role-based access control with Clerk
- **Multi-Channel Support**: Portal, email, Slack, kiosk
- **Commenting**: Public and internal comments with attachments
- **Workflows**: Automated ticket routing and escalation

### Modern Features
- **AI Integration**: Auto-tagging, article suggestions, chatbot
- **Real-time Updates**: Live ticket status and notifications
- **Mobile-First**: Responsive design for all devices
- **Enterprise Auth**: SSO, SCIM, multi-tenant support
- **Advanced Reporting**: Analytics and performance metrics
- **API-First**: RESTful API with OpenAPI documentation

## 🔐 Authentication & Authorization

### Clerk Integration
- Modern authentication with social logins
- Role-based access control (RBAC)
- SSO and SCIM provisioning
- Session management and security

### User Roles
- **end_user**: Submit/view own tickets, public KB
- **manager**: View team tickets, same rights as end_user
- **technician**: Assigned tickets, comments, SLA tools
- **tech_lead**: Full ticket access, assign, manage techs
- **admin**: System-wide control
- **hr_admin**: HR tickets only, KB controls
- **ops_admin**: Ops/FAC tickets only
- **reporting_analyst**: Report-only dashboards scoped to dept
- **auditor**: Read-only logs and views

## 📡 API Endpoints

### API Versioning
- **v2 (Current)**: `/api/v2/*` - Enhanced security, validation, and response format
- **v1 (Legacy)**: `/api/v1/*` - Deprecated, maintained for backward compatibility

### Core Routes (v2)
```
POST   /api/v2/tickets           # Create ticket
GET    /api/v2/tickets           # List tickets
GET    /api/v2/tickets/:id       # Get ticket details
PATCH  /api/v2/tickets/:id       # Update ticket
DELETE /api/v2/tickets/:id       # Delete ticket
POST   /api/v2/tickets/:id/comments # Add comment

GET    /api/v2/users             # List users
GET    /api/v2/users/me          # Current user
PATCH  /api/v2/users/:id         # Update user

GET    /api/v2/knowledge-base    # List KB articles
POST   /api/v2/knowledge-base    # Create article
GET    /api/v2/knowledge-base/:id # Get article
PATCH  /api/v2/knowledge-base/:id # Update article
```

### Enhanced v2 Response Format
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  },
  "version": "2.0",
  "timestamp": "2025-07-15T12:00:00.000Z"
}
```

### Security Enhancements in v2
- Enhanced input validation and sanitization
- Improved error handling with detailed messages
- User-scoped data access controls
- Audit trail for all operations
- Rate limiting and request throttling

## 🐳 Docker Deployment

The application is fully containerized with Docker Compose:

```yaml
# docker-compose.yml includes:
- postgres    # Database
- redis       # Cache/sessions
- api         # NestJS backend
- portal      # Next.js portal
- admin       # Next.js admin
```

### Production Deployment
```bash
# Build production images
npm run docker:build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run API tests
cd apps/api-nest && npm test

# Run portal tests
cd apps/portal && npm test

# Run admin tests
cd apps/admin-next && npm test
```

## 📚 Documentation

- [Development Guide](docs/development.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Security Guide](docs/security.md)

## 🚦 Implementation Status

### ✅ Phase 1: Foundation (Complete)
- Modern Next.js 15 + NestJS architecture
- PostgreSQL + Prisma ORM
- Clerk authentication
- Docker containerization
- Core API endpoints

### ✅ Phase 2: Core Features (Complete)
- Portal application with full ticket management
- Admin interface with comprehensive management tools
- HelpScout data migration scripts
- Database migration (SQLite → PostgreSQL)
- Advanced reporting and analytics
- Role-based access control (RBAC)

### � Phase 3: Smart Features (In Progress)
- AI-powered auto-tagging
- Intelligent article suggestions
- Chatbot integration
- Advanced analytics
- Slack integration enhancements

### � Phase 4: Enterprise Features (Planned)
- SCIM + SSO integration
- Multi-tenant support
- Advanced security features
- CLI tools for server management

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## 📞 Support

For questions or issues:
- Create an issue on GitHub
- Contact: support@queueit.com
- Documentation: [docs/](docs/)

---

**Built with ❤️ using modern web technologies**
