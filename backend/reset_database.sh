#!/bin/bash
set -e

python backend/commands/generate_sample_data.py

# Reset Postgres database
PGPASSWORD=postgres psql -h db -U postgres -d postgres -f backend/commands/clear_database.sql
PGPASSWORD=postgres psql -h db -U postgres -d postgres -f backend/commands/create_table.sql
PGPASSWORD=postgres psql -h db -U postgres -d postgres -f backend/commands/insert_sample_data.sql

# Reset Elasticsearch index
curl -X DELETE "http://elasticsearch:9200/_all"

# Ensure pg_cron is set up correctly
PGPASSWORD=postgres psql -h db -U postgres -d postgres -c "DROP EXTENSION IF EXISTS pg_cron CASCADE;"
PGPASSWORD=postgres psql -h db -U postgres -d postgres -c "CREATE EXTENSION pg_cron;"

# Schedule pg_cron job to clear delete_log every month (1st of each month at midnight)
PGPASSWORD=postgres psql -h db -U postgres -d postgres -c "
INSERT INTO cron.job (schedule, command, database)
SELECT '0 0 1 * *', 'DELETE FROM delete_log WHERE deleted_at < NOW() - INTERVAL ''1 month''', 'postgres'
WHERE NOT EXISTS (SELECT 1 FROM cron.job WHERE command LIKE 'DELETE FROM delete_log%');
"