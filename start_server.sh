#!/bin/bash

# Start main server for all apps
# Serves index.html + all sub-apps via Python static server

echo "🚀 Starting Demo Server..."

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

# ==========================================
# Build React apps if dist/ doesn't exist
# ==========================================
build_app() {
  local app_name="$1"
  local app_dir="$SCRIPT_DIR/$app_name"

  if [ ! -d "$app_dir" ]; then
    echo "⚠️  $app_name directory not found, skipping."
    return
  fi

  if [ ! -d "$app_dir/dist" ]; then
    echo "🔨 Building $app_name..."
    cd "$app_dir"
    if [ ! -d "node_modules" ]; then
      echo "📦 Installing $app_name dependencies..."
      npm install
    fi
    npx vite build
    echo "✅ $app_name built."
    cd "$SCRIPT_DIR"
  else
    echo "✅ $app_name already built (dist/ exists)."
  fi
}

echo ""
echo "🔄 Checking React apps..."
build_app "kid_drawing"
build_app "kid_chat"
build_app "kid_video"
build_app "baby"
build_app "kid_music"
build_app "kid_caro"

echo ""
echo "🌐 Starting main server on port $MAIN_PORT..."
echo "📌 Open http://localhost:$MAIN_PORT in your browser"
echo ""
echo "  Available apps:"
echo "  - Main index:    http://localhost:$MAIN_PORT"
echo "  - Kid Drawing:   http://localhost:$MAIN_PORT/kid_drawing/dist/"
echo "  - Kid Chat:      http://localhost:$MAIN_PORT/kid_chat/dist/"
echo "  - Kid Music:     http://localhost:$MAIN_PORT/kid_music/dist/"
echo "  - Kid Caro:      http://localhost:$MAIN_PORT/kid_caro/dist/"
echo "  - Kid Video:     http://localhost:$MAIN_PORT/kid_video/dist/"
echo "  - Stock API:     http://localhost:$MAIN_PORT/api/quote?tickers=VIC"
echo ""

python3 server.py
