#!/bin/bash
docker-compose up -d
echo "Waiting for PostgreSQL to be ready..."
until docker exec medicatalogue_db pg_isready -U mediadmin -d medicatalogue; do
  sleep 1
done
echo "PostgreSQL is ready!"
