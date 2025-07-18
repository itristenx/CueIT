#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

get_dir() {
  case "$1" in
    api) echo "cueit-api" ;;
    admin) echo "cueit-admin" ;;
    slack) echo "cueit-slack" ;;
    *) return 1 ;;
  esac
}

get_cmd() {
  case "$1" in
    api) echo "npm --prefix cueit-api start" ;;
    admin) echo "npm --prefix cueit-admin run dev" ;;
    slack) echo "npm --prefix cueit-slack start" ;;
    *) return 1 ;;
  esac
}

read -rp "Apps to start (api,admin,slack or all) [all]: " INPUT
if [[ -z "$INPUT" || "$INPUT" == "all" ]]; then
  SELECTED=(api admin slack)
else
  IFS=',' read -ra SELECTED <<< "$INPUT"
fi

NAMES=()
COMMANDS=()
for APP in "${SELECTED[@]}"; do
  DIR=$(get_dir "$APP") || { echo "Unknown app: $APP" >&2; exit 1; }
  CMD=$(get_cmd "$APP") || { echo "Unknown app: $APP" >&2; exit 1; }
  if [[ ! -f $DIR/.env ]]; then
    echo "Error: $DIR/.env not found. Copy $DIR/.env.example to $DIR/.env." >&2
    exit 1
  fi
  if [[ ! -d $DIR/node_modules ]]; then
    echo "Installing dependencies for $DIR..."
    npm --prefix "$DIR" install
  fi
  NAMES+=("$APP")
  COMMANDS+=("$CMD")
done

if [[ -z "$TLS_CERT_PATH" && -f cert.pem ]]; then
  export TLS_CERT_PATH="$(pwd)/cert.pem"
fi
if [[ -z "$TLS_KEY_PATH" && -f key.pem ]]; then
  export TLS_KEY_PATH="$(pwd)/key.pem"
fi

NAME_STR=$(IFS=','; echo "${NAMES[*]}")
npx concurrently -k -n "$NAME_STR" "${COMMANDS[@]}"

