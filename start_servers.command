#!/bin/bash

# ==============================================================================
# Sejong Cook - Unified Server Startup Script
# ==============================================================================

# Get the script's directory
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$BASE_DIR"

echo "--------------------------------------------------"
echo "Starting Sejong Cook Servers..."
echo "--------------------------------------------------"

# 1. Sync Data Files
echo "[1/4] Synchronizing latest student data..."
cp "$BASE_DIR/Sejong/data/"*.json "$BASE_DIR/Sejong/SejongAttendance/data/" 2>/dev/null || true
echo "Data synchronization complete."

# 2. Start Python Server (Port 8000)
echo "[2/4] Starting Attendance Server (Port 8000)..."
cd "$BASE_DIR/Sejong/SejongAttendance"
# Kill existing process if any
kill -9 $(lsof -t -i :8000) 2>/dev/null || true
# Start server in background
nohup python3 server.py > server.log 2>&1 &
echo "Attendance Server started."

# 3. Start Next.js Server (Port 3000)
echo "[3/4] Starting Main Web Server (Port 3000)..."
cd "$BASE_DIR"
# Kill existing process if any
kill -9 $(lsof -t -i :3000) 2>/dev/null || true
# Start Next.js
nohup npm run dev > next_server.log 2>&1 &
echo "Web Server starting in background."

# 4. Open Browser
echo "[4/4] Opening browser pages..."
sleep 2
open "http://localhost:8000/ledger.html"
open "http://localhost:8000/index.html"
open "http://localhost:3000"

echo "--------------------------------------------------"
echo "All servers are launching!"
echo "Attendance (8000) is ready."
echo "Web Server (3000) will be ready in a few seconds."
echo "--------------------------------------------------"
echo "You can close this terminal window now."
