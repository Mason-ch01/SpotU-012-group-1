#!/bin/bash

# DO NOT PUSH THIS FILE TO GITHUB
# This file contains sensitive information and should be kept private

# TODO: Set your PostgreSQL URI - Use the External Database URL from the Render dashboard
PG_URI="postgresql://spotu:UdS08AaaGX4q0SksEHVmxOoBiu7Q3bhX@dpg-ctbsp6rtq21c73dfmqr0-a.oregon-postgres.render.com/spotudb_2y4k"

# Execute each .sql file in the directory
for file in "/Users/masonchoi/Documents/School/Fall2024/CSCI3308/SpotU/ProjectSourceCode/src/init_data/create.sql"; do
    echo "Executing $file..."
    psql $PG_URI -f "$file"
done
