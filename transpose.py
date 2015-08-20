import csv
import sys
from itertools import izip

a = izip(*csv.reader(open(sys.argv[1], "rb")))

csv.writer(open(sys.argv[2], "wb")).writerows(a)
