#!/bin/bash
# Start BWAI services (backend, frontend, mobile)
# Usage: ./start.sh [backend] [frontend] [mobile]
#   No args = start all

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_DIR="$PROJECT_DIR/.pids"
mkdir -p "$PID_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

start_backend() {
    local pid_file="$PID_DIR/backend.pid"
    if [ -f "$pid_file" ] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
        echo -e "${YELLOW}⚠ Backend already running (PID $(cat "$pid_file"))${NC}"
        return
    fi
    # Use venv python if available
    local python_cmd="python3"
    if [ -f "$PROJECT_DIR/.venv/bin/python" ]; then
        python_cmd="$PROJECT_DIR/.venv/bin/python"
    fi
    echo -e "${CYAN}🚀 Starting Backend (FastAPI)...${NC}"
    cd "$PROJECT_DIR"
    nohup "$python_cmd" -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload \
        > "$PID_DIR/backend.log" 2>&1 &
    echo $! > "$pid_file"
    echo -e "${GREEN}✓ Backend started (PID $!) — http://localhost:8000${NC}"
}

start_frontend() {
    local pid_file="$PID_DIR/frontend.pid"
    if [ -f "$pid_file" ] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
        echo -e "${YELLOW}⚠ Frontend already running (PID $(cat "$pid_file"))${NC}"
        return
    fi
    # Kill any stale Next.js dev processes
    pkill -f "next dev" 2>/dev/null
    sleep 1
    echo -e "${CYAN}🚀 Starting Frontend (Next.js)...${NC}"
    cd "$PROJECT_DIR/frontend"
    nohup npm run dev -- -p 3001 > "$PID_DIR/frontend.log" 2>&1 &
    echo $! > "$pid_file"
    echo -e "${GREEN}✓ Frontend started (PID $!) — http://localhost:3001${NC}"
}

start_mobile() {
    local pid_file="$PID_DIR/mobile.pid"
    if [ -f "$pid_file" ] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
        echo -e "${YELLOW}⚠ Mobile already running (PID $(cat "$pid_file"))${NC}"
        return
    fi
    echo -e "${CYAN}🚀 Starting Mobile (Expo)...${NC}"
    cd "$PROJECT_DIR/mobile"
    nohup npx expo start > "$PID_DIR/mobile.log" 2>&1 &
    echo $! > "$pid_file"
    echo -e "${GREEN}✓ Mobile started (PID $!) — Expo DevTools${NC}"
}

echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}  BWAI Stock Research — Starting Services${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

if [ $# -eq 0 ]; then
    start_backend
    start_frontend
    start_mobile
else
    for svc in "$@"; do
        case "$svc" in
            backend)  start_backend ;;
            frontend) start_frontend ;;
            mobile)   start_mobile ;;
            *) echo -e "${RED}Unknown service: $svc${NC}" ;;
        esac
    done
fi

echo ""
echo -e "${CYAN}Logs: $PID_DIR/*.log${NC}"
echo -e "${CYAN}Stop: ./stop.sh${NC}"
