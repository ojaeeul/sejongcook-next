import http.client
import urllib.parse

def check_url(url):
    parsed = urllib.parse.urlparse(url)
    conn = http.client.HTTPConnection(parsed.netloc)
    conn.request("HEAD", parsed.path)
    res = conn.getresponse()
    print(f"Status: {res.status}")
    print(f"Reason: {res.reason}")
    for header, value in res.getheaders():
        print(f"{header}: {value}")

print("Checking http://localhost:3000/admin")
check_url("http://localhost:3000/admin")
print("\nChecking http://localhost:3000/admin/")
check_url("http://localhost:3000/admin/")
