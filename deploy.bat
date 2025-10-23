@echo off
echo 🚀 Starting Production Deployment for Nana Caring Backend...

REM Set production environment
set NODE_ENV=production

REM Check if .env.production exists
if not exist ".env.production" (
    echo ❌ .env.production file not found!
    exit /b 1
)

echo 📄 Production environment file found

REM Install production dependencies
echo 📦 Installing production dependencies...
npm ci --only=production

REM Check if install was successful
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    exit /b 1
)

REM Run database migrations
echo 🗄️ Running database migrations...
npm run migrate:prod

REM Check if migrations were successful
if %errorlevel% neq 0 (
    echo ❌ Database migrations failed!
    exit /b 1
) else (
    echo ✅ Database migrations completed successfully
)

REM Start the production server
echo 🚀 Starting production server...
npm run production

echo ✅ Production deployment completed successfully!
pause
