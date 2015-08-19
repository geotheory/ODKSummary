import json
import sys

arr = []

with open(sys.argv[1]) as f:
	lines = f.read().splitlines()
	for line in lines:
		arr.append(line.split(','))

f.close()

output = json.dumps(arr, separators=(',',':'))

print output
