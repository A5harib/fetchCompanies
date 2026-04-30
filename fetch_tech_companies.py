import requests
import re
import json
import time
from concurrent.futures import ThreadPoolExecutor

keywords = ['software', 'developer', 'fullstack', 'react', 'python', 'node', 'frontend', 'backend', 'programmer', 'engineer', 'tech']
base_url = 'https://www.searchopal.com/jobs?keywords='
api_url = 'https://searchopal-dev-11311db4105f.herokuapp.com/api/jobs/job-detail-info/'

unique_identifiers = set()

print("Scraping job identifiers...", flush=True)

for kw in keywords:
    try:
        r = requests.get(base_url + kw, timeout=5)
        links = re.findall(r'/jobs/[a-zA-Z0-9\-]+-(\d{8,12})', r.text) # Match at least 8 digits to skip short false positives
        for link in links:
            unique_identifiers.add(link)
    except Exception as e:
        print(f"Error fetching {kw}: {e}", flush=True)

print(f"Found {len(unique_identifiers)} unique long identifiers. Fetching details...", flush=True)

tech_companies = set()

def fetch_company(identifier):
    try:
        r = requests.get(api_url + identifier, timeout=5)
        if r.status_code == 200:
            data = r.json()
            company_name = data.get('company_name')
            if company_name:
                tech_companies.add(company_name)
    except:
        pass

with ThreadPoolExecutor(max_workers=20) as executor:
    executor.map(fetch_company, unique_identifiers)

output_file = 'tech_companies.json'
with open(output_file, 'w') as f:
    json.dump(list(tech_companies), f, indent=4)

print(f"Finished! Found {len(tech_companies)} tech companies and saved to {output_file}.", flush=True)
