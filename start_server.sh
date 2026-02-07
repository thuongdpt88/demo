#!/bin/bash

# Start Server for Render Deployment
# - Serves static files from root directory
# - Proxies /api/youtube-search to YouTube API service
# - kid_video app works seamlessly

echo "🚀 Starting Render Server..."

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

MAIN_PORT="${PORT:-8000}"

# Kill any existing process on the port
kill_port() {
  local PID
  PID=$(lsof -ti :"$MAIN_PORT" 2>/dev/null)
  if [ -n "$PID" ]; then
    echo "⚠️  Port $MAIN_PORT is in use (PID: $PID). Killing..."
    kill -9 $PID 2>/dev/null
    sleep 1
    echo "✅ Old process killed."
  fi
}

# Cleanup on exit (Ctrl+C or script termination)
cleanup() {
  echo ""
  echo "🛑 Stopping server..."
  kill_port
  echo "👋 Server stopped."
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Kill old process if port is still occupied
kill_port

echo "🔄 Preparing kid_video app..."
cd kid_video
./start_server_kid_video.sh
cd ..

# Start main server with integrated YouTube API proxy
echo "🌐 Starting server on port $MAIN_PORT..."
echo "📌 Open http://localhost:$MAIN_PORT in your browser"
echo "📌 Kid Video: http://localhost:$MAIN_PORT/kid_video/dist/"

echo "🔌 Starting YouTube API proxy..."
python3 kid_video/proxy_youtube_api.py
