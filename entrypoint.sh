#!/bin/bash
set -e

cd ./frontend && npm install && cd ../backend && pip install -r requirements.txt
psql -h localhost -U postgres -d postgres < ./commands.sql