#!/bin/bash

# Start server if not running
if ! pgrep -f "ts-node index.ts" > /dev/null; then
    npx ts-node index.ts > server.log 2>&1 &
    sleep 2
fi

echo "Testing GET /api/issues..."
curl -s http://localhost:3001/api/issues | grep -q "Issue #1"
if [ $? -eq 0 ]; then
    echo "✅ GET /api/issues passed"
else
    echo "❌ GET /api/issues failed"
fi

echo "Testing GET /api/guides..."
curl -s http://localhost:3001/api/guides | grep -q "Beginner's Guide to ESG"
if [ $? -eq 0 ]; then
    echo "✅ GET /api/guides passed"
else
    echo "❌ GET /api/guides failed"
fi

echo "Testing POST /api/savedItems..."
curl -s -X POST http://localhost:3001/api/savedItems -H "Content-Type: application/json" -d '{"userId": 2, "type": "issue", "articleId": 1, "title": "Test Issue"}' | grep -q "Test Issue"
if [ $? -eq 0 ]; then
    echo "✅ POST /api/savedItems passed"
else
    echo "❌ POST /api/savedItems failed"
fi

echo "Testing GET /api/savedItems/:userId..."
curl -s http://localhost:3001/api/savedItems/2 | grep -q "Test Issue"
if [ $? -eq 0 ]; then
    echo "✅ GET /api/savedItems/2 passed"
else
    echo "❌ GET /api/savedItems/2 failed"
fi
