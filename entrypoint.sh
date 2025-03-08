#!/bin/bash
set -e

# Install dependencies
cd ./frontend && npm install && cd ../backend && pip install -r requirements.txt && cd ..

# Create tables, insert sample data
./backend/reset_database.sh