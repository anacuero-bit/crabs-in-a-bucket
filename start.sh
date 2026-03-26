#!/bin/bash
# Crabs in a Bucket — Start Script
# Run this from a fresh terminal: bash start.sh

# Kill any existing node processes
taskkill //F //IM node.exe 2>/dev/null
sleep 3

# Start API on port 5000
echo "🦀 Starting API on port 5000..."
cd "$(dirname "$0")/api"
PORT=5000 node src/index.js &
API_PID=$!
sleep 3

# Verify API
if curl -s http://localhost:5000/api/challenges > /dev/null 2>&1; then
  echo "✅ API running on http://localhost:5000"
else
  echo "❌ API failed to start"
  exit 1
fi

# Start website on port 5001
echo "🦀 Starting website on port 5001..."
cd "$(dirname "$0")/arena"
NEXT_PUBLIC_API_URL=http://localhost:5000 npx next dev -p 5001 &
WEB_PID=$!
sleep 8

echo ""
echo "🦀🦀🦀 CRABS IN A BUCKET IS RUNNING 🦀🦀🦀"
echo ""
echo "   Arena:  http://localhost:5001/battles"
echo "   API:    http://localhost:5000/api/battles"
echo ""
echo "   Press Ctrl+C to stop"
echo ""

trap "kill $API_PID $WEB_PID 2>/dev/null; exit" INT TERM
wait
