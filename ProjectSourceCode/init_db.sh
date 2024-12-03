#!/bin/bash

# DO NOT PUSH THIS FILE TO GITHUB
# This file contains sensitive information and should be kept private

# TODO: Set your PostgreSQL URI - Use the External Database URL from the Render dashboard
PG_URI="postgresql://spotu:pxqXSUQRyN8OJnywXt4wGKmy8duE2qG0@dpg-csvofntds78s73enunc0-a.oregon-postgres.render.com/spotudb"

# Execute each .sql file in the directory
for file in src/init_data/*.sql; do
    echo "Executing $file..."
    psql $PG_URI -f "$file"
done
