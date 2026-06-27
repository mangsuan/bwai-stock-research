#!/bin/bash
# Stop BWAI services (backend, frontend, mobile)
# Usage: ./stop.sh [backend] [frontend] [mobile]
#   No args = stop all

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_DIR="$PROJECT_DIR/.pids"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

stop_service() {
    local name="$1"
    local pid_file="$PID_DIR/${name}.pid"
    local stopped=false
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            kill -- -"$pid" 2>/dev/null || kill "$pid" 2>/dev/null
            for i in {1..10}; do
                kill -0 "$pid" 2>/dev/null || break
                sleep 0.5
            done
            kill -0 "$pid" 2>/dev/null && kill -9 "$pid" 2>/dev/null
            echo -e "${GREEN}✓ ${name} stopped (PID $pid)${NC}"
            stopped=true
        fi
        rm -f "$pid_file"
    fi
    # Also kill by process name pattern as fallback
    case "$name" in
        backend)
            pkill -f "uvicorn app:app" 2>/dev/null && stopped=true ;;
        frontend)
            pkill -f "next dev" 2>/dev/null && stopped=true ;;
        mobile)
            pkill -f "expo start" 2>/dev/null && stopped=true ;;
    esac
    if [ "$stopped" = false ]; then
        echo -e "${YELLOW}⊘ ${name} was not running${NC}"
    fi
}

echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}  BWAI Stock Research — Stopping Services${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

if [ $# -eq 0 ]; then
    stop_service "backend"
    stop_service "frontend"
    stop_service "mobile"
else
    for svc in "$@"; do
        case "$svc" in
            backend|frontend|mobile) stop_service "$svc" ;;
            *) echo -e "${RED}Unknown service: $svc${NC}" ;;
        esac
    done
fi
