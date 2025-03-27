#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Install dependencies
cd ./frontend && npm install && cd ../backend && pip install -r requirements.txt && cd ..

# Install pg-cron
PGPASSWORD=postgres psql -h db -U postgres -d postgres -c "CREATE EXTENSION pg_cron;" || {
    echo "Warning: Failed to install pg_cron. Continuing..."
}

# Create tables, insert sample data (always runs)
./backend/reset_database.sh
