#######################
### Briefcase Notes ###
#######################

See also - https://opendatakit.org/use/briefcase/

# INSTALLING BRIEFCASE

# 1. browse to https://opendatakit.org/downloads/download-info/odk-briefcase/
# 2. download the JAR file - e.g. "ODK Briefcase v1.4.5 Production.jar"
# 3. rename file to replace spaces - e.g. "ODK_Briefcase_v1.4.5_Production.jar"

# create working directory in the Edison
mkdir /home/edison/ODK

# scp file to Edison/other machine e.g. (customise to your ssh configuration)
scp -P 3022 /pathto/ODK_Briefcase_v1.4.5_Production.jar edison@127.0.0.1:/home/edison/ODK

# in Edison, install this customised CSV to JSON converter
wget https://gist.githubusercontent.com/geotheory/4c66bc442eb7baaa4374/raw/57197fb9b34a2084b705a38966adf892e3deacfa/csv2json.py
chmod 755 csv2json.py


# GETTING DATA FROM AGGREGATE

# Briefcase-Aggregate API call is in the following format (returns an XML file):
# java -jar ODK\ Briefcase\ v1.4.4\ Production.jar --form_id market_prices --storage_directory ~/Desktop --aggregate_url https://my_server.appspot.com --odk_username my_username --odk_password my_password;

java -jar ODK_Briefcase_v1.4.5_Production.jar --form_id MOAS_OPD_v.8.2a --storage_directory /home/edison/ODK --aggregate_url http://14.141.58.198:8080/ODKAggregate --odk_username Pete --odk_password MASTERS;


# DATA CONVERSION

# Briefcase does XML to CSV conversion in format:
# java -jar ODK\ Briefcase\ v1.4.4\ Production.jar --form_id market_prices --storage_directory ~/Desktop --export_directory ~/Desktop --export_filename market_prices.csv;

java -jar ODK_Briefcase_v1.4.5_Production.jar --form_id MOAS_OPD_v.8.2a --storage_directory /home/edison/ODK --export_directory /home/edison/ODK --export_filename odk_data.csv;

# convert CSV to JSON
python csv2json.py odk_data.csv > odk_data.json
