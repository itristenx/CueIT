# 🌌 Nova Universe - Modern ITSM Platform

A modern, enterprise-grade IT Service Management platform suite built with Next.js 15, NestJS, and PostgreSQL. Welcome to the Nova Universe - where support scales and style lands.

> **"Support that scales. Style that lands."**

## 🚀 Quick Start

### 🔵 Phase 4: Enterprise Features (Planned)
- SCIM + SSO integration
- Multi-tenant support
- Advanced security features
- CLI tools for server management
- Nova Ascend full gamification systemrerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (if running locally)

### Development Setup

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd nova-universe
npm run install:all
```

2. **Set up environment variables**
```bash
# Copy environment files
cp apps/nova-synth/.env.example apps/nova-synth/.env
cp apps/nova-orbit/.env.local.example apps/nova-orbit/.env.local
cp apps/nova-core/.env.local.example apps/nova-core/.env.local
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
- **Nova Orbit (Portal)**: http://localhost:3000
- **Nova Core (Admin)**: http://localhost:3002
- **Nova Synth (API)**: http://localhost:3001
- **Nova Pulse (Technician)**: http://localhost:3003
- **Nova Lore (Knowledge Base)**: http://localhost:3004
- **Database**: postgresql://localhost:5432/nova_db

## 🏗️ Architecture

### Modern Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Backend**: NestJS with Prisma ORM, PostgreSQL
- **Authentication**: Clerk (modern auth with RBAC)
- **UI**: Tailwind CSS + shadcn/ui components + Nova Design System
- **AI**: Cosmo Assistant powered by Nova Synth
- **Deployment**: Docker + Docker Compose

### Nova Modules
```
├── apps/
│   ├── nova-orbit/       # Next.js 15 - End User Portal for requests, chat, KB
│   ├── nova-core/        # Next.js 15 - Admin Dashboard: configs, workflows, users
│   ├── nova-synth/       # NestJS - AI core backend for Cosmo assistant & API
│   ├── nova-pulse/       # Next.js 15 - Technician workspace for ticket resolution
│   ├── nova-lore/        # Next.js 15 - Knowledge base with AI-powered suggestions
│   ├── nova-comms/       # Node.js - Slack App: slash commands, Cosmo assistant
│   ├── nova-deck/        # Swift - Cross-platform native app (macOS/iOS/iPadOS)
│   ├── kiosk/           # iOS - Nova Beacon kiosk application
│   └── admin/           # React - Legacy admin interface (being phased out)
├── packages/
│   └── scripts/         # Build and deployment scripts
└── docs/               # Documentation
```

### 🧩 Nova Modules Overview

| Module Name     | Codename     | Description                                   |
|-----------------|--------------|-----------------------------------------------|
| Nova Orbit      | `orbit`      | End User Portal for requests, chat, KB        |
| Nova Core       | `core`       | Admin Dashboard: configs, workflows, users    |
| Nova Synth (AI) | `synth`      | AI core backend for Cosmo assistant           |
| Nova Pulse      | `pulse`      | Technician workspace for ticket resolution    |
| Nova Lore       | `lore`       | Knowledge base with AI-powered suggestions    |
| Nova Comms      | `comms`      | Slack App: slash commands, Cosmo assistant    |
| Nova Deck       | `deck`       | Cross-platform native app (macOS/iOS/iPadOS) |
| Nova Beacon     | `beacon`     | Kiosk App: walk-up tickets, feedback, display |

### 🧠 Cosmo - Nova AI Assistant

> *"Hey, I'm Cosmo. Need a hand?"*

Cosmo is powered by Nova Synth and provides intelligent assistance across all modules with features like:
- Autocomplete in request forms
- Ticket update explanations
- Knowledge base article suggestions
- Gamification callouts and XP tracking

## 🔧 Development Commands

```bash
# Development
npm run dev                 # Start all Nova services
npm run dev:api            # Start Nova Synth API only
npm run dev:orbit          # Start Nova Orbit portal only
npm run dev:core           # Start Nova Core admin only
npm run dev:pulse          # Start Nova Pulse technician workspace only
npm run dev:lore           # Start Nova Lore knowledge base only

# Building
npm run build              # Build all Nova applications
npm run build:api          # Build Nova Synth API only
npm run build:orbit        # Build Nova Orbit portal only
npm run build:core         # Build Nova Core admin only
npm run build:pulse        # Build Nova Pulse technician workspace only
npm run build:lore         # Build Nova Lore knowledge base only

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
- **Cosmo AI Integration**: Auto-tagging, article suggestions, intelligent chatbot
- **Real-time Updates**: Live ticket status and notifications
- **Mobile-First**: Responsive design for all devices
- **Enterprise Auth**: SSO, SCIM, multi-tenant support
- **Advanced Reporting**: Analytics and performance metrics
- **API-First**: RESTful API with OpenAPI documentation
- **Nova Ascend Gamification**: XP system (Stardust), badges, and rankings

## 🔐 Authentication & Authorization

### Clerk Integration
- Modern authentication with social logins
- Role-based access control (RBAC)
- SSO and SCIM provisioning
- Session management and security
- Nova ID integration for gamification tracking

### User Roles
- **end_user**: Submit/view own tickets, public KB, earn Stardust
- **manager**: View team tickets, same rights as end_user
- **technician**: Assigned tickets, comments, SLA tools, earn resolution XP
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

# Cosmo AI endpoints
POST   /api/v2/cosmo/assist      # Get AI assistance
POST   /api/v2/cosmo/suggest     # Get article suggestions

# Gamification endpoints
GET    /api/v2/gamification/leaderboard # Get XP leaderboard
POST   /api/v2/gamification/award      # Award Stardust XP
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

The Nova Universe is fully containerized with Docker Compose:

```yaml
# docker-compose.yml includes:
- postgres    # Database
- redis       # Cache/sessions
- nova-synth  # NestJS backend + Cosmo AI
- nova-orbit  # Next.js portal
- nova-core   # Next.js admin
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

# Run Nova Synth API tests
cd apps/nova-synth && npm test

# Run Nova Orbit portal tests
cd apps/nova-orbit && npm test

# Run Nova Core admin tests
cd apps/nova-core && npm test
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
- Contact: support@nova-universe.com
- Documentation: [docs/](docs/)

---

**Built with ❤️ in the Nova Universe - where support scales and style lands** 🌌
