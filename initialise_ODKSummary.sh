#!/bin/bash

./get_odk_data.sh _01_Rescued_People_Data_Form_0-1
./get_odk_data.sh _02_Rescued_Vessel_Details_0-1

# new folder for XML forms, and copy files there
rm -rf ./data/xml
mkdir -p ./data/xml
find . -name "*.xml" -exec cp -v {} data/xml \; >/dev/null 2>&1
rm data/xml/submission.xml
rm data/xml/tempDefn*

# for f in data/xml/*.xml
# do
# 	# rename files so eg URLs have no spaces
# 	fn="${f//.xml/}"; fn="${fn// /_}"; fn="${fn//./_}".json
# 	echo $f; echo $fn
# 	python parse_xml.py "$f" "$fn"
# done
