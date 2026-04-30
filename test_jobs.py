import requests

urls = [
    'https://searchopal-dev-11311db4105f.herokuapp.com/api/job/job-list/',
    'https://searchopal-dev-11311db4105f.herokuapp.com/api/jobs/job-list/',
    'https://searchopal-dev-11311db4105f.herokuapp.com/api/jobs/job-detail-info/',
    'https://searchopal-dev-11311db4105f.herokuapp.com/api/company/job-list/',
    'https://searchopal-dev-11311db4105f.herokuapp.com/api/jobs/list/',
    'https://searchopal-dev-11311db4105f.herokuapp.com/api/jobs/all/'
]

for url in urls:
    try:
        r = requests.get(url, timeout=5)
        print(f'{url.split(".com/")[1]}: {r.status_code}')
        if r.status_code == 200:
            print(r.text[:200])
    except Exception as e:
        print(f'{url}: Error {e}')
