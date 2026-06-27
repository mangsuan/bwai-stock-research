#!/bin/bash
# Setup PostgreSQL database for BWAI

echo "Creating PostgreSQL database..."

sudo -u postgres psql -c "CREATE USER bwai_user WITH PASSWORD 'bwai_pass';"
sudo -u postgres psql -c "CREATE DATABASE bwai OWNER bwai_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bwai TO bwai_user;"

echo "Done! PostgreSQL database 'bwai' is ready."
echo ""
echo "Now restart the backend to use PostgreSQL instead of SQLite."
