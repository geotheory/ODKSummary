import json
import sys

print sys.argv[1]
f = open(sys.argv[1],'r')

arr=[]
headers = []

for header in f.readline().split(','):
  headers.append(header)

# replace characters that can be problematic in JSON category names
headers = [h.replace('-', '_') for h in headers]
headers = [h.replace(' ', '_') for h in headers]
headers = [h.replace('.', '_') for h in headers]

for line in f.readlines():
  lineItems = {}
  for i,item in enumerate(line.split(',')):  
    lineItems[headers[i]] = item
  arr.append(lineItems)

f.close()

jsonText = json.dumps(arr)

print jsonText
