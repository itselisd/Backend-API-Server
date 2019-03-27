#! /bin/bash

echo "Installing packages..."
npm install

sudo -u postgres createuser <insertname>

if [ -e seedfile.sql ]
then
    echo "Would you like to seed the database? (Y/N)"
	read answer
	if [[ $answer = "Y" || $answer = "y" ]]; then
			echo "Seeding the database... Please wait a few minutes..."
			rm seedfile.sql
			node seed.js
			psql -d videoDB -f ./seedfile.sql > logging.txt
	else
		echo "Got it. "
	fi
else
	echo "Seeding the database... Please wait a few minutes..."
	sudo -u postgres createdb -O <insertname> videoDB
	node seed.js
	psql -d videoDB -f ./seedfile.sql > logging.txt
fi

echo "Starting server..."
npm start

echo "Bye!"
