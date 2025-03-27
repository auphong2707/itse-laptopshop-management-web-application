#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Install dependencies
cd ./frontend && npm install && cd ../backend && pip install -r requirements.txt && cd ..

# Create tables, insert sample data (always runs)
./backend/reset_database.sh
