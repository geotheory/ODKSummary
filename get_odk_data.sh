#!/bin/bash

echo 'Script running. First time this can take several minutes'

dir=$(pwd)'/data'

# get ODKAggregate domain and credentials
. config

# Run Briefcase-Aggregate API and convert resulting CML to CSV
java -jar ODK_Briefcase_v1.4.5_Production.jar --form_id MOAS_OPD_v.8.2a --storage_directory $dir --aggregate_url $IP --odk_username $aggUser --odk_password $aggPwd --export_directory $dir --export_filename odk_data.csv --overwrite_csv_export --exclude_media_export > $dir'/debug.log' 2>&1;

# possible data arguments
# --export_start_date 2014/02/05 --export_end_date 2014/02/06 


# ALTERNATIVE METHOD

# extract XML from Aggregate with Briefcase
# java -jar ODK_Briefcase_v1.4.5_Production.jar --form_id MOAS_OPD_v.8.2a --storage_directory $dir --aggregate_url $IP --odk_username $aggUser --odk_password $aggPwd > $dir'/debug.log' 2>&1;

# convert to csv
# java -jar ODK_Briefcase_v1.4.5_Production.jar --form_id MOAS_OPD_v.8.2a --storage_directory $dir --export_directory $dir --export_filename odk_data.csv > $dir'/debug.log' 2>&1;


# transpose csv
python transpose.py $dir >> $dir'/debug.log' 2>&1;

# summarise csv to JSON
python summarise.py $dir >> $dir'/debug.log' 2>&1;

echo 'Done. For debugging see data/debug.log'
