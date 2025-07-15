# QueueIT Documentation

QueueIT is an internal help desk application for submitting and tracking IT tickets.

## Table of Contents
- [Quick Start Guide](#quick-start-guide)
- [Project Overview](#project-overview)
- [Installation & Setup](#installation--setup)
- [Security](#security)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Quick Links
- [🚀 Quick Start Guide](quickstart.md) - Get up and running fast
- [🔧 Development Guide](development.md) - For developers and contributors
- [🔒 Security Guide](security.md) - Security features and deployment
- [⚙️ Environment Setup](environments.md) - Configuration details
- [📦 Installers](installers.md) - Building packages

## Quick Start Guide

### Prerequisites
- Node.js 18+ and npm
- SQLite3
- For iOS kiosk: Xcode 15+ and iOS 16+

### Installation
```bash
# Clone and setup
git clone <repository-url>
cd QueueIT
./installers/setup.sh

# Start all services
./installers/start-all.sh
```

### Default Access
- **Admin UI**: http://localhost:5173
- **API**: http://localhost:3000
- **Default Login**: admin@example.com / admin

## Project Overview

QueueIT is a comprehensive IT help desk system with multiple components:

### Core Components
- **packages/api** - Backend API server (Node.js/Express/SQLite)
- **apps/admin** - Web admin interface (React/TypeScript/Vite)
- **apps/kiosk** - iOS kiosk application (Swift/SwiftUI)
- **apps/slack** - Slack integration service
- **macos/** - macOS launcher application

### Key Features
- Ticket submission and management
- Kiosk activation system with QR codes
- Role-based access control (RBAC)
- Directory integration (SCIM)
- Real-time notifications
- Multi-platform support

## Components

### packages/api
Express.js backend with SQLite database. Handles ticket submission, user management, kiosk activation, and integrations.

**Key Features:**
- REST API for all operations
- SQLite database with automatic migrations
- Comprehensive security middleware
- Rate limiting and input validation
- Integration with HelpScout, ServiceNow, and Slack

### apps/admin
React admin interface for managing the help desk system.

**Key Features:**
- Ticket and user management
- Kiosk activation and monitoring
- System configuration
- Real-time status monitoring
- Responsive design

### apps/kiosk
SwiftUI iPad application for end-user ticket submission.

**Key Features:**
- QR code and manual activation
- Offline capability with caching
- Directory integration for user lookup
- Touch-friendly interface

### apps/slack
Slack integration for ticket submission via slash commands.

### macos/
Native macOS launcher application.

## Architecture

```
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  apps/admin   │    │  apps/kiosk   │    │  apps/slack   │
│ (React SPA)   │    │ (iPad App)    │    │ (Slack Bot)   │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                ┌────────────▼─────────────┐
                │      packages/api        │
                │   (Express + SQLite)    │
                └─────────────────────────┘
```

## Installation & Setup

### Automated Setup
```bash
./installers/setup.sh
```

### Manual Setup
```bash
# Install dependencies for each component
cd packages/api && npm ci
cd ../apps/admin && npm ci
cd ../apps/slack && npm ci

# Initialize environment files
./scripts/init-env.sh

# Start services individually
cd packages/api && npm start &
cd ../apps/admin && npm run dev &
cd ../apps/slack && npm start &
```

### Environment Configuration
Edit the `.env` files in each component directory:

#### packages/api/.env
```
API_PORT=3000
SESSION_SECRET=your-secure-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
KIOSK_TOKEN=your-kiosk-token
SMTP_HOST=your-smtp-server
HELPDESK_EMAIL=helpdesk@example.com
```

#### apps/admin/.env
```
VITE_API_URL=http://localhost:3000/api/v1
VITE_ADMIN_URL=http://localhost:5173
```

## Getting Started

1. **Install Dependencies**
   ```bash
   ./installers/setup.sh
   ```

2. **Configure Environment**
   ```bash
   cp .env.local.example .env.local
   ./scripts/init-env.sh
   ```

3. **Start Services**
   ```bash
   ./installers/start-all.sh
   ```

4. **Access Applications**
   - QueueIT Portal: http://localhost:5173
   - API: http://localhost:3000
   - Kiosk: Build and run in Xcode

# API Versioning and Config Management

QueueIT now supports versioned API endpoints. All routes are available under `/api/v1/` (current) and `/api/v2/` (reserved for future changes). All frontend, scripts, installers, and documentation have been updated to use `/api/v1` endpoints.

## Editable Config via API
- Branding, SMTP, SSO, status, and directory config are now editable via dedicated API endpoints:
  - `/api/v1/branding` (GET/PUT)
  - `/api/v1/smtp-config` (GET/PUT)
  - `/api/v1/sso-config` (GET/PUT)
  - `/api/v1/status-config` (GET/PUT)
  - `/api/v1/directory-config` (GET/PUT)
- Secrets and infrastructure settings (SMTP password, JWT secret, etc.) remain in environment variables and are never exposed via the API.

## Security
- All config endpoints require authentication and proper permissions.
- Secrets are never returned in API responses.

## Migration Notes
- All legacy endpoints outside `/api/v1` have been removed.
- All scripts, installers, and documentation reference `/api/v1`.
- Admin UI forms map to new config endpoints and handle responses/errors gracefully.

## Example Environment Variable Usage
Set your frontend `.env` files to use the versioned API URL:

```
VITE_API_URL=http://localhost:3000/api/v1
```

See [packages/api/README.md](packages/api/README.md#api-versioning) and [docs/quickstart.md](docs/quickstart.md) for more details and request/response examples.

# End of API Versioning and Config Management Section

## Security

See [SECURITY_FIXES.md](SECURITY_FIXES.md) for detailed security implementation.

### Key Security Features
- Strong password hashing (bcrypt with 12 salt rounds)
- Rate limiting and brute force protection
- Input validation and SQL injection prevention
- Security headers (CSP, XSS protection)
- Session security and HTTPS enforcement
- Secure kiosk activation with time-limited codes

### Production Security Checklist
- [ ] Set strong `SESSION_SECRET`
- [ ] Change default admin password
- [ ] Configure `KIOSK_TOKEN` for secure registration
- [ ] Enable HTTPS with valid certificates
- [ ] Set up proper CORS origins
- [ ] Configure secure SMTP settings
- [ ] Review and test all security headers

## Development

### Code Style Guidelines
- Use modern JavaScript with ES modules
- Indent files with two spaces
- Keep components and functions short and clearly named
- Share design tokens from `design/theme.js`

### Testing
```bash
# Run tests for each component
cd packages/api && npm test
cd ../apps/admin && npm test
cd ../apps/slack && npm test
```

### Development Scripts
```bash
# Start development environment
./queueit-dev.sh

# Test local setup
./test-local-setup.sh

# Clean iOS build (if needed)
cd apps/kiosk && ./clean-build.sh
```

## Deployment

### Production Deployment
1. Build all components:
   ```bash
   cd apps/admin && npm run build
   cd packages/api && npm run build # if applicable
   ```

2. Configure production environment variables
3. Set up reverse proxy (nginx recommended)
4. Configure SSL certificates
5. Set up database backups
6. Configure log rotation

### Platform-Specific Installers
- **Windows**: `installers/make-windows-installer.ps1`
- **macOS**: `installers/make-installer.sh`
- **Linux**: `installers/make-linux-installer.sh`

## Troubleshooting

### Common Issues

#### API Connection Issues
1. Check if API is running: `curl http://localhost:3000/api/v1/health`
2. Verify environment variables are set
3. Check database file permissions

#### iOS Kiosk Build Issues
1. Clean build: `cd apps/kiosk && ./clean-build.sh`
2. Check Xcode version compatibility
3. Verify iOS simulator connectivity to localhost

#### Authentication Problems
1. Check session secret is set
2. Verify admin user exists: `cd packages/api && node cli.js list`
3. Reset admin password: `cd packages/api && node cli.js update-password`

### Log Locations
- API logs: Check console output or configured log file
- Admin UI: Browser developer console
- iOS Kiosk: Xcode console when debugging

### Getting Help
1. Check existing documentation in `docs/` folder
2. Review component-specific README files
3. Check test files for usage examples
4. Review security documentation for secure deployment

## Support

- Check the [troubleshooting section](quickstart.md#troubleshooting) 
- Review [security guidelines](security.md) for production deployment
- See [development guide](development.md) for contributing

## Component Documentation
- [API Documentation](packages/api/README.md)
- [Admin UI Documentation](apps/admin/README.md)
- [iOS Kiosk Documentation](apps/kiosk/README.md)
- [Slack Integration](apps/slack/README.md)
- [macOS Launcher](macos/README.md)
