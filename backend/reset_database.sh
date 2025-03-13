#!/bin/bash
set -e

python backend/commands/generate_sample_data.py

PGPASSWORD=postgres psql -h db -U postgres -d postgres -f backend/commands/clear_database.sql
PGPASSWORD=postgres psql -h db -U postgres -d postgres -f backend/commands/create_table.sql
PGPASSWORD=postgres psql -h db -U postgres -d postgres -f backend/commands/insert_sample_data.sql