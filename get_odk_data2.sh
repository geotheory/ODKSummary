#!/bin/bash

# Operates ODK Briefcase and parses results to JSON
# Requires single argument of a valid ODKAggregat Form ID

# Run Briefcase-Aggregate API and convert resulting CML to CSV
java -jar /var/lib/tomcat6/webapps/ODKSummary/ODK_Briefcase_v1.4.5_Production.jar --form_id MOAS_OPD_v_9_5 --storage_directory /var/lib/tomcat6/webapps/ODKSummary/data --aggregate_url http://data.msf:8080/ODKAggregate --odk_username surveyor --odk_password plumpynut --export_directory /var/lib/tomcat6/webapps/ODKSummary/data --export_filename MOAS_OPD_v_9_5.csv --overwrite_csv_export --exclude_media_export > /var/lib/tomcat6/webapps/ODKSummary/data/debug.log 2>&1;
java -jar /var/lib/tomcat6/webapps/ODKSummary/ODK_Briefcase_v1.4.5_Production.jar --form_id MOAS_Registration_v_9_5 --storage_directory /var/lib/tomcat6/webapps/ODKSummary/data --aggregate_url http://data.msf:8080/ODKAggregate --odk_username surveyor --odk_password plumpynut --export_directory /var/lib/tomcat6/webapps/ODKSummary/data --export_filename MOAS_Registration_v_9_5.csv --overwrite_csv_export --exclude_media_export > /var/lib/tomcat6/webapps/ODKSummary/data/debug.log 2>&1;

# to json
python /var/lib/tomcat6/webapps/ODKSummary/csv2json.py /var/lib/tomcat6/webapps/ODKSummary/data/MOAS_OPD_v_9_5.csv /var/lib/tomcat6/webapps/ODKSummary/data/MOAS_OPD_v_9_5.json
python /var/lib/tomcat6/webapps/ODKSummary/csv2json.py /var/lib/tomcat6/webapps/ODKSummary/data/MOAS_Registration_v_9_5.csv /var/lib/tomcat6/webapps/ODKSummary/data/MOAS_Registration_v_9_5.json
#python csv2json.py $dir/$csvnametoday $dir/$jsonnametoday

# backup to SD card
cp /var/lib/tomcat6/webapps/ODKSummary/data/MOAS_OPD_v_9_5.csv /home/edison/sd/
cp /var/lib/tomcat6/webapps/ODKSummary/data/MOAS_Registration_v_9_5.csv /home/edison/sd/

# update forms.json
#python /var/lib/tomcat6/webapps/ODKSummary/csv2json.py /var/lib/tomcat6/webapps/ODKSummary/forms.csv /var/lib/tomcat6/webapps/ODKSummary/forms.json

echo 'Done. For debugging see data/debug.log'
