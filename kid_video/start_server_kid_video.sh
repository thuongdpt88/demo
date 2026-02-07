#!/bin/bash

# Build kid_video if dist folder doesn't exist
if [ ! -d "dist" ]; then
  echo "⚠️  dist not found. Building..."
  npm install
  npm run build
fi
