
# 🤖 AI Agent Prompt: Complete & Validate NOVA Ticketing System

This document outlines the requirements for the **NOVA Ticketing System**. The agent must:

- Check if each feature exists in the current codebase.
- If missing, implement it completely.
- If present but incomplete or vulnerable, fix and harden it.
- Maintain a `progress_tracker.md` with accurate statuses and any unresolved tasks.
- Ensure the platform is fully functional for end users.

---

## 🎯 Core Modules to Audit and Complete

### 1. 📥 Email & Notification Workflow

- [ ] Support spam detection logic (mark as spam, archive, reviewable by humans).
- [ ] Allowlist email domains that are allowed to generate tickets.
- [ ] Send branded, customizable SMTP notifications via UI-managed templates.
- [ ] Send real-time email & Slack updates as tickets progress.

### 2. 🎟 Ticket Lifecycle & Workflow

- [ ] Archive/unarchive tickets.
- [ ] Lock ticket reassignment to assigned agents (except Admin/Leads).
- [ ] Allow anyone to add internal/public notes (RBAC-sensitive).
- [ ] Link ticket submitter to a unified customer database (SSO linked).
- [ ] Implement “undo send” with admin-configurable timeout.
- [ ] Export ticket(s) as PDF or CSV.
- [ ] Support parent/child ticket structures.
- [ ] Support merge/split/undo-merge logic.
- [ ] Track time worked on tickets.
- [ ] Schedule recurring tickets.
- [ ] Notify on new tickets (UI sounds, Slack, browser, app).
- [ ] Attachments support (including hide from end user).
- [ ] Public Ticket URL view (no login required).
- [ ] View archived/deleted tickets.
- [ ] Full ticket history log (audit trail).
- [ ] Attach related KB articles to ticket.
- [ ] Support resolution tracking.
- [ ] Ticket watchers (user, manager, IT team).
- [ ] “User is viewing” UI indicator.
- [ ] Mass ticket update UI/API.
- [ ] AI metadata tagging (System, User, Priority, etc.).
- [ ] AI summarization of ticket contents.
- [ ] AI reply suggestions based on KB.
- [ ] Shared ownership (multiple agents).
- [ ] Parent can’t close until children are closed.
- [ ] Related ticket linkage view.
- [ ] Tracker ticket feature for grouped messages.
- [ ] Internal broadcast messages from Tracker to related tickets.
- [ ] RBAC group assignment logic (assign tickets to internal groups).

---

### 3. 🕹 Gamification

- [ ] Allow admins to create quests with rules and rewards.
- [ ] Admins can manually adjust user XP or levels.
- [ ] Admin XP reset functionality.
- [ ] Sync with Nova ID gamification system and XP system.

---

### 4. ⏱ SLA Management

- [ ] Individual SLA support per organization.
- [ ] Full business hour/holiday scheduling.
- [ ] UI for managing schedules and SLAs.
- [ ] Auto-escalation via email for unresponsive agents.

---

### 5. 🔄 Ticket Distribution

- [ ] Round-robin assignment mode.
- [ ] Default agent for system auto-assignment.
- [ ] Workload-aware assignment logic.

---

### 6. 📝 Default Ticket Fields (Ensure Admin UI Support)

- [ ] Requester Email (mandatory, used for login or auto-account creation).
- [ ] Subject (text).
- [ ] Type (dropdown, customizable: Billing, Error, Feature Request, etc.).
- [ ] Source (dropdown).
- [ ] Status (dropdown).
- [ ] Priority (dropdown).
- [ ] Group (dropdown).
- [ ] Agent (dropdown).
- [ ] System/Product (dropdown).
- [ ] Description (multiline).

---

### 7. 🔢 Record Types (Affect Ticket ID Prefix)

- [ ] REQ- Request
- [ ] INC- Incident
- [ ] TASK- Task
- [ ] CR- Change Request
- [ ] HRC- HR Ticket
- [ ] OPS- Ops Ticket
- [ ] ISAC- Cybersecurity Ticket
- [ ] FB- Feedback

Rules:
- [ ] Ticket type prefix is immutable once generated.
- [ ] Tickets can be duplicated with correct prefix.
- [ ] Some ticket types (e.g., CR) only creatable by leads/admins.
- [ ] Automatic flows: REQ → TASK after approval, INC → CR if needed.

---

### 8. 📊 Unified Status Flow & Dashboard

- [ ] Status automation per ticket type.
- [ ] Wallboard / Live Dashboards / Slack alert integration.
- [ ] Progress visualizations by type and queue.
- [ ] Ensure proper flows between ticket types as per flow chart.

---

## 📁 File Outputs Required

1. `progress_tracker.md`  
   > Track all features listed above with checkboxes, notes, last check timestamp, and assigned agent if relevant.

2. `remaining_tasks.md`  
   > List any partially implemented, buggy, or unstarted features based on the repo audit.

---

## 🔐 Security & Validation

- [ ] All features must include permission checks (RBAC).
- [ ] Validate all inputs (form/UI/API).
- [ ] Log unauthorized attempts.
- [ ] Harden attachment and public ticket views.
- [ ] Use consistent tokenized access for public links.

---

## ✅ Final Step

Once all items are complete:

- Validate full user journey as an end user, agent, and admin.
- Confirm UI, API, and email/Slack flows are functional.
- Mark the system as production ready in `progress_tracker.md`.


-----------------------------------------------------------------------------


# 🤖 AI Agent Prompt: Complete & Validate Nova ID

This module powers identity, authentication, and role-based access control across the NOVA Universe. The AI agent must ensure the system is robust, scalable, secure, and supports modular access policies for every application within the platform.

---

## 🔐 Identity Management Features

- [ ] Implement **Nova ID** as the universal identity provider across all NOVA modules.
- [ ] Support email/password login and SSO via Okta, Azure AD, and Google Workspace.
- [ ] Support Just-In-Time (JIT) user provisioning via SAML and SCIM.
- [ ] Provide secure session handling (token-based with refresh lifecycle).
- [ ] MFA support (TOTP, WebAuthn) with admin-enforced policy settings.

---

## 👥 User Profiles

- [ ] Allow user profiles to store name, email, department, title, org affiliation, and avatar.
- [ ] Auto-link user metadata from identity provider via SCIM or SAML assertions.
- [ ] Expose profile editor to end users, with admin override for fields.
- [ ] Include global unique ID (NovaID) for each user, used across all modules.

---

## 🧑‍💼 Role-Based Access Control (RBAC)

- [ ] Support the following default roles:
  - `guest`: unauthenticated
  - `end_user`: default logged-in user
  - `manager`: can oversee users and tickets
  - `technician`: handles assigned work
  - `tech_lead`: manages queues and config
  - `admin`: full system access
  - `hr_ops_facilities`: department-specific admins

- [ ] Allow modular roles by app/module (e.g., Beacon Technician, Orbit Admin).
- [ ] UI for admin to assign roles, view permissions matrix, and audit user activity.
- [ ] Implement permission checks across all modules and APIs based on RBAC.

---

## 🎫 Authentication & SSO

- [ ] Support login via:
  - Email + Password
  - Okta
  - Microsoft Entra ID (Azure AD)
  - Google Workspace
- [ ] Provide branded login screens (white-labeled per org).
- [ ] Implement logout across all NOVA modules (single logout support).

---

## 🧵 SCIM Integration

- [ ] SCIM 2.0 support for provisioning/deprovisioning.
- [ ] Allow mapping roles, group memberships, department fields from SCIM.
- [ ] Expose SCIM endpoints securely for Okta and Azure integrations.

---

## 📁 File Outputs Required

1. `progress_tracker.md`  
   > Track identity and RBAC setup, with timestamps, test users, and status of each role and integration.

2. `remaining_tasks.md`  
   > Record unimplemented SSO or RBAC gaps across the Nova platform.

---

## ✅ Final Step

- Confirm login, role assignment, SCIM sync, and session flow are fully operational.
- Test across all modules (Beacon, Orbit, Core, etc.).
- All apps should respect RBAC and session tokens.
- Mark complete in `progress_tracker.md`.



--------------------------------------------------------------------------------


# 🤖 AI Agent Prompt: Complete & Validate Nova Orbit (End User Portal)

Nova Orbit is the main end-user experience for submitting and viewing tickets, accessing knowledge articles, interacting with Cosmo AI, and viewing request status. It must be intuitive, secure, and responsive.

---

## 🧾 Core Features

- [ ] Authenticated portal experience for end users (Nova ID).
- [ ] Display user-submitted tickets (including status, priority, last activity).
- [ ] Allow users to:
  - Submit new requests (linked to appropriate ticket type).
  - Reply to tickets.
  - Upload attachments.
  - View status history and associated KB articles.
- [ ] Search bar with filters (by status, keyword, type).
- [ ] Ticket feedback flow (CSAT rating, optional comments).
- [ ] Cosmo assistant access from all pages (chat bubble or slide-over).
- [ ] Allow watching a ticket and receiving updates.
- [ ] Allow viewing linked or related tickets.

---

## 📚 KB Integration

- [ ] Browse or search Knowledge Base articles (from Nova Lore).
- [ ] View suggested KB articles when typing a new request.
- [ ] Allow user to confirm if an article solved their problem.
- [ ] Provide feedback on articles to improve them.

---

## ⚙️ Settings & Profile

- [ ] Edit profile (avatar, phone, department if allowed).
- [ ] Opt into or out of notifications.
- [ ] View linked organizations and request categories.
- [ ] Mobile responsive layout.

---

## 🌐 Accessibility & UX

- [ ] Ensure full accessibility (WCAG AA).
- [ ] Use modern design with smooth animations, clean layouts (Apple-inspired).
- [ ] Ensure performance and minimal page load times.

---

## ✅ Final Step

- Ensure login, ticket submission, KB search, and Cosmo AI all function correctly.
- Confirm proper permission scoping and visibility.
- Update `progress_tracker.md` with feature status and any gaps.


--------------------------------------------------------------------------------


# 🤖 AI Agent Prompt: Complete & Validate Nova Beacon (iPad Kiosk App)

Nova Beacon is a SwiftUI-based kiosk app for creating IT, HR, and Ops requests from iPads placed in public areas. It should be beautiful, secure, and able to work with remote configuration.

---

## 🧾 Required Features

- [ ] Launch screen > Idle/Welcome screen > Form > Success screen.
- [ ] Remote configuration from Nova Core:
  - Logo, kiosk name, department
  - System list, available ticket types
  - Indicator status (open/closed with Zoom-style UI)
- [ ] Form Fields:
  - Name (manual or pulled from Active Directory)
  - Email (required)
  - Title
  - Urgency (triggers manager fields)
  - Description
  - Affected System
- [ ] Manager section appears on high urgency.
- [ ] Submit via SMTP or API to backend.
- [ ] Success screen with timeout to home screen.
- [ ] Failure screen with retry/cancel option.

---

## 📆 Status Indicator UI

- [ ] Configurable open/closed schedule
- [ ] Live indicator on kiosk UI (green/red with messaging)
- [ ] Controlled remotely from Nova Core
- [ ] Support custom messaging (e.g., “Technician en route”)

---

## 🔐 Security & Config

- [ ] Local PIN or remote admin unlock to access settings.
- [ ] QR code or activation code pairing with Nova Core.
- [ ] Offline support with local cache + retry.
- [ ] Branded, animated, iOS-native experience.

---

## ✅ Final Step

- Validate submission, error handling, remote control.
- Ensure uptime and recovery from loss of internet.
- Update `progress_tracker.md`.


--------------------------------------------------------------------------------


# 🤖 AI Agent Prompt: Complete & Validate Nova Comms (Slack App)

Nova Comms enables users to submit and track tickets from Slack using slash commands. It should also support technician interactions and admin alerts.

---

## 💬 Slash Commands

- [ ] `/it-help` command:
  - Opens modal with same fields as Nova Orbit
  - Slack user info prefilled
  - Submit creates a ticket in backend and sends email
- [ ] `/my-tickets` command:
  - Lists user's open/pending tickets
  - Options to close/reply from Slack

---

## 🔔 Notifications

- [ ] DM user when their ticket is updated (status, assignment, reply)
- [ ] Send alerts to team channels (configurable in Nova Core)
- [ ] Cosmo response integration with `/ask-cosmo`

---

## 🛠 Tech Support Mode

- [ ] Allow technicians to claim tickets
- [ ] Allow slash commands to run actions (e.g., escalate, assign)
- [ ] Respect RBAC from Nova ID

---

## ✅ Final Step

- Test all slash commands across Slack Enterprise Grid
- Ensure failover behavior and good error messaging
- Log events to audit trail
- Update `progress_tracker.md`


--------------------------------------------------------------------------------


# 🤖 AI Agent Prompt: Complete & Validate Nova Core (Admin Portal)

Nova Core is the unified control center for configuring the Nova platform. Admins use it to manage users, kiosks, email, branding, workflows, etc.

---

## 🧩 Core Admin Features

- [ ] User Management (assign roles, view login history, edit metadata)
- [ ] Kiosk Management (remote config, logo upload, pairing QR code)
- [ ] Ticket System Settings:
  - Add/edit systems
  - SLA rules
  - Distribution logic
  - Workflows and automations
- [ ] Branding Settings:
  - Logos
  - Theme colors
  - Custom email templates
- [ ] Integration Management:
  - SMTP config
  - Slack App
  - ServiceNow/HelpScout connections
  - SCIM/SSO setup

---

## ⚙️ Advanced Features

- [ ] App version control and updates
- [ ] Wallboard UI for status monitoring
- [ ] Logs and audit trail
- [ ] Config export/import (JSON or YAML)

---

## ✅ Final Step

- Validate all integrations, SSO, kiosk management
- Confirm RBAC enforcement
- Update `progress_tracker.md`


--------------------------------------------------------------------------------


# 🤖 AI Agent Prompt: Complete & Validate Nova Pulse (Technician Portal)

Nova Pulse is where technicians view queues, resolve tickets, and compete via gamification.

---

## 🧰 Technician Tools

- [ ] View queue by system/type
- [ ] Claim/unclaim tickets
- [ ] Bulk updates and status changes
- [ ] Time tracking + work logs
- [ ] Internal-only notes, attachments
- [ ] KB article linking

---

## 🏅 Gamification

- [ ] Earn XP for resolving tickets
- [ ] Track leaderboard in Pulse
- [ ] Badges, streaks, levels
- [ ] Notifications when ranks change
- [ ] Sync with Nova Ascend engine

---

## ✅ Final Step

- Confirm technician workflows are fast and RBAC-safe
- Confirm XP is rewarded properly
- Update `progress_tracker.md`


--------------------------------------------------------------------------------


# 🤖 AI Agent Prompt: Complete & Validate Nova Lore (Knowledge Base)

Nova Lore holds self-service articles and solutions for users and agents.

---

## 📚 Article Features

- [ ] Authoring tools (Markdown WYSIWYG)
- [ ] Search with filters (tag, system, topic)
- [ ] Suggested articles (when writing a ticket)
- [ ] Article stats (views, solves, votes)
- [ ] Gamified XP for article authors
- [ ] Verified badge for trusted solutions
- [ ] Attach to tickets from Pulse

---

## ✅ Final Step

- Confirm articles display properly in Orbit and Pulse
- Ensure article linking and search work
- Update `progress_tracker.md`


--------------------------------------------------------------------------------


# 🤖 AI Agent Prompt: Complete & Validate Nova Deck (Unified App Launcher)

Nova Deck is the single place users can view and access all modules they have access to.

---

## 🧭 Portal Features

- [ ] Display cards for Beacon, Orbit, Pulse, Core, Lore
- [ ] Show unread notifications or open tickets on each module card
- [ ] Only show apps user has access to (via Nova ID RBAC)
- [ ] Support deep links into each module
- [ ] Smooth animations and Apple-style layout

---

## ✅ Final Step

- Ensure role-based visibility
- Ensure responsive layout
- Update `progress_tracker.md`


--------------------------------------------------------------------------------


# 🤖 AI Agent Prompt: Complete & Validate Cosmo (AI Assistant)

Cosmo is the AI layer built into every module. It helps users navigate, suggest KB articles, and summarize tickets.

---

## 🧠 Core Functions

- [ ] Available in Orbit, Core, Pulse, Slack, Beacon
- [ ] Respond to questions using KB (Nova Lore)
- [ ] Summarize tickets in real-time
- [ ] Suggest replies or actions
- [ ] Fun, brand-aligned personality (customizable)

---

## ✅ Final Step

- Confirm Cosmo is accessible from all UIs
- Test fallback behavior when AI is down
- Log interactions
- Update `progress_tracker.md`


--------------------------------------------------------------------------------


# 🤖 AI Agent Prompt: Complete & Validate Nova Ascend (Gamification Engine)

Nova Ascend tracks user XP, rewards, and leaderboards across the NOVA Universe.

---

## 🧩 XP System

- [ ] Unified XP for tickets, KB, feedback
- [ ] Custom quests and missions
- [ ] Leveling system with badges and roles
- [ ] Viewable XP history and rank
- [ ] Admin tools to grant/remove XP
- [ ] Slack announcements for rank-ups

---

## ✅ Final Step

- Ensure XP engine syncs with all modules
- Confirm leaderboard visibility and UX
- Update `progress_tracker.md`


🌌 NOVA Enterprise API, SDK & Database Resilience Blueprint

This document is a complete agentic instruction set to build, verify, and harden the API, SDK, and database infrastructure for the Nova Universe. It is designed for automated execution and validation by AI agents or senior developers. This must be implemented across all modules and hardened for enterprise-grade availability, portability, and security.

All steps below are to be completed, verified, and tracked. No placeholder or temp code is allowed.

⸻

🔁 API Engine — Versioned, Observable, and Secure

✅ Objectives
	•	Robust, discoverable API with long-term versioning support
	•	Centralized error format, logging, and traceable headers
	•	Hardened for multi-tenant, secure, and monitored usage

🔧 Tasks
	1.	Implement API Versioning Middleware
	•	Add URL-based versioning: /api/v1/, /api/v2/
	•	Create version switch middleware that routes to /v1/ handlers
	•	Add endpoint /api/version to return current and deprecated versions
	2.	API Specification and Documentation
	•	Generate OpenAPI 3.0 spec (YAML/JSON)
	•	Serve Swagger UI at /api-docs for live docs
	•	Create changelogs per version: docs/changelog/v1.md
	3.	Error Handling Standardization
	•	Format:

{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Requested resource not found",
    "status": 404
  }
}


	•	Enforce across all endpoints (including legacy ones)

	4.	Rate Limiting & Abuse Protection
	•	Implement per-IP and per-API key throttling using Redis or in-memory store
	•	Use burst-safe logic (e.g., 100 req/min default)
	•	Block/alert on anomalies
	5.	Tracing & Logging
	•	Include headers: X-Request-ID, X-Correlation-ID
	•	Log every request with:
	•	Timestamp
	•	Endpoint
	•	Duration
	•	User agent
	•	IP
	•	Send logs to observability provider (e.g., Sentry, Datadog, Loki)

⸻

📦 SDK — Generation, Usage, and Integration

✅ Objectives
	•	Provide a strongly-typed, installable SDK for API consumers
	•	Auto-generated and linted from OpenAPI
	•	Used across all Nova frontend/backend apps (replacing manual API calls)

🔧 Tasks
	1.	Generate SDK from OpenAPI
	•	Use openapi-generator or orval to create base SDK
	•	Output to sdk/ts/
	•	Add helpers for:
	•	Auth token injection
	•	Refresh token handling
	•	Unified error catching
	2.	Publish SDK
	•	Create private GitHub NPM package: @nova/sdk
	•	Ensure versioning matches the Nova API (v1.0.0 etc.)
	•	Add post-publish GitHub Action
	3.	Replace all Manual Calls with SDK
	•	Nova Orbit (End User Portal): Submit/view tickets
	•	Nova Beacon (Kiosk): Submit requests
	•	Nova Comms (Slack App): Use SDK in Edge Functions
	•	Nova Core (Admin): Dashboards, management tools
	•	Nova Pulse (Technician): Use for gamification/ticket calls
	4.	Track SDK Coverage
	•	Maintain /sdk/README.md with endpoints covered and usage examples
	•	Add automated SDK diff check when new endpoints are added to API

⸻

🗃️ Database — Enterprise-Grade, Backup-Ready, Hardened

✅ Objectives
	•	Resilient PostgreSQL setup with schema versioning
	•	CLI-accessible backup/restore flows
	•	Hardened with no temp/dev settings in production

🔧 Tasks
	1.	Schema Versioning
	•	Use Prisma or Knex to manage migrations
	•	Track all schema changes in /migrations/
	•	Require up and down scripts
	2.	Environment Configuration
	•	Use DATABASE_URL format in .env
	•	No temp/dev overrides allowed in prod code
	•	Validate env setup on deploy via CI
	3.	Daily Backups
	•	Create cron job to dump DB daily to secure cloud storage (S3, etc.)
	•	Retain 30 days of backups
	•	Send alerts on backup failure
	4.	Manual Backup/Restore CLI

# Manual backup
pg_dump -Fc -f backups/nova-$(date +%F).dump nova_prod

# Restore
pg_restore -d nova_restore backups/nova-2025-07-20.dump


	5.	Admin UI Hooks
	•	Add backup/restore triggers to Nova Core
	•	Show current backup status and retention window

⸻

🔐 Secrets and Security

✅ Objectives
	•	Never allow exposed credentials
	•	Harden DB and API access
	•	Ensure SDK/API cannot be misused without authorization

🔧 Tasks
	•	Store secrets in Doppler, Vault, or encrypted GitHub Actions secrets
	•	Enforce HTTPS on all external services
	•	Require JWT or OAuth2 tokens for all SDK/API access
	•	Rotate keys every 90 days minimum

⸻

🔍 Codex / Agent Task Matrix (Execution Order)

Priority	Task
✅	Generate full OpenAPI spec from existing routes
✅	Build @nova/sdk from OpenAPI + create directions to publish to NPM but ensure they can run locally, if not ask the user to publish once completed with all other steps. 
✅	Replace manual calls in Nova apps with SDK imports
✅	Set up /api/v1/ router and deprecation tracker (if v1 still exists. The current API should be v2 or 07.2025)
✅	Set up /api/v2/ (aka 07.2025) router and deprecation tracker
✅	Create changelogs per API version
✅	Harden rate limiting, logging, and error handling
✅	Set up schema migration framework (Prisma or Knex)
✅	Add DB backup cron and CLI scripts
✅	Integrate Admin UI controls for backup/restore
✅	Enforce token-based SDK/API usage across all apps


⸻

✅ Completion Criteria
	•	All Nova Universe apps use the SDK for data access
	•	SDK is versioned, tested, and automatically updated
	•	API is versioned, logged, and documented
	•	DB is fully backed up and recoverable with no placeholder data
	•	Admin UI shows health, backup status, and API changelogs

Agents: Ensure rollback plans exist, unit tests pass, and documentation is updated.

⸻

📁 Output Structure

/api/
  /v1/
  /v2/
  changelog/
  openapi.yaml

/sdk/
  /ts/
  package.json
  README.md

/migrations/
  001_init.sql
  002_add_tickets.sql

/backups/
  nova-2025-07-20.dump

/docs/
  api-docs/
  sdk-usage.md


⸻

This document replaces any ad-hoc setup and is now the source of truth for Nova’s backend resilience and SDK workflows. 

- Update `progress_tracker.md`

Track status in real time and execute end-to-end validation before marking complete.


🌌 NOVA HELIX: Identity & Access Management Specification

This specification defines the identity architecture for Nova, integrating SSO, SCIM, and SAML for seamless enterprise-ready user management, including support for delegation, customer lookup, approval workflows, and full integration with the Nova Universe. This system is managed via Nova Helix and must be API-driven, secure, hardened, and resilient. It is written to be AI agent-executable.

⸻

🔐 Identity Provider Integration

Nova Helix must integrate with enterprise identity providers (IdPs) and support:
	•	✅ SSO (Single Sign-On) via SAML 2.0 / OIDC
	•	✅ SCIM 2.0 for automated provisioning/deprovisioning
	•	✅ Group-based access control
	•	✅ User role mapping and dynamic permission grants

✅ SSO Requirements
	•	Use Nova Helix as the centralized Identity and RBAC manager.
	•	Support IdPs like Okta, Azure Entra ID, Ping Identity, Google Workspace, etc.
	•	Map incoming SAML/OIDC claims to:
	•	email
	•	name
	•	title
	•	department
	•	groups
	•	userType

✅ SCIM Requirements
	•	Support inbound SCIM for:
	•	Creating users
	•	Updating user attributes
	•	Deactivating users
	•	Managing group membership
  • Syncing extended profile information including:
    • `phone_number`
    • `organization_name`
    • `location`
    • `manager_id`
    • `cost_center`
    • `employee_number`

Deactivation Flow:
	•	When a user is removed via SCIM, they must:
	•	Be marked as deactivated in the system
	•	No longer be able to log in or be shown in lookup unless explicitly overridden
	•	Appear in the Admin > Deactivated Users panel for audit and potential deletion

Deletion Flow:
	•	Only deactivated users can be permanently deleted.
	•	Requires admin confirmation and audit trail.
	•	Users must be retained in logs for historical auditing.

⸻

🧑‍💻 User Types & Delegation

✅ Delegation Assignment System

Delegation is implemented as a permission-based assignment, not a user type.

Features:
	•	Any user can delegate access to another user.
	•	Delegation grants include ability to:
	•	Submit tickets on behalf of another
	•	View ticket history of that user
	•	Approve on their behalf (if configured)
	•	Delegation is scoped, meaning:
	•	Only the designated user relationship is permitted
	•	Cannot be used to escalate privileges globally

Expiration & Control:
	•	Delegation can be temporary (with expiry date) or permanent
	•	Delegators and admins can revoke delegations at any time

Security & Audit:
	•	Delegates must be added by the user (auto-approved) or request delegate access in the request portal, running a workflow for approval to the selected user. 
	•	All delegation actions must:
	•	Be logged in the system audit trail
	•	Show both the acting user and the represented user
	•	Be queryable by admin and delegated users

UI Support:
	•	End users can:
	•	Grant/revoke delegation via My Account > Delegation
	•	Configure expiry and scope
	•	Admins can:
	•	View all delegation relationships
	•	Revoke or impose delegations
	•	Enforce rules via policy engine (e.g. max duration, allowed relationships)

Additional Protections:
	•	Delegation cannot be assigned to system-critical roles (e.g., admin → admin)
	•	Delegation must go through optional approval if required by org policy
	•	Rate limiting and tamper detection should be enabled

Example: An Executive Assistant can be granted delegation to act on behalf of their manager until a set end-of-contract date.

⸻

🔄 Sync + Resilience Considerations
	•	All SCIM and SSO syncs should be logged and visible via the Admin > Identity > Sync Logs screen.
	•	Failed provisioning must trigger retry logic with alert notifications.
	•	SCIM/SSO activity should have its own log level and retention period.
	•	A monitoring dashboard should display:
	•	Last successful sync
	•	Most recent changes
	•	Error events

⸻

🔍 Customer Lookup Support (Kiosk + Portal)

Nova Helix must expose a lightweight customer directory API for internal lookup.

✅ Customer Lookup Features
	•	Kiosk and web portal can:
	•	Search for users by name/email/title
	•	Autocomplete results via /api/lookup/customers?q=
	•	Admins can configure:
	•	Searchable fields
	•	Result display formatting (e.g., name + title + dept)
	•	Only active users are returned (deactivated users excluded unless override enabled)
	•	Delegates submitting tickets must be able to select only themselves or the delegated user by lookup
  • Customers should only be able to create tickets for themselves unless they have approved delegation.

✅ : Enable cache fallback for kiosk offline mode.

⸻

🧑‍💻 Permissions & Group-Based Access Control

All permission logic should be centralized in Nova Helix, allowing:
	•	Group-to-role mapping via SSO/SCIM
	•	Dynamic permissions assignment
	•	Fine-grained permission control (e.g., manage forms, view tickets, admin dashboards)
	•	Permissions should cascade cleanly into Nova modules
	•	Support nested group resolution and OIDC custom claims

Ensure roles match what it them system, ensure they are documented and make any logical changes need to make roles robost and understandable. They should also be the ability to create custom roles with specific permissions. 
⸻

✅ Approval Workflow Engine (API-Driven)

The Nova Approval Engine must be implemented as a core part of the Nova API and designed for modular use across all request types.

🧑‍💼 Approval Actors
	•	manager of the requester (based on AD attribute or directory)
	•	system owner (based on ticket system field config)
	•	custom approval group (manually assigned)
	•	delegate (if explicitly granted approval rights)

🛠️ Approval Engine Features
	•	API-first design (/api/approvals)
	•	Multi-step approval chains (e.g., Manager → IT Lead)
	•	Email and Slack notifications (configurable per org)
	•	Auto-escalation if no approval in X hours
	•	Approvals visible in:
	•	Admin UI
	•	Technician UI
	•	Requester Portal (status only / approval UI when manager approval required)
	•	Integration with ticket types and request forms
	•	Approvals must be auditable, filterable, and trigger webhooks

Approval States

Status	Description
pending_approval	Waiting for one or more approvers
approved	Fully approved
rejected	One or more approvers rejected
auto_approved	Approved via config timeout or rules
expired	No action taken, auto-expired


⸻

✅ To-Do Items for Agentic Execution
	1.	Implement SCIM v2.0 ingestion endpoint in nova-helix-api
	2.	Map SAML/OIDC claims to internal role/group system
	3.	Build /api/lookup/customers for Kiosk + Orbit use
	4.	Implement robust, auditable delegation system with UI & API
	5.	Extend ticket and approval APIs to support delegated users
	6.	Build approval workflow engine (/api/approvals) with escalation & rules
	7.	Build Admin UI panels:
	•	User Directory
	•	Deactivated Users
	•	Role/Group Mapping
	•	Delegation Management
	•	Approval Chains & Logs
	8.	Harden all endpoints with audit trails, RBAC middleware, and tamper detection
	9.	Expose Nova Helix SDK for use across Kiosk, Orbit, Comms, and Core
	10.	Implement error handling, rate limiting, sync monitoring, and retry policies
	11.	Create agent-readable documentation and schema definitions for all identity, approval, and delegation models'


  # 📘 Nova Helix SCIM Attribute Specification

This document defines all SCIM (System for Cross-domain Identity Management) attributes that Nova Helix should ingest and manage to support robust, enterprise-grade identity synchronization via SCIM 2.0. It is fully compatible with leading identity providers such as **Okta** and **Microsoft Entra ID (Azure AD)**.

SCIM attributes are grouped into three main schemas:

* **Core SCIM User Schema** (`urn:ietf:params:scim:schemas:core:2.0:User`)
* **Enterprise User Extension** (`urn:ietf:params:scim:schemas:extension:enterprise:2.0:User`)
* **Nova Custom Extension** (`urn:scim:schemas:extension:nova:1.0:User`)

This schema layout ensures full interoperability with Okta and Azure AD SCIM connectors.

---

## ✅ Core SCIM User Schema (`core:2.0:User`)

| Attribute           | Type    | Description                                | Required |
| ------------------- | ------- | ------------------------------------------ | -------- |
| `userName`          | string  | Unique identifier for login                | ✅        |
| `name.givenName`    | string  | First name                                 | ✅        |
| `name.familyName`   | string  | Last name                                  | ✅        |
| `displayName`       | string  | Full name or preferred display name        | ❌        |
| `emails`            | array   | Email addresses (primary + alternates)     | ✅        |
| `phoneNumbers`      | array   | Phone contacts (mobile, work, etc.)        | ❌        |
| `photos`            | array   | Profile pictures or avatars                | ❌        |
| `timezone`          | string  | User’s timezone (e.g., `America/New_York`) | ❌        |
| `preferredLanguage` | string  | Preferred language (e.g., `en-US`)         | ❌        |
| `locale`            | string  | Regional locale (e.g., `en-US`, `fr-FR`)   | ❌        |
| `active`            | boolean | Whether user is active                     | ✅        |
| `externalId`        | string  | Org-specific legacy ID                     | ✅        |
| `roles`             | array   | Optional: informal app roles               | ❌        |

---

## 🧩 Enterprise Extension (`extension:enterprise:2.0:User`)

| Attribute             | Type   | Description                               | Required |
| --------------------- | ------ | ----------------------------------------- | -------- |
| `employeeNumber`      | string | Internal HR/employee ID                   | ❌        |
| `costCenter`          | string | Org cost center or department code        | ❌        |
| `organization`        | string | Name of the company or business unit      | ❌        |
| `division`            | string | Subdivision within organization           | ❌        |
| `department`          | string | Functional group (e.g., IT, HR)           | ❌        |
| `manager.value`       | string | SCIM ID of the user’s manager             | ❌        |
| `manager.displayName` | string | Manager’s full name                       | ❌        |
| `location`            | string | Office or geo-region                      | ❌        |
| `employeeType`        | string | e.g., `full-time`, `contractor`, `intern` | ❌        |

---

## 🌟 Nova Custom Extension (`extension:nova:1.0:User`)

| Attribute        | Type    | Description                                                                                     | Required |
| ---------------- | ------- | ----------------------------------------------------------------------------------------------- | -------- |
| `novaId`         | string  | Unique Nova internal identifier. Can be manually assigned or mapped if user connection is lost. | ❌\*      |
| `isDelegate`     | boolean | Whether user is acting as a delegate                                                            | ❌        |
| `delegateFor`    | array   | List of user IDs this user can act on behalf of                                                 | ❌        |
| `novaTags`       | array   | Internal tag-based metadata (e.g., `VIP`, `Ops`)                                                | ❌        |
| `lastLoginTime`  | string  | ISO timestamp of last login                                                                     | ❌        |
| `lastSyncSource` | string  | Source system (e.g., `Okta`, `AzureAD`)                                                         | ❌        |

> `✅*` – `novaId` is critical for identity continuity within Nova Helix. If SCIM linkage is broken, this value must be manually assigned or recovered by an admin.

---

## 🔄 Sync Best Practices

* SCIM schema must support **multi-schema payloads** per spec for Okta and Azure
* Ensure SCIM server declares supported schemas in `/ServiceProviderConfig`
* All SCIM attributes must be:

  * Validated on ingestion
  * Mapped to internal Nova Helix identity graph
  * Tracked in sync logs (including diffed changes)
* Optional attributes should be accepted but not required
* Unknown attributes should be ignored or stored as passive metadata (not cause failure)
* Provide SCIM `/Users`, `/Groups`, and `/Me` endpoints per spec
* Enable filtering, pagination, and sorting per SCIM spec (required by Okta)

---

## 🔐 Security Considerations

* Never trust incoming `roles` or `groups` directly — always map to Nova roles via config
* Sanitize all `displayName`, `photos`, and text fields for injection risk
* `manager.value` must be validated as an existing user before assigning relationships
* Require bearer token for all SCIM requests with proper scope (e.g., `scim.write`, `scim.read`)
* Rate-limit and log all SCIM requests
* Provide override panel in Admin UI to **manually assign or recover NovaID** for users with lost/expired SCIM connections

