import json
import random
import csv

# Load the GeoJSON file
with open('clustering-map/src/components/dmamap/nielsengeo.json') as f:
    geo = json.load(f)

# Write to CSV
with open('clustering-map/source.csv', 'w', newline='') as f:
    w = csv.writer(f)
    w.writerow(['dma', 'random_numeric_value'])
    for feat in geo['features']:
        dma = feat['properties']['dma']
        w.writerow([dma, random.randint(1, 100)]) 