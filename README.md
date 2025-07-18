# CueIT

An internal help desk application for submitting and tracking IT tickets.

[→ Quickstart Guide](docs/quickstart.md)

The repository contains several apps:

- **cueit-api** – Express/SQLite API
- **cueit-admin** – React admin interface with integrated kiosk activation management
- **cueit-kiosk** – iPad kiosk for ticket submission
- **cueit-slack** – Slack slash command integration
- **cueit-macos-swift** – SwiftUI launcher for macOS

The `design/theme.js` file defines shared colors, fonts and spacing. Frontends
import these tokens so styles remain consistent across the admin UI and SwiftUI kiosk app.

The admin interface now includes integrated kiosk activation management, eliminating
the need for a separate activation interface.

## Requirements
- [Node.js](https://nodejs.org/) 18 or higher
- npm
- sqlite3
- [Mailpit](https://github.com/axllent/mailpit) (SMTP testing server)
- Xcode on macOS if you plan to build the SwiftUI kiosk

## Quick Start

```bash
git clone https://github.com/your-org/CueIT.git
cd CueIT
./installers/setup.sh
./scripts/init-env.sh
./installers/start-all.sh
```

Open http://localhost:5173 to access the admin interface.

**Default login:** admin@example.com / admin

## Setup

Run `./installers/setup.sh` to install Node.js, SQLite and all project dependencies in one step.
Copy `.env.local.example` to `.env.local` and adjust any values for your machine.
Next run `./scripts/init-env.sh` to create the `.env` files for each app (edit them before launching).
You can also follow the manual instructions below.
See [Local vs Production Setup](docs/environments.md) for details on configuring the environment variables used by each service.

### Backend
1. Navigate to `cueit-api`.
2. Run `npm install` to install dependencies.
3. Edit the `.env` file with your SMTP configuration and `HELPDESK_EMAIL`.
   To send tickets directly to HelpScout instead, provide
   `HELPSCOUT_API_KEY` and `HELPSCOUT_MAILBOX_ID` (optionally set
   `HELPSCOUT_SMTP_FALLBACK=true` to also send email). Alternatively set
   `SERVICENOW_INSTANCE`, `SERVICENOW_USER` and `SERVICENOW_PASS` to
   create incidents in ServiceNow. You can also customize `API_PORT`,
   `LOGO_URL` and other defaults.
4. Start the server with `node index.js` (uses `API_PORT`, default `3000`).

### Admin Frontend
1. Navigate to `cueit-admin`.
2. Run `npm install` to install dependencies.
3. Edit the `.env` file and set `VITE_API_URL`. You can also set `VITE_LOGO_URL`.
4. Start the development server with `npm run dev` and open `http://localhost:5173`.

The admin interface includes comprehensive kiosk management functionality, including:
- Kiosk activation via QR codes or manual entry
- System configuration management for ticket categories
- Server management and restart capabilities
- User management with role-based access control
- Integrated security features with rate limiting and input validation

The backend stores ticket logs in a local SQLite database (`cueit-api/log.sqlite`).
Configuration values are stored in the same database and can be edited from the admin UI.

### Slack Service
1. Create a Slack app following [Slack's app setup guide](https://api.slack.com/apps) and add a `/new-ticket` slash command (see [Slash commands documentation](https://api.slack.com/interactivity/slash-commands)). Set its request URL to this service.
2. Navigate to `cueit-slack` and run `npm install`.
3. Edit the `.env` file and set:
   - `SLACK_SIGNING_SECRET`
   - `SLACK_BOT_TOKEN`
   - `API_URL`
   - optional `SLACK_PORT` (defaults to `3001`)
4. Start the service with `node index.js`. It listens on `SLACK_PORT`.
5. For local testing expose the port with `ngrok` and use the HTTPS URL in your Slack command:

```bash
npx ngrok http $SLACK_PORT
```

### HTTPS Setup

1. Generate a self-signed certificate:

   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365
   ```

2. Set `TLS_CERT_PATH` and `TLS_KEY_PATH` in `cueit-api/.env` to the certificate paths.
3. Update the URLs in all `.env` files to use `https://localhost` as shown in the examples.
4. Place `cert.pem` and `key.pem` in the project root before running the installer scripts so the files are bundled.

### Running All Services

Scripts are provided to launch the API, admin UI, and Slack
service together using `concurrently`. When running the script you will be
prompted to choose which apps to start (press **Enter** for all). For each
selected app the script verifies that a `.env` file exists and installs
dependencies if the `node_modules` directory is missing. Each service is
started with `npm start` so its environment file loads correctly.

```powershell
./installers/start-all.ps1
```

### macOS Launcher

Use the SwiftUI launcher in `cueit-macos-swift` to start the services with a single click. Run `./installers/make-installer.sh <version>` to build a `.pkg` installer and launch **CueIT** from Applications.
All installer scripts reside in the `installers/` directory.
See [docs/installers.md](docs/installers.md) for detailed instructions.
Run `./installers/uninstall-macos.sh` to remove the app and `./installers/upgrade-macos.sh` to rebuild and reinstall.
During development open the Xcode project and build the **CueITApp** target.

The SwiftUI kiosk can only be built and run on macOS with Xcode installed.

### Windows Installer

Install [Inno Setup](https://jrsoftware.org/isinfo.php) along with Node.js and npm.
Run the following command to generate `CueIT-<version>.exe`:

```powershell
./installers/make-windows-installer.ps1 -Version 1.0.0
```

Run the generated `.exe` to install CueIT.

### Linux Installer

Install `electron-installer-appimage` globally with:

```bash
npm install -g electron-installer-appimage
```

Then build the AppImage:

```bash
./installers/make-linux-installer.sh 1.0.0
```

Mark the output file executable and run it to start the application.

All installer and upgrade scripts live in `installers/` and should include basic tests to verify they work.

## Running Tests

CueIT includes automated test suites for the backend API and the admin UI.

### cueit-api

1. `cd cueit-api`
2. `npm install`
3. `npm test`

The API tests are written with Mocha and exercise the main Express endpoints.

### cueit-admin

1. `cd cueit-admin`
2. `npm install`
3. `npm test`

This suite uses Jest and React Testing Library to validate the UI.

See the [contributor guide](docs/development.md) for additional details.
When adding JavaScript tests for installer scripts be sure to run `npm run lint` in the package you updated.

## Testing the API

To manually submit a ticket you can use `curl`:

```bash
curl -X POST http://localhost:3000/submit-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "name": "[CUSTOMER NAME]",
    "email": "example@example.com",
    "title": "IT Tester Account",
    "system": "[NAME OF SYSTEM]",
    "urgency": "[Urgent, High, Medium, Low]",
    "description": "This is an example of a description"
}'
```

For a complete description of all endpoints see
[cueit-api/README.md](cueit-api/README.md#api-endpoints).

## HelpScout Integration

When `HELPSCOUT_API_KEY` and `HELPSCOUT_MAILBOX_ID` are defined in
`cueit-api/.env`, the API creates a new HelpScout conversation for each ticket
submitted to `POST /submit-ticket`. Set `HELPSCOUT_SMTP_FALLBACK=true` if you
want the server to also send the ticket email using your SMTP configuration.

## ServiceNow Integration

Set `SERVICENOW_INSTANCE`, `SERVICENOW_USER` and `SERVICENOW_PASS` in
`cueit-api/.env` to create incidents via ServiceNow's REST API when tickets are
submitted. The incident ID returned by ServiceNow is stored with each log
entry.

## Kiosk Activation

When the iPad kiosk application launches it sends a `POST` request to
`/api/register-kiosk` with a unique identifier. The backend stores the kiosk in
the `kiosks` table with `active` set to `0` (inactive). A kiosk cannot submit
tickets until it is activated.

An administrator can toggle the `active` flag from the **Kiosks** tab in the
admin UI or directly from the iPad kiosk. The admin interface calls
`PUT /api/kiosks/:id/active` to update the flag. When a kiosk is inactive the
app displays an activation screen showing the API URL and kiosk ID. Tapping the
**Activate** button sends the request to enable the kiosk.

To remotely disable a kiosk open the **Kiosks** tab in the admin UI and toggle
the active switch to the off position. You can also send a `PUT` request to
`/api/kiosks/{id}/active` with `{ "active": false }` to deactivate a kiosk via
the API. The kiosk will stop displaying the ticket form once its next activation
check detects the change.

## Components

- **cueit-api** – Express backend with SQLite database
- **cueit-admin** – React admin interface  
- **cueit-kiosk** – iPad kiosk app for ticket submission
- **cueit-slack** – Slack integration
- **cueit-macos-swift** – macOS launcher

## Documentation

- [📖 Full Documentation](docs/README.md)
- [🚀 Quick Start Guide](docs/quickstart.md)
- [🔒 Security & Production](docs/security.md)
- [🔧 Development Guide](docs/development.md)

## Requirements

- Node.js 18+
- SQLite3
- Xcode (for iPad kiosk)

## Environment Variables

Each app relies on a few environment variables:

### Backend

- `HELPDESK_EMAIL` – destination address for ticket emails.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` – SMTP credentials used by
  Nodemailer.
- `HELPSCOUT_API_KEY`, `HELPSCOUT_MAILBOX_ID` – enable HelpScout integration
  for ticket submissions.
- `HELPSCOUT_SMTP_FALLBACK` – set to `true` to also send email via SMTP.
- `SERVICENOW_INSTANCE`, `SERVICENOW_USER`, `SERVICENOW_PASS` – create
  incidents in ServiceNow instead of email.
- `SESSION_SECRET`, `SAML_ENTRY_POINT`, `SAML_ISSUER`, `SAML_CERT`,
  `SAML_CALLBACK_URL`, `ADMIN_URL` – required for SAML login.
- Optional: `API_PORT` (default `3000`), `LOGO_URL`, `FAVICON_URL`.
- Optional: set `TLS_CERT_PATH` and `TLS_KEY_PATH` to enable HTTPS.
- `ADMIN_PASSWORD` – seeds the initial admin password for kiosk login and the
  password management endpoints.
- `JWT_SECRET` – secret used to sign JSON Web Tokens.
- `JWT_EXPIRES_IN` – token expiration (e.g., `1h`).
- `SCIM_TOKEN` – bearer token required for SCIM provisioning endpoints.
- `KIOSK_TOKEN` – secure token required for kiosk registration.
- `DISABLE_AUTH` – set to `true` to bypass SAML authentication and
  access the admin UI before SSO is configured.

### Admin UI

- `VITE_API_URL` – base URL of the backend API.
- `VITE_LOGO_URL` – default logo shown before configuration is loaded.
- `VITE_FAVICON_URL` – default favicon for the page.

### Slack Service

- `SLACK_SIGNING_SECRET` – Slack app signing secret.
- `SLACK_BOT_TOKEN` – bot token with permissions to open modals and post
  messages.
  - `API_URL` – base URL of the backend API for ticket submission.
  - Optional: `SLACK_PORT` (default `3001`).

## Development

Before committing any changes, navigate into each package you modified and run:

```bash
npm run lint
npm test
```

For details on the workflow see [docs/development.md](docs/development.md).

## Security & Production Readiness

CueIT includes comprehensive security features:

- **Input Validation** – All API endpoints validate and sanitize user input
- **Rate Limiting** – Brute force protection on authentication endpoints
- **Security Headers** – CSP, XSS protection, and HTTPS enforcement
- **Password Security** – Strong password hashing with bcrypt (12 salt rounds)
- **Session Security** – Secure session management with httpOnly cookies
- **Kiosk Security** – Secure activation codes and registration tokens

See [docs/security.md](docs/security.md) for detailed security documentation.

## Future Improvements

Additional features planned for future releases:

- **Enhanced Authentication** – Multi-factor authentication support
- **Advanced Logging** – Detailed audit logs and monitoring
- **API Rate Limiting** – Per-user rate limiting for API endpoints
- **Database Encryption** – At-rest encryption for sensitive data

## License

See [LICENSE](LICENSE) file for details.
