import requests
import json
import time

BASE_URL = "https://searchopal-dev-11311db4105f.herokuapp.com/api/company/detail/"
OUTPUT_FILE = "companies_data.json"

def fetch_companies(start, end):
    all_data = []
    
    # Load existing data if you're restarting the script
    try:
        with open(OUTPUT_FILE, 'r') as f:
            all_data = json.load(f)
            print(f"Resuming... {len(all_data)} records already found.")
    except FileNotFoundError:
        pass

    for company_id in range(start, end + 1):
        try:
            response = requests.get(f"{BASE_URL}{company_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                all_data.append(data)
                company_name = data.get('name', 'Unknown Name')
                print(f"Fetched ID: {company_id} - Success ({company_name})")
            else:
                print(f"ID: {company_id} - Skipped (Status: {response.status_code})")

            # Instantly write the fetched data to the JSON file
            with open(OUTPUT_FILE, 'w') as f:
                json.dump(all_data, f, indent=4)
            
            # Tiny sleep to avoid being blocked
            time.sleep(0.1) 

        except Exception as e:
            print(f"Error fetching {company_id}: {e}")
            continue

    # Final save
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(all_data, f, indent=4)
    print("Finished! Data saved to companies_data.json")

# Start fetching (Adjust the range as needed)
fetch_companies(20401, 23440)