#! /bin/bash

# echo "Installing packages..."
# npm install

createdb videoDB

echo "Seeding the database... Please wait a few minutes..."
rm seedfile.sql
node seed.js
psql -d videoDB -f ./seedfile.sql > logging.txt

# echo "Starting server..."
# npm start

echo "Done!"
