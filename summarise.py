import csv
import itertools

# read in csv data

file_name = 'odk_data2.csv'

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

l = sorted(data[5])

g = [(g[0], len(list(g[1]))) for g in itertools.groupby(l)]

len(g) # count of unique values

# sorted tuple-list of unique value counts
g2 = sorted(g,key=lambda x: x[1], reverse=True)



map(int, results)
map(float, results)







