#!/bin/bash

# extract XML from Aggregate with Briefcase
java -jar ODK_Briefcase_v1.4.5_Production.jar --form_id MOAS_OPD_v.8.2a --storage_directory /home/edison --aggregate_url http://14.141.58.198:8080/ODKAggregate --odk_username Pete --odk_password MASTERS > /dev/null;

# convert to csv
java -jar ODK_Briefcase_v1.4.5_Production.jar --form_id MOAS_OPD_v.8.2a --storage_directory /home/edison --export_directory /home/edison/ODK --export_filename odk_data.csv > /dev/null;

# convert to JSON
#python csv2json.py > /var/lib/tomcat7/webapps/ODKSummary/odk_data.json
#python csv2json.py > odk_data.json
