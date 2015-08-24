#!/bin/bash

# Operates ODK Briefcase and parses results to JSON
# Requires single argument of a valid ODKAggregat Form ID

# Briefcase replaces '.' with '_' in filenames..
origname=$1;
newname=${origname//./$"_"};
csvname=$newname.csv;
jsonname=${csvname//.csv/$".json"};

# echo 'Script running. First time this can take several minutes'

dir=$(pwd)'/data'

# get ODKAggregate domain and credentials
. config

# Run Briefcase-Aggregate API and convert resulting CML to CSV
# java -jar ODK_Briefcase_v1.4.5_Production.jar --form_id $1 --storage_directory $dir --aggregate_url $IP --odk_username $aggUser --odk_password $aggPwd --export_directory $dir --export_filename $nameb --overwrite_csv_export --exclude_media_export > $dir'/debug.log' 2>&1;

# possible data arguments
# --export_start_date 2014/02/05 --export_end_date 2014/02/06 


# to json
python csv2json.py $dir/$csvname $dir/$jsonname

# update forms.json
# python csv2json.py forms.csv > forms.json

echo 'Done. For debugging see data/debug.log'
