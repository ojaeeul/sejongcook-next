import json
import urllib.request
import time

BASE_URL = "http://localhost:3000/api/sejong"

def test_attendance():
    print("Testing Attendance API...")

    # 1. Fetch current members to get a test member
    req = urllib.request.Request(f"{BASE_URL}/members")
    try:
        with urllib.request.urlopen(req) as response:
            members = json.loads(response.read().decode())
    except Exception as e:
        print("Failed to fetch members:", e)
        return
        
    if not members:
        print("No members found. Cannot test.")
        return
        
    test_member = members[0]
    member_id = test_member['id']
    test_date = "2099-12-31" # Use a future date for testing
    
    print(f"Using member_id: {member_id}")
    
    # 2. Mark present
    print("Test 1: Mark attendance as present")
    req = urllib.request.Request(f"{BASE_URL}/attendance", method="POST")
    req.add_header("Content-Type", "application/json")
    data = json.dumps({
        "memberId": member_id,
        "date": test_date,
        "status": "present",
        "course": "테스트과정"
    }).encode("utf-8")
    
    with urllib.request.urlopen(req, data=data) as response:
        print("Save response:", json.loads(response.read().decode()))
        
    # Verify present
    req = urllib.request.Request(f"{BASE_URL}/attendance?date={test_date}")
    with urllib.request.urlopen(req) as response:
        logs = json.loads(response.read().decode())
        found = any(str(log.get("memberId")) == str(member_id) and log.get("status") == "present" for log in logs)
        print("Present record found in DB:", found)
        
    if not found:
        print("TEST FAILED: Record not found after save")
        return
        
    # 3. Test delete with course='ALL'
    print("Test 2: Delete attendance using course 'ALL' and status 'unchecked'")
    req = urllib.request.Request(f"{BASE_URL}/attendance", method="POST")
    req.add_header("Content-Type", "application/json")
    data = json.dumps({
        "memberId": member_id,
        "date": test_date,
        "status": "unchecked",
        "course": "ALL"
    }).encode("utf-8")
    
    with urllib.request.urlopen(req, data=data) as response:
        print("Delete response:", json.loads(response.read().decode()))
        
    # Verify deleted
    req = urllib.request.Request(f"{BASE_URL}/attendance?date={test_date}")
    with urllib.request.urlopen(req) as response:
        logs = json.loads(response.read().decode())
        found = any(str(log.get("memberId")) == str(member_id) for log in logs)
        print("Record still exists after delete?:", found)
        
    if found:
        print("TEST FAILED: Record was not deleted")
    else:
        print("TEST PASSED: Record successfully deleted")

if __name__ == "__main__":
    test_attendance()
