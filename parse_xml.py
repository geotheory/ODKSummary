import elementtree.ElementTree
from lxml import etree
import re
import json
import sys

with open (sys.argv[1], "r") as myfile:
  xml = myfile.read().replace('\n', '')
xml = re.sub('>[ ]+<', '><', xml)

tree = etree.XML(xml)


def num(str):
  try:
    return int(str)
  except:
    return str


def get_items(obj):
  if obj.tag == "{http://www.w3.org/2002/xforms}group":
    return -1
  results = {}
  labs = obj.findall(".//{http://www.w3.org/2002/xforms}label")
  vals = obj.findall(".//{http://www.w3.org/2002/xforms}value")
  if len(vals) == 0:
    return -1
  for i in range(len(vals)):
    results[num(vals[i].text)] = labs[i+1].text
  return {labs[0].text: results}

# get_items(tree.findall(".//{http://www.w3.org/2002/xforms}*[@ref]")[2])


def get_label(tree, treestr):
  poss_matches = tree.findall(treestr)
  labels = []
  items = {}
  for i in range(len(poss_matches)):
    if poss_matches[i].attrib.values()[0] != 'field-list':
      labels.append([poss_matches[i].attrib.values()[-1], poss_matches[i].getchildren()[0].text])
    item = get_items(poss_matches[i])
    if item != -1:
      items[item.keys()[0]] = item.values()
  return {"labels": labels, "items": items}


parsed = get_label(tree, ".//{http://www.w3.org/2002/xforms}*[@ref]")

with open(sys.argv[2],'w') as f:
  json.dump(parsed, f)

