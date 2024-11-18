#!/bin/bash

# Pull latest changes
git pull

# Install dependencies and rebuild
npm install
npm run build

# Restart the app
pm2 restart filecabinet

echo "Update complete!" 