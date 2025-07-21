#!/bin/bash
set -e

apps=(apps/nova-synth apps/nova-orbit apps/nova-core apps/nova-pulse apps/nova-lore apps/nova-comms)

for app in "${apps[@]}"; do
  if [ "$app" = "apps/nova-synth" ]; then
    example="$app/.env.example"
    env="$app/.env"
  else
    example="$app/.env.local.example"
    env="$app/.env.local"
  fi
  
  if [ -f "$example" ]; then
    if [ ! -f "$env" ]; then
      cp "$example" "$env"
      echo "Created $env. Remember to edit the values." >&2
    fi
  fi
done
