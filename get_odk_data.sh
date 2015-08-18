#!/bin/bash

dir=$(pwd)'/data'

. config

# extract XML from Aggregate with Briefcase
java -jar ODK_Briefcase_v1.4.5_Production.jar --form_id MOAS_OPD_v.8.2a --storage_directory $dir --aggregate_url $IP --odk_username $aggUser --odk_password $aggPwd > $dir'/debug.log' 2>&1;

# convert to csv
java -jar ODK_Briefcase_v1.4.5_Production.jar --form_id MOAS_OPD_v.8.2a --storage_directory $dir --export_directory $dir --export_filename odk_data.csv > $dir'/debug.log' 2>&1;

# transpose csv
python transpose.py $dir > $dir'/debug.log' 2>&1;

echo 'Done. For debugging see data/debug.log'
