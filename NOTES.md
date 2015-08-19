# ODKSummary Notes

See also - https://opendatakit.org/use/briefcase/

#### Installing Briefcase seperately

1. browse to https://opendatakit.org/downloads/download-info/odk-briefcase/
2. download the JAR file - e.g. `ODK Briefcase v1.4.5 Production.jar`
3. rename file to replace spaces - e.g. `ODK_Briefcase_v1.4.5_Production.jar`
4. create working directory in the Edison - `mkdir /var/lib/tomcat7/webapps/ODKSummary`

#### scp file to Edison/other machine e.g. (customise to your ssh configuration)

`scp -P 3022 /pathto/ODK_Briefcase_v1.4.5_Production.jar edison@127.0.0.1:/var/lib/tomcat7/webapps/ODKSummary`

#### Getting data from ODKAggregate

Briefcase-Aggregate API call is in the following format (returns an XML file):

`java -jar ODK\ Briefcase\ v1.4.4\ Production.jar --form_id market_prices --storage_directory ~/Desktop --aggregate_url https://my_server.appspot.com --odk_username my_username --odk_password my_password;`

#### Conversion to CSV

Briefcase does XML to CSV conversion with:

`java -jar ODK\ Briefcase\ v1.4.4\ Production.jar --form_id market_prices --storage_directory ~/Desktop --export_directory ~/Desktop --export_filename market_prices.csv;`

#### Alternative method

Though not implemented in ODKSummary, Briefcase can also perform an all-in-one operation:

`java -jar ODK\ Briefcase\ v1.4.4\ Production.jar --form_id market_prices --storage_directory ~/Desktop --aggregate_url https://my_server.appspot.com --odk_username my_username --odk_password my_password --export_directory ~/Desktop --export_filename market_prices_filtered.csv --overwrite_csv_export --exclude_media_export --export_start_date 2014/02/05 --export_end_date 2014/02/06 >~/Desktop/briefcase.log 2>&1;`

#### Summarise data to JSON

`python summarise.py`

### Background

- Briefcase has a documented speed problem - https://groups.google.com/forum/#!topic/opendatakit/kzuRmSSPkfg.  It runs much slower the first time after setup, but subsequent runs should be ~10s for ~250 rows.  Using the alternative method detailed above seems only slightly less efficient, but this might usefully be tested on bigger datasets.

