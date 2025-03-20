#!/bin/bash
set -e

python backend/commands/generate_sample_data.py

# Reset Elasticsearch index
curl -X DELETE "http://elasticsearch:9200/_all"

# Reset Postgres database
PGPASSWORD=postgres psql -h db -U postgres -d postgres -f backend/commands/clear_database.sql
PGPASSWORD=postgres psql -h db -U postgres -d postgres -f backend/commands/create_table.sql
PGPASSWORD=postgres psql -h db -U postgres -d postgres -f backend/commands/insert_sample_data.sql