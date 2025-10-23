# Nana Caring Backend - Production Deployment Guide

## 🚀 Production Environment Setup

This guide covers deploying the Nana Caring Backend to a production environment.

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (configured in production)
- Environment variables configured
- SSL certificates (for HTTPS)

### Environment Configuration

The application uses `.env.production` for production environment variables:

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your_production_jwt_secret
STRIPE_SECRET_KEY=sk_live_your_production_key
CORS_ORIGIN=https://your-frontend-domain.com
```

### Deployment Options

#### Option 1: Direct Node.js Deployment

1. **Install dependencies:**
   ```bash
   npm ci --only=production
   ```

2. **Run database migrations:**
   ```bash
   npm run migrate:prod
   ```

3. **Start the server:**
   ```bash
   npm run production
   ```

#### Option 2: Using Deployment Scripts

**Windows:**
```bash
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Option 3: Docker Deployment

1. **Build the image:**
   ```bash
   docker build -t nana-caring-backend .
   ```

2. **Run with docker-compose:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Production Features

✅ **Enhanced Security:**
- Helmet.js security headers
- CORS configuration
- Rate limiting
- Input validation

✅ **Database Management:**
- Production PostgreSQL connection
- SSL enabled for database
- Migration system

✅ **Order Management:**
- Unique 8-digit store codes
- Comprehensive product snapshots
- In-store verification system

✅ **Transaction Tracking:**
- Complete transaction history
- Real-time balance updates
- Analytics and reporting

✅ **Payment Processing:**
- Stripe integration
- Secure payment handling
- Webhook verification

### Health Check

The application includes a health check endpoint:
```
GET /health
```

Returns server status and environment information.

### Monitoring

- Health check endpoint: `/health`
- Error logging configured for production
- Process management with PM2 (recommended)

### SSL/HTTPS Setup

For production deployment with HTTPS:

1. Obtain SSL certificates
2. Configure reverse proxy (Nginx recommended)
3. Update CORS_ORIGIN with HTTPS URLs

### Database Migrations

Run migrations in production:
```bash
npm run migrate:prod
```

Rollback if needed:
```bash
npm run migrate:undo:prod
```

### Performance Optimization

- Use PM2 for process management
- Enable gzip compression
- Configure CDN for static assets
- Database connection pooling enabled

### Backup Strategy

1. **Database Backups:**
   - Automated daily backups
   - Point-in-time recovery

2. **File Uploads:**
   - Regular backup of uploads directory
   - Consider cloud storage integration

### Troubleshooting

**Common Issues:**

1. **Database Connection:**
   - Verify DATABASE_URL format
   - Check SSL settings
   - Ensure firewall allows connections

2. **Environment Variables:**
   - Verify .env.production file
   - Check all required variables are set

3. **CORS Issues:**
   - Update CORS_ORIGIN with correct frontend URLs
   - Verify protocol (HTTP vs HTTPS)

### Security Checklist

- [ ] JWT secrets are secure and unique
- [ ] Database credentials are secured
- [ ] Stripe uses live keys (not test)
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation active

### Production URLs

- **API Base:** `https://your-api-domain.com`
- **Health Check:** `https://your-api-domain.com/health`
- **Admin Panel:** `https://your-api-domain.com/admin`

## Support

For production deployment support, contact the development team.
