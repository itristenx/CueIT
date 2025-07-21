# Nova Admin (Legacy)

⚠️ **This is a legacy application being phased out. Please use Nova Core for new development.**

Modern, enterprise-grade admin interface for managing Nova Universe kiosks, users, and support tickets.

## Features

- **Modern Tech Stack**: Built with React 18, TypeScript, Vite, and Tailwind CSS
- **Enterprise Architecture**: Scalable, maintainable, and type-safe codebase
- **Comprehensive Management**: 
  - Dashboard with real-time statistics
  - Support ticket management with advanced filtering
  - Kiosk monitoring and configuration
  - User management with role-based access control
  - Analytics and reporting
  - System notifications
  - Configurable settings and branding

## Migration Notice

This legacy admin interface is being replaced by **Nova Core**. New features should be developed in Nova Core. This application is maintained for backward compatibility only.

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand
- **HTTP Client**: Axios with interceptors
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Icons**: Heroicons
- **Forms**: React Hook Form (ready for implementation)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Nova Synth API server running

### Installation

1. Clone the repository and navigate to the admin directory:
   ```bash
   cd nova-admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the API URL in `.env` if needed:
   ```
   VITE_API_URL=http://localhost:3000/api/v1
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   └── layout/         # Layout components (Sidebar, Header, etc.)
├── pages/              # Page components
├── stores/             # Zustand state stores
├── lib/                # Utilities and API client
├── types/              # TypeScript type definitions
└── main.tsx           # Application entry point
```

## Key Features

### Dashboard
- Real-time system statistics
- Recent ticket overview
- Kiosk status monitoring
- Quick actions and navigation

### Ticket Management
- Comprehensive ticket listing with filtering
- Search by name, email, system, or title
- Filter by status, urgency, and date range
- Bulk operations and export capabilities

### Kiosk Management
- Real-time kiosk status monitoring
- Remote activation/deactivation
- Configuration management
- QR code generation for kiosk activation
- Status monitoring (open/closed/error)

### User Management
- User account creation and management
- Role-based access control (RBAC)
- Permission management
- User activity tracking

### Settings & Configuration
- System-wide configuration options
- Branding customization (logos, colors, messages)
- Security settings
- Notification preferences

## API Integration

The admin interface communicates with the Nova Synth API server through a centralized API client (`src/lib/api.ts`) that handles:

- Authentication with JWT tokens
- Request/response interceptors
- Error handling and retries
- Type-safe API calls

## Authentication

- JWT-based authentication
- Automatic token refresh
- Protected routes
- Role-based access control

# Nova Admin UI Configuration (Legacy)

## API Endpoints
- All admin UI API calls use `/api/v1` endpoints.
- Config management (branding, SMTP, SSO, status, directory) is handled via dedicated endpoints.

## Editable Config
- Branding: `/api/v1/branding`
- SMTP: `/api/v1/smtp-config`
- SSO: `/api/v1/sso-config`
- Status: `/api/v1/status-config`
- Directory: `/api/v1/directory-config`

## Environment Variables
- `VITE_NOVA_API_URL` — Set to API base URL (e.g., `http://localhost:3001/api/v2`)

## Security
- All config endpoints require authentication.
- Secrets are not exposed to the frontend.

## Migration
- All legacy endpoints removed. Only `/api/v1` is used.
- UI forms map to new config endpoints and use the new variable name.

## Example Usage
Update all code references from `VITE_API_URL` to `VITE_NOVA_API_URL`.
See API documentation for request/response examples.
# End of Admin UI Configuration Section

## Contributing

1. Follow TypeScript best practices
2. Use the established component patterns
3. Maintain type safety throughout
4. Follow the existing code style
5. Add proper error handling
6. Include JSDoc comments for complex functions

## Environment Variables

- `VITE_API_URL`: URL of the Nova Synth API server

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the Nova Universe system and follows the same licensing terms.
