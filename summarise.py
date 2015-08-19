import csv
import itertools
import json

# read in csv data
file_name = 'data/odk_data2.csv'

with open(file_name, 'rU') as f:
    reader = csv.reader(f)
    data = list(list(rec) for rec in csv.reader(f, delimiter=','))
    f.close()

# seperate header from data
headers = []

for i in range(len(data)):
	headers.append( data[i][0] )
	data[i] = data[i][1:]

# factorise list
report = []

for i in range(len(data)):
	l = sorted(data[i])
	g = [(g[0], len(list(g[1]))) for g in itertools.groupby(l)]
	len(g) # count of unique values
	# sorted tuple-list of unique value counts
	g2 = sorted(g,key=lambda x: x[1], reverse=True)
	line = ''
	for j in range(min(5, len(g))):
		line = line + str(g2[j][0]) + ': ' + str(g2[j][1]) + ' '
	report.append([ headers[i], line ])

# parse to a JSON string
output = json.dumps(report, separators=(',',':'))

# map(int, results)
# map(float, results)

# output to json
wr = open('data/odk_summary.json', 'w')
wr.write(output)
