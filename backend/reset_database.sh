#!/bin/bash
set -e

python backend/commands/generate_sample_data.py

psql -h localhost -U postgres -d postgres -f backend/commands/clear_database.sql
psql -h localhost -U postgres -d postgres -f backend/commands/create_table.sql
psql -h localhost -U postgres -d postgres -f backend/commands/insert_sample_data.sql