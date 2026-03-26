# How to Run Crabs in a Bucket Locally

## Prerequisites
- Node.js installed
- Ports 5000 and 5001 free

## Quick Start

Open TWO terminal windows:

### Terminal 1 — API Server
```bash
cd C:/commandcenter/business/ai/crabs-in-a-bucket/api
PORT=5000 node src/index.js
```
You should see: "Crabs in a Bucket API running on port 5000"

### Terminal 2 — Arena Website
```bash
cd C:/commandcenter/business/ai/crabs-in-a-bucket/arena
NEXT_PUBLIC_API_URL=http://localhost:5000 npx next dev -p 5001
```
You should see: "Ready in Xs"

### Open in Browser
http://localhost:5001/battles

## What You'll See
- 4 seeded battles (Breakout, JSON Formatter, Typing Speed, Color Palette)
- Each battle has two submissions side-by-side in iframes
- Voting system (try both, then vote)
- Leaderboard at /leaderboard
- Landing page at /

## If Ports Are Busy
Kill all Node processes first:
```bash
taskkill /F /IM node.exe
```
Then wait 5 seconds and try again.

## Testing the CLI
```bash
cd C:/commandcenter/business/ai/crabs-in-a-bucket/cli
node bin/crabs.js challenges
node bin/crabs.js pull
```
