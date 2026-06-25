#!/bin/bash

# BWAI Deployment Script
# Usage: ./deploy.sh [start|stop|build|logs]

set -e

case "$1" in
  start)
    echo "Starting BWAI..."
    docker compose up -d
    echo "BWAI is running at:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:8000"
    echo "  API Docs: http://localhost:8000/docs"
    ;;
  stop)
    echo "Stopping BWAI..."
    docker compose down
    ;;
  build)
    echo "Building BWAI..."
    docker compose build
    ;;
  logs)
    docker compose logs -f
    ;;
  restart)
    echo "Restarting BWAI..."
    docker compose down
    docker compose up -d
    ;;
  *)
    echo "Usage: ./deploy.sh {start|stop|build|logs|restart}"
    exit 1
    ;;
esac
