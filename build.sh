#!/bin/bash

# Production Deployment Script for Render
# This script will run automatically on Render deployment

echo "🚀 Starting Nana Caring Backend deployment on Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run database migrations
echo "🗄️ Running database migrations..."
NODE_ENV=production npx sequelize-cli db:migrate

# Check if migrations were successful
if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ Database migrations failed!"
    exit 1
fi

echo "✅ Deployment preparation completed!"
echo "🚀 Starting production server..."

# Start the server (Render will handle this automatically)
npm start
