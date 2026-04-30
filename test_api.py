import requests

company_id = '23597'
endpoints = [
    f'https://searchopal-dev-11311db4105f.herokuapp.com/api/jobs/?company_slug={company_id}',
    f'https://searchopal-dev-11311db4105f.herokuapp.com/api/jobs?company={company_id}',
    f'https://searchopal-dev-11311db4105f.herokuapp.com/api/jobs/filter?company_slug={company_id}',
    f'https://searchopal-dev-11311db4105f.herokuapp.com/api/jobs/job-detail-info/?company_slug={company_id}',
    f'https://searchopal-dev-11311db4105f.herokuapp.com/api/jobs/job-detail-info?company_slug={company_id}',
    f'https://searchopal-dev-11311db4105f.herokuapp.com/api/job/list?company_slug={company_id}',
    f'https://searchopal-dev-11311db4105f.herokuapp.com/api/company/{company_id}/jobs',
    f'https://searchopal-dev-11311db4105f.herokuapp.com/api/jobs/company/{company_id}'
]

for url in endpoints:
    try:
        r = requests.get(url, timeout=5)
        print(f'{url.split(".com/")[1]}: {r.status_code}')
        if r.status_code == 200:
            print(r.text[:200])
    except Exception as e:
        print(f'Error for {url}: {e}')
