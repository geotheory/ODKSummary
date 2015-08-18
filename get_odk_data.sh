#!/bin/bash

dir=$(pwd)'/data'

# extract XML from Aggregate with Briefcase
java -jar ODK_Briefcase_v1.4.5_Production.jar --form_id MOAS_OPD_v.8.2a --storage_directory $dir --aggregate_url http://14.141.58.198:8080/ODKAggregate --odk_username Pete --odk_password MASTERS > $dir'/debug.log' 2>&1;

# convert to csv
java -jar ODK_Briefcase_v1.4.5_Production.jar --form_id MOAS_OPD_v.8.2a --storage_directory $dir --export_directory $dir --export_filename odk_data.csv > $dir'/debug.log' 2>&1;

# transpose csv
python transpose.py $dir > $dir'/debug.log' 2>&1;

echo 'Done. For debugging see data/debug.log'
