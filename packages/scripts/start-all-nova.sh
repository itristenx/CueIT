#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../.."

get_dir() {
  case "$1" in
    synth) echo "apps/nova-synth" ;;
    orbit) echo "apps/nova-orbit" ;;
    core) echo "apps/nova-core" ;;
    pulse) echo "apps/nova-pulse" ;;
    lore) echo "apps/nova-lore" ;;
    comms) echo "apps/nova-comms" ;;
    *) return 1 ;;
  esac
}

get_cmd() {
  case "$1" in
    synth) echo "npm --prefix apps/nova-synth run start:dev" ;;
    orbit) echo "npm --prefix apps/nova-orbit run dev" ;;
    core) echo "npm --prefix apps/nova-core run dev" ;;
    pulse) echo "npm --prefix apps/nova-pulse run dev" ;;
    lore) echo "npm --prefix apps/nova-lore run dev" ;;
    comms) echo "npm --prefix apps/nova-comms start" ;;
    *) return 1 ;;
  esac
}

# Default services to start
services=(synth orbit core pulse lore comms)

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --only)
      services=()
      shift
      ;;
    --skip)
      shift
      skip_service="$1"
      services=("${services[@]/$skip_service}")
      shift
      ;;
    synth|orbit|core|comms)
      if [ ${#services[@]} -eq 4 ]; then
        services=("$1")
      else
        services+=("$1")
      fi
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "Starting Nova Universe services: ${services[*]}"
echo "Press Ctrl+C to stop all services"

pids=()

cleanup() {
  echo "Stopping services..."
  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait
}

trap cleanup INT TERM

for service in "${services[@]}"; do
  cmd=$(get_cmd "$service")
  if [ $? -eq 0 ]; then
    echo "Starting $service..."
    eval "$cmd" &
    pids+=($!)
  fi
done

wait
