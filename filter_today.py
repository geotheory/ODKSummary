import json
import datetime

with open('MOAS_OPD_v_9_5.json') as data_file:    
	data = json.load(data_file)

for i in range(len(data)):
	date = datetime.datetime.strptime( data[i]['end'][:11].replace(" ", ""), "%d-%b-%Y")
	print date.fromtimestamp()
	#data[i]['date'] = date


res = []

# data[0]['end']

# data[0]['date'] = subset

# datetime.datetime.strptime( "14-Sep-2015", "%d-%b-%Y")

# filter

# write results
