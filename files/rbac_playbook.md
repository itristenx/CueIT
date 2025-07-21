# 🔒 NOVA RBAC GUIDE

> Version: `v1.1`
> Maintainer: Nova Helix Identity Team
> Last Updated: 2025-07-21

Nova Universe uses a centralized, enterprise-grade RBAC system managed via **Nova Helix**. This document outlines:

* Core system roles (default, admin, and functional leads)
* Security constraints and module isolation
* Role-to-permission mappings
* SCIM/SSO support
* Support for layered and custom roles

---

## 📟 Default Role Assignment

All authenticated users—via **SSO (e.g., Okta, Azure AD)** or **local auth**—are automatically assigned:

```json
{
  "role": "end_user"
}
```

> ✅ Ensures all users (including IT, HR, Ops, Cyber) have request access by default

Elevated roles (e.g., `technician`, `hr_admin`, etc.) must be **explicitly added** via SCIM mapping, group membership, or admin assignment.

---

## 🛠️ Role Composition & Layering

Nova RBAC supports **layered roles**. All users retain `end_user` baseline and may have additive roles.

### Examples

| User  | Roles Assigned           | Effective Access                           |
| ----- | ------------------------ | ------------------------------------------ |
| Alice | `end_user`               | Access to catalog, submit/view own tickets |
| Bob   | `end_user`, `technician` | Above + resolve IT tickets                 |
| Carla | `end_user`, `hr_agent`   | Above + manage HR cases                    |
| Dave  | `end_user`, `tech_lead`  | Above + configure workflows, team metrics  |

---

## 🔐 Module Isolation Rules

All major Nova Pulse modules are **isolated by default** to prevent unauthorized cross-team access.

| Module    | View Roles                  | Modify/Admin Roles                 |
| --------- | --------------------------- | ---------------------------------- |
| **IT**    | `technician`, `tech_lead`   | `tech_lead`, `admin`, `core_admin` |
| **HR**    | `hr_agent`, `hr_lead`       | `hr_admin`, `core_admin`           |
| **Ops**   | `ops_agent`, `ops_lead`     | `ops_admin`, `core_admin`          |
| **Cyber** | `cyber_agent`, `cyber_lead` | `cyber_admin`, `core_admin`        |

> ⛔ IT admins **cannot** access HR/Cyber/Ops data unless granted role

---

## 📄 Role Catalog

| Role Name     | Category     | Description                                     | Admin? |
| ------------- | ------------ | ----------------------------------------------- | ------ |
| `guest`       | Access       | Temporary users (Slack Connect, kiosk visitors) | ❌      |
| `end_user`    | Default      | Default for all users                           | ❌      |
| `manager`     | General      | Team/org manager                                | ❌      |
| `technician`  | ITSM         | Handles IT requests                             | ❌      |
| `tech_lead`   | ITSM         | IT workflow manager                             | ✅      |
| `hr_agent`    | HR           | Handles HR tickets                              | ❌      |
| `hr_lead`     | HR           | Oversees HR workflows                           | ✅      |
| `hr_admin`    | HR           | Full HR module admin                            | ✅      |
| `ops_agent`   | Ops          | Handles ops, delivery, logistics                | ❌      |
| `ops_lead`    | Ops          | Supervises ops                                  | ✅      |
| `ops_admin`   | Ops          | Full Ops module admin                           | ✅      |
| `cyber_agent` | Security     | Handles incident response                       | ❌      |
| `cyber_lead`  | Security     | Supervises cyber agents                         | ✅      |
| `cyber_admin` | Security     | Full Cyber module admin                         | ✅      |
| `admin`       | Global Admin | Manages modules and platform config             | ✅      |
| `core_admin`  | Super Admin  | Full control (Nova Core, Helix, Deck)           | ✅      |
| `custom_role` | Flexible     | User-defined role with granular permissions     | ✅      |

---

## 🧱 Request Catalog Access

All `end_user` roles:

* ✅ Can submit **any ticket type** (HR, Ops, IT, Cyber)
* ❌ Cannot view sensitive queues (e.g., HR tickets)

> ✨ Request Catalog visibility is dynamic, based on role, and securely scoped

---

## 📃 SCIM & SSO Role Mapping

| SCIM Attribute          | Maps To       |
| ----------------------- | ------------- |
| `department = IT`       | `technician`  |
| `title contains Lead`   | `*_lead`      |
| `title contains Admin`  | `*_admin`     |
| `department = HR`       | `hr_agent`    |
| `department = Ops`      | `ops_agent`   |
| `department = Cyber`    | `cyber_agent` |
| `userType = Contractor` | `guest`       |

> Roles stored in Helix and enforced at API/UI layers

---

## ⚖️ Enforcement & Security Standards

| Feature                          | Status |
| -------------------------------- | ------ |
| API-level permission enforcement | ✅ Yes  |
| UI-based visibility control      | ✅ Yes  |
| Audit log of all role actions    | ✅ Yes  |
| SCIM auto-mapping for roles      | ✅ Yes  |
| Delegation with scoped access    | ✅ Yes  |
| Role-specific request catalog    | ✅ Yes  |
| Immutable audit trails (Helix)   | ✅ Yes  |

---

## 🚀 Agent Setup Tasks

* [ ] Ensure all users get `end_user` role on login (local/SSO)
* [ ] Restrict module access unless matching role is granted
* [ ] Support layered roles per-user with Helix override
* [ ] Block cross-viewing of tickets between HR/Ops/Cyber/IT
* [ ] Assign roles via SCIM, API, Admin UI or CLI
* [ ] Audit all changes to `roles`, `permissions`, and `scopes`

---

## 🔧 Custom Role Example

```json
{
  "nova.kb.view": true,
  "nova.tickets.assign": true,
  "nova.pulse.hr.edit": false,
  "nova.pulse.cyber.view": false
}
```

Created via Nova Core > Roles or:

* CLI: `nova roles create`
* API: `POST /api/roles`

---

**This document is controlled by Nova Helix. All changes must be peer-reviewed and logged.**
