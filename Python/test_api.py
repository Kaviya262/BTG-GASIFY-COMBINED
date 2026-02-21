import requests

try:
    print("Testing /journal/get-gl-codes...")
    r1 = requests.get('http://127.0.0.1:8000/journal/get-gl-codes')
    print("Status:", r1.status_code)
    print("Response:", r1.text)
    
    print("\nTesting /journal/get-party-list/customer...")
    r2 = requests.get('http://127.0.0.1:8000/journal/get-party-list/customer')
    print("Status:", r2.status_code)
    print("Response:", r2.text)
except Exception as e:
    print("Request failed:", e)
