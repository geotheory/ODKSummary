# ./get_odk_data.sh MHSurveyKAS15_v.8.1
# ./get_odk_data.sh MOAS_OPD_v.7.23a
# ./get_odk_data.sh MOAS_OPD_v.8.2a
# ./get_odk_data.sh MOAS_Regtion_v.7.29
# ./get_odk_data.sh MOAS_Regtion_v.7.23
# ./get_odk_data.sh MH_val_KAS

# new folder for XML forms, and copy files there
rm -rf ./data/xml
mkdir -p ./data/xml
find . -name "*.xml" -exec cp -v {} data/xml \; >/dev/null 2>&1
rm data/xml/submission.xml

# list all XML forms generated and copy to own directory
for f in data/xml/*.xml
do
	# rename files so eg URLs have no spaces
	fn="${f//.xml/}"; fn="${fn// /_}"; fn="${fn//./_}".json
	echo $f; echo $fn
	python parse_xml.py "$f" "$fn"
done
