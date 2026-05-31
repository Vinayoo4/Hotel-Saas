#!/bin/bash

# Start server if not running
if ! pgrep -f "ts-node index.ts" > /dev/null; then
    npx ts-node index.ts > server.log 2>&1 &
    sleep 3
fi

echo "Testing GET /api/health..."
curl -s http://localhost:3001/api/health | grep -q "ok"
if [ $? -eq 0 ]; then echo "✅ GET /api/health passed"; else echo "❌ GET /api/health failed"; fi

echo "Testing POST /api/auth/login with wrong password..."
curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"username": "admin", "password": "wrongpassword"}' | grep -q "Invalid credentials"
if [ $? -eq 0 ]; then echo "✅ POST /api/auth/login (fail) passed"; else echo "❌ POST /api/auth/login (fail) failed"; fi

echo "Testing POST /api/auth/login with correct credentials..."
RES=$(curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"username": "admin", "password": "adminpass"}')
TOKEN=$(echo $RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
    echo "✅ POST /api/auth/login (success) passed"
else
    echo "❌ POST /api/auth/login (success) failed"
fi

echo "Testing GET /api/issues..."
curl -s http://localhost:3001/api/issues | grep -q "Issue"
if [ $? -eq 0 ]; then echo "✅ GET /api/issues passed"; else echo "❌ GET /api/issues failed"; fi

echo "Testing GET /api/guides..."
curl -s http://localhost:3001/api/guides | grep -q "Guide"
if [ $? -eq 0 ]; then echo "✅ GET /api/guides passed"; else echo "❌ GET /api/guides failed"; fi

echo "Testing POST /api/savedItems without auth..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/savedItems -H "Content-Type: application/json" -d '{"userId": 1, "type": "issue", "articleId": 1, "title": "Test"}')
if [ "$HTTP_STATUS" -eq 401 ]; then echo "✅ POST /api/savedItems (unauth) passed"; else echo "❌ POST /api/savedItems (unauth) failed"; fi

echo "Testing POST /api/issues without admin token (using subscriber token if possible, or just no token)..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/issues -H "Content-Type: application/json" -d '{"title": "Test", "content": "Test"}')
if [ "$HTTP_STATUS" -eq 401 ]; then echo "✅ POST /api/issues (unauth) passed"; else echo "❌ POST /api/issues (unauth) failed"; fi

echo "Testing DELETE /api/issues/:id with admin token..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE http://localhost:3001/api/issues/1 -H "Authorization: Bearer $TOKEN")
if [ "$HTTP_STATUS" -eq 200 ]; then echo "✅ DELETE /api/issues/:id passed"; else echo "❌ DELETE /api/issues/:id failed"; fi

echo "Testing GET /api/auditLogs with admin token..."
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/auditLogs | grep -q "PUBLISH"
if [ $? -eq 0 ]; then echo "✅ GET /api/auditLogs passed"; else echo "❌ GET /api/auditLogs failed"; fi

echo "All tests finished."
