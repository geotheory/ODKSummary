import csv
import sys
from itertools import izip
path = sys.argv[1]
a = izip(*csv.reader(open(path + "/odk_data.csv", "rb")))
csv.writer(open(path + "/odk_data2.csv", "wb")).writerows(a)
