# Dependency Upgrade Log

## Summary
All main apps and packages were audited and upgraded to the latest stable versions. Deprecated packages were replaced or flagged for upstream updates. Automated dependency update tools (Renovate, Dependabot) have been integrated.

## Breaking Changes & Decisions
- Upgraded all dependencies to latest stable versions using `npm install`.
- Deprecated direct dependencies replaced:
  - `@humanwhocodes/config-array` → `@eslint/config-array`
  - `@humanwhocodes/object-schema` → `@eslint/object-schema`
  - `rimraf` upgraded to v4+
  - `glob` upgraded to v9+
  - `eslint` upgraded to v9+
- Sub-dependencies flagged for upstream updates (e.g., `inflight`).
- Lock files generated and committed for reproducible builds.
- Renovate and Dependabot config files added for automated updates.

## Next Steps
- Monitor Renovate/Dependabot PRs for future upgrades.
- Review changelogs for major updates before merging.
- Run tests after each upgrade to verify stability.
