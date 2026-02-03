#!/bin/bash

# Start YouTube Search API Server + Static File Server
cd "$(dirname "$0")"

# Check if dist folder exists
if [ ! -d "dist" ]; then
  echo "⚠️  dist folder not found. Building..."
  npm run build
fi

echo "🎬 Starting YouTube Search API + Static Server..."
echo "📌 Open http://localhost:3002 in your browser"
node youtube-api.mjs
