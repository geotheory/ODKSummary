from collections import OrderedDict
import sys
import csv
import json

with open(sys.argv[1],'r') as f:
	reader = csv.reader(f)
	headerlist = next(reader)
	csvlist = []
	for row in reader:
		d = OrderedDict()
		for i, x in enumerate(row):
			d[headerlist[i]] = x
		csvlist.append(d)

with open(sys.argv[2],'w') as f:
    json.dump(csvlist,f)
