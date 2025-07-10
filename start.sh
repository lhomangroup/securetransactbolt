#!/bin/bash

# Start the backend server in the background
echo "🚀 Starting backend server..."
npm run server &

# Wait a moment for the server to start
sleep 3

# Start the frontend
echo "🌐 Starting frontend..."
npm run dev