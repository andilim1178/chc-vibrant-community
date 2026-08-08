#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://localhost:7071/api/projects"

echo "1. Create project"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke Test Project","addr":"1 Test St","postcode":"6000","type":"Mixed Use","by":null}')
echo "$CREATE_RESPONSE"
ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created id: $ID"

echo "2. List projects"
curl -s "$BASE_URL" | grep -q "$ID" && echo "PASS: appears in list" || { echo "FAIL: not in list"; exit 1; }

echo "3. Get by id"
curl -s "$BASE_URL/$ID" | grep -q '"answersJson":"{}"' && echo "PASS: empty answers" || { echo "FAIL"; exit 1; }

echo "4. Update project"
curl -s -X PUT "$BASE_URL/$ID" \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke Test Project","addr":"1 Test St","postcode":"6000","type":"Mixed Use","by":null,"answersJson":"{\"transport\":{\"0\":\"yes\"}}","scoresJson":"{\"transport\":5}"}' \
  | grep -q 'transport' && echo "PASS: update reflected" || { echo "FAIL"; exit 1; }

echo "5. Duplicate name conflict"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke Test Project","addr":"Different","postcode":"6000","type":"Mixed Use","by":null}')
[ "$STATUS" = "409" ] && echo "PASS: 409 on duplicate" || { echo "FAIL: got $STATUS"; exit 1; }

echo "6. Delete project"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/$ID")
[ "$STATUS" = "204" ] && echo "PASS: 204 on delete" || { echo "FAIL: got $STATUS"; exit 1; }

echo "7. Confirm deleted"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$ID")
[ "$STATUS" = "404" ] && echo "PASS: 404 after delete" || { echo "FAIL: got $STATUS"; exit 1; }

echo "ALL SMOKE TESTS PASSED"
