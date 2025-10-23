#!/bin/bash

# Production Deployment Script for Nana Caring Backend
# This script prepares and deploys the application to production

echo "🚀 Starting Production Deployment for Nana Caring Backend..."

# Set production environment
export NODE_ENV=production

# Load production environment variables
if [ -f .env.production ]; then
    echo "📄 Loading production environment variables..."
    export $(cat .env.production | xargs)
else
    echo "❌ .env.production file not found!"
    exit 1
fi

# Install production dependencies
echo "📦 Installing production dependencies..."
npm ci --only=production

# Run database migrations
echo "🗄️ Running database migrations..."
npm run migrate:prod

# Check if migrations were successful
if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ Database migrations failed!"
    exit 1
fi

# Start the production server
echo "🚀 Starting production server..."
npm run production

echo "✅ Production deployment completed successfully!"
