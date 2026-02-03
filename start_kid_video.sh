#!/bin/bash

# Start Kid Video App - YouTube Search API + Static Server
cd "$(dirname "$0")/kid_video"

# Check if dist folder exists
if [ ! -d "dist" ]; then
  echo "⚠️  dist folder not found. Building..."
  npm run build
fi

echo "🎬 Starting Kid Video Server..."
echo "📌 Open http://localhost:3002 in your browser"
node youtube-api.mjs
