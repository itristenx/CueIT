#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../.."

# Ensure Node.js 20+ is installed
if ! command -v node >/dev/null 2>&1 || \
   [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 20 ]; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# Install PostgreSQL if missing
if ! command -v psql >/dev/null 2>&1; then
  echo "PostgreSQL not found – install from https://postgresql.org if needed."
fi

# Optional: check Docker
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found – install Docker for containerized deployment."
fi

# Install dependencies for Nova modules
echo "Installing dependencies for Nova modules..."

pushd apps/nova-synth >/dev/null
npm ci
popd >/dev/null

pushd apps/nova-orbit >/dev/null
npm ci
popd >/dev/null

pushd apps/nova-core >/dev/null
npm ci
popd >/dev/null

pushd apps/nova-comms >/dev/null
npm ci
popd >/dev/null

pushd apps/nova-pulse >/dev/null
npm ci
popd >/dev/null

pushd apps/nova-lore >/dev/null
npm ci
popd >/dev/null

# Automatically create .env files if they do not exist
missing_env=false
for dir in apps/nova-synth apps/nova-orbit apps/nova-core apps/nova-pulse apps/nova-lore apps/nova-comms; do
  if [ "$dir" = "apps/nova-synth" ]; then
    [ -f "$dir/.env" ] || missing_env=true
  else
    [ -f "$dir/.env.local" ] || missing_env=true
  fi
done
if [ "$missing_env" = true ]; then
  echo "Initializing .env files..."
  ./packages/scripts/init-env.sh
fi

echo "Setup complete. Edit the .env files before starting the services."
echo ""
echo "ℹ️  To start all Nova services:"
echo "   npm run dev"
echo ""
echo "ℹ️  To start with Docker:"
echo "   npm run docker:up"
echo ""
echo "Access points:"
echo "   • Nova Orbit (Portal): http://localhost:3000"
echo "   • Nova Core (Admin): http://localhost:3002"
echo "   • Nova Synth (API): http://localhost:3001"
echo "   • Nova Pulse (Technician): http://localhost:3003"
echo "   • Nova Lore (Knowledge Base): http://localhost:3004"
