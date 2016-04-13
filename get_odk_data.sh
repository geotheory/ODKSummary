#!/bin/bash

rm /var/lib/tomcat6/webapps/ODKSummary/data/processed*.json

cd /home/postgres

su -c ". /home/postgres/export_data.sh" -s /bin/sh postgres

cp /home/postgres/processed*.csv /var/lib/tomcat6/webapps/ODKSummary/data/

cd /var/lib/tomcat6/webapps/ODKSummary

python csv2json.py data/processed_rescued_people.csv data/processed_rescued_people.json
python csv2json.py data/processed_vulnerabilities.csv data/processed_vulnerabilities.json
python csv2json.py data/processed_rescued_vessels.csv data/processed_rescued_vessels.json

echo 'Done. For debugging see data/debug.log'
