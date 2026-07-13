
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "1. Setting showAuthLinks to false..."
curl -s -X POST -H "Content-Type: application/json" -d '{"showAuthLinks": false}' "$BASE_URL/api/settings"
echo -e "\nSet complete."

echo "2. Checking Homepage for '로그인' text (Should be ABSENT)..."
HTML=$(curl -s "$BASE_URL")
if echo "$HTML" | grep -q "로그인"; then
  echo "FAIL: '로그인' found in HTML when it should be hidden."
else
  echo "PASS: '로그인' not found in HTML."
fi

echo "3. Setting showAuthLinks to true..."
curl -s -X POST -H "Content-Type: application/json" -d '{"showAuthLinks": true}' "$BASE_URL/api/settings"
echo -e "\nSet complete."

echo "4. Checking Homepage for '로그인' text (Should be PRESENT)..."
HTML=$(curl -s "$BASE_URL")
if echo "$HTML" | grep -q "로그인"; then
  echo "PASS: '로그인' found in HTML."
else
  echo "FAIL: '로그인' not found in HTML when it should be visible."
fi
