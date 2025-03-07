#!/bin/bash
set -e

# Install dependencies
cd ./frontend && npm install && cd ../backend && pip install -r requirements.txt

# Create tables, insert sample data
psql -h localhost -U postgres -d postgres -f ./commands/clear_database.sql
psql -h localhost -U postgres -d postgres -f ./commands/create_table.sql
psql -h localhost -U postgres -d postgres -f ./commands/insert_sample_data.sql