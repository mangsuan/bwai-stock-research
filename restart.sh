#!/bin/bash
# Restart BWAI services (backend, frontend, mobile)
# Usage: ./restart.sh [backend] [frontend] [mobile]
#   No args = restart all

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "═══════════════════════════════════════"
echo "  BWAI Stock Research — Restarting"
echo "═══════════════════════════════════════"

"$PROJECT_DIR/stop.sh" "$@"
sleep 1
"$PROJECT_DIR/start.sh" "$@"
