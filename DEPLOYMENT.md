# Qaraj App - Deployment Guide

This document provides comprehensive instructions for deploying the Qaraj vehicle management application to production.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Backend Deployment](#backend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [Mobile App Deployment](#mobile-app-deployment)
7. [Third-Party Services](#third-party-services)
8. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Architecture Overview

### Technology Stack

**Frontend:**
- React Native 0.81.5
- Expo SDK 54.0.20
- Expo Router (file-based routing)
- TypeScript 5.9.2

**Backend:**
- Hono 4.10.4 (Web Framework)
- tRPC 11.7.1 (Type-safe API)
- SuperJSON (Data serialization)

**State Management:**
- @tanstack/react-query 5.90.6 (Server state)
- AsyncStorage (Local persistence)
- Custom context hooks via @nkzw/create-context-hook

**Features:**
- Multi-language support (English, Azerbaijani, Russian)
- Dark/Light theme
- Vehicle management with photo uploads
- Service records tracking
- Appointment scheduling
- Phone-based authentication

---

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ or Bun runtime
- iOS Developer Account (for iOS deployment)
- Google Play Console Account (for Android deployment)
- Domain name for backend API
- SSL certificate for production API
- Cloud hosting account (Vercel, Railway, Fly.io, AWS, etc.)
- Database service (PostgreSQL, MySQL, or MongoDB)
- Object storage for images (AWS S3, Cloudinary, etc.)

---

## Backend Deployment

### 1. Backend Architecture

The backend uses:
- **Hono** as the web server
- **tRPC** for type-safe API endpoints
- **CORS** enabled for cross-origin requests

Current backend structure:
```
backend/
├── hono.ts (Main server entry)
├── trpc/
│   ├── app-router.ts (Route definitions)
│   ├── create-context.ts (tRPC context)
│   └── routes/
│       ├── example/hi/route.ts
│       └── vehicles/get-by-phone/route.ts
```

### 2. Database Integration (REQUIRED)

**Current State:** The app uses AsyncStorage for local data persistence. This works for development but **IS NOT SUITABLE FOR PRODUCTION**.

**Required Changes:**

#### Option A: PostgreSQL (Recommended)
```bash
npm install @prisma/client prisma
npx prisma init
```

Create `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  username  String
  phone     String   @unique
  email     String?
  avatar    String?
  language  String   @default("en")
  theme     String   @default("dark")
  createdAt DateTime @default(now())
  vehicles  Vehicle[]
  serviceRecords ServiceRecord[]
  appointments Appointment[]
}

model Vehicle {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  brand         String
  model         String
  year          Int
  vin           String
  licensePlate  String
  photos        Json
  primaryPhotoId String?
  mileage       Int?
  color         String?
  createdAt     DateTime @default(now())
  serviceRecords ServiceRecord[]
  appointments  Appointment[]
}

model ServiceRecord {
  id           String   @id @default(cuid())
  vehicleId    String
  vehicle      Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  serviceName  String
  serviceType  String
  date         DateTime
  mileage      Int
  notes        String?
  cost         Float?
  serviceCenter String?
  technician   String?
  partsUsed    Json?
  createdAt    DateTime @default(now())
}

model Appointment {
  id                    String   @id @default(cuid())
  userId                String
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  vehicleId             String
  vehicle               Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  serviceType           String
  date                  DateTime
  time                  String
  status                String   @default("pending")
  notes                 String?
  serviceCenter         String
  serviceCenterAddress  String?
  createdAt             DateTime @default(now())
}
```

Run migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### Option B: MongoDB
```bash
npm install mongodb mongoose
```

Update backend to use MongoDB connection.

### 3. Image Storage (REQUIRED)

**Current State:** Images are stored locally using expo-image-picker. For production, use cloud storage.

#### Option A: AWS S3
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Environment variables needed:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=qaraj-vehicle-photos
```

#### Option B: Cloudinary
```bash
npm install cloudinary
```

Environment variables needed:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Deploy Backend API

#### Option A: Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/hono.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "backend/hono.ts"
    }
  ]
}
```

#### Option B: Railway
1. Connect GitHub repository
2. Add environment variables
3. Deploy with one click
4. Custom domain setup

#### Option C: Fly.io
```bash
fly launch
fly deploy
```

Create `fly.toml`:
```toml
app = "qaraj-backend"

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  PORT = "8080"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

#### Option D: AWS EC2/ECS
1. Create EC2 instance or ECS cluster
2. Install Node.js/Bun
3. Clone repository
4. Install dependencies: `bun install`
5. Build application: `bun run build`
6. Start with PM2: `pm2 start backend/hono.ts`
7. Configure nginx as reverse proxy
8. Setup SSL with Let's Encrypt

**Production Backend URL:** Once deployed, you'll get a URL like:
- `https://qaraj-api.vercel.app`
- `https://qaraj-backend.fly.dev`
- `https://api.yourdomain.com`

---

## Database Setup

### PostgreSQL (Recommended)

#### Cloud Providers:

**1. Supabase (Easiest)**
- Sign up at https://supabase.com
- Create new project
- Copy connection string
- Set DATABASE_URL environment variable

**2. Neon**
- Sign up at https://neon.tech
- Create database
- Copy connection string

**3. Railway**
- Add PostgreSQL plugin
- Automatic DATABASE_URL injection

**4. AWS RDS**
- Create PostgreSQL instance
- Configure security groups
- Connect using connection string

**Connection String Format:**
```
postgresql://username:password@host:5432/database?sslmode=require
```

### MongoDB

**Cloud Providers:**
- MongoDB Atlas (https://www.mongodb.com/atlas)
- Create cluster
- Whitelist IP addresses
- Get connection string

---

## Environment Variables

### Backend Environment Variables

Create `.env` file in project root:

```bash
# API Base URL (Required for mobile app)
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-api-domain.com

# Database (Choose one)
DATABASE_URL=postgresql://user:pass@host:5432/qaraj
# OR
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/qaraj

# Image Storage (Choose one)
# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=qaraj-photos

# OR Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Authentication (if using third-party)
JWT_SECRET=your_secure_random_string_min_32_chars

# SMS Provider (for phone verification)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Email Provider (optional)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yourdomain.com

# Node Environment
NODE_ENV=production
PORT=8080
```

### Mobile App Environment Variables

In your deployment platform, set:

```bash
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-api-domain.com
```

**Important:** Rebuild the app after changing environment variables.

---

## Mobile App Deployment

### 1. Update App Configuration

Edit `app.json`:

```json
{
  "expo": {
    "name": "Qaraj",
    "slug": "qaraj",
    "version": "1.0.0",
    "owner": "your_expo_account",
    "updates": {
      "url": "https://u.expo.dev/your_project_id"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

### 2. Configure EAS Build

Install EAS CLI:
```bash
npm install -g eas-cli
eas login
```

Initialize EAS:
```bash
eas build:configure
```

This creates `eas.json`:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_RORK_API_BASE_URL": "https://your-api-domain.com"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 3. iOS Deployment

**Requirements:**
- Apple Developer Account ($99/year)
- Bundle Identifier: `app.rork.qaraj` (configure in Apple Developer Portal)

**Steps:**

1. Create App in App Store Connect
2. Configure Bundle ID and App Name
3. Build for iOS:
```bash
eas build --platform ios --profile production
```

4. Submit to App Store:
```bash
eas submit --platform ios --latest
```

5. Fill out App Store metadata:
   - Screenshots (required sizes)
   - App description
   - Keywords
   - Privacy policy URL
   - Support URL
   - App category: Utilities or Productivity
   - Age rating

**App Permissions Used:**
- Camera (for vehicle photos)
- Photo Library (for selecting images)
- Location (optional, for service centers)

### 4. Android Deployment

**Requirements:**
- Google Play Console Account ($25 one-time fee)
- Package Name: `app.rork.qaraj`

**Steps:**

1. Create Keystore:
```bash
eas credentials
```

2. Build for Android:
```bash
eas build --platform android --profile production
```

3. Submit to Google Play:
```bash
eas submit --platform android --latest
```

4. Google Play Console Setup:
   - Upload screenshots
   - Write store listing
   - Set content rating
   - Pricing & distribution
   - Privacy policy URL

**App Permissions Declared:**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### 5. Over-The-Air (OTA) Updates

Configure EAS Update for instant updates without app store review:

```bash
eas update:configure
```

Publish updates:
```bash
eas update --branch production --message "Bug fixes"
```

---

## Third-Party Services

### 1. SMS/Phone Verification (REQUIRED for phone auth)

**Twilio (Recommended)**
- Sign up: https://www.twilio.com
- Get phone number
- Copy Account SID and Auth Token
- Implement in backend: `npm install twilio`

**Alternative: AWS SNS**
- Configure AWS SNS
- Set up SMS spending limits

### 2. Push Notifications (Recommended)

**Expo Push Notifications (Free)**
```bash
npm install expo-notifications
```

Configure in `app.json`:
```json
{
  "expo": {
    "notification": {
      "icon": "./assets/images/notification-icon.png",
      "color": "#000000"
    }
  }
}
```

Backend integration:
```bash
npm install expo-server-sdk
```

### 3. Analytics (Optional but Recommended)

**Options:**
- Google Analytics for Firebase
- Mixpanel
- Amplitude

Install:
```bash
npx expo install expo-firebase-analytics
```

### 4. Crash Reporting (Recommended)

**Sentry**
```bash
npx expo install @sentry/react-native
```

Configure in `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "@sentry/react-native/expo",
        {
          "organization": "your-org",
          "project": "qaraj"
        }
      ]
    ]
  }
}
```

### 5. Maps Integration (for Service Centers)

Already using `react-native-maps` (polyfilled for web).

Additional setup for native:
- iOS: Get Apple Maps API key
- Android: Get Google Maps API key in Google Cloud Console

Add to `app.json`:
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    }
  }
}
```

---

## Post-Deployment Checklist

### Backend

- [ ] Backend API is deployed and accessible
- [ ] Database is set up and migrated
- [ ] Environment variables are configured
- [ ] CORS is properly configured
- [ ] SSL certificate is active (HTTPS)
- [ ] API health check endpoint returns 200: `GET /`
- [ ] tRPC endpoints are functional: `POST /api/trpc/*`
- [ ] Image upload is working
- [ ] Database backups are scheduled
- [ ] Monitoring is set up (Sentry, DataDog, etc.)
- [ ] Rate limiting is configured
- [ ] API documentation is created

### Mobile App

- [ ] Production API URL is set in environment variables
- [ ] App builds successfully for iOS and Android
- [ ] All screens are functional
- [ ] Photos can be uploaded and displayed
- [ ] AsyncStorage is working (local data persistence)
- [ ] Language switching works (EN, AZ, RU)
- [ ] Dark/Light theme switching works
- [ ] Navigation flows correctly
- [ ] Authentication works
- [ ] Vehicle management works (CRUD operations)
- [ ] Appointments can be created and managed
- [ ] Service records are tracked
- [ ] App doesn't crash on web preview
- [ ] Push notifications are configured (if implemented)
- [ ] Analytics are tracking events (if implemented)
- [ ] Crash reporting is active (if implemented)

### App Store

**iOS:**
- [ ] App is submitted to App Store Connect
- [ ] All required screenshots uploaded
- [ ] App description and keywords set
- [ ] Privacy policy URL provided
- [ ] Support URL provided
- [ ] App review information completed
- [ ] Build is in "Waiting for Review" or approved

**Android:**
- [ ] App is submitted to Google Play Console
- [ ] Store listing completed
- [ ] Content rating completed
- [ ] Pricing & distribution set
- [ ] Privacy policy URL provided
- [ ] App is in review or published

### Security

- [ ] All API endpoints are secured
- [ ] User data is encrypted in transit (HTTPS)
- [ ] Sensitive data is encrypted at rest
- [ ] SQL injection protection is in place (use Prisma/ORM)
- [ ] Rate limiting prevents abuse
- [ ] User authentication is secure
- [ ] Phone numbers are validated
- [ ] File uploads are validated and sanitized
- [ ] API keys are not exposed in client code
- [ ] Environment variables are not committed to git

### Performance

- [ ] API response times are < 500ms
- [ ] Images are optimized and compressed
- [ ] Database queries are indexed
- [ ] Lazy loading is implemented where needed
- [ ] App startup time is < 3 seconds
- [ ] No memory leaks in app

### Legal

- [ ] Privacy policy is created and hosted
- [ ] Terms of service are created
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policy is defined
- [ ] User data deletion process is implemented

---

## Deployment Commands Quick Reference

```bash
# Backend Deployment (Vercel)
vercel --prod

# Backend Deployment (Fly.io)
fly deploy

# iOS Build
eas build --platform ios --profile production

# Android Build
eas build --platform android --profile production

# iOS Submit
eas submit --platform ios --latest

# Android Submit
eas submit --platform android --latest

# OTA Update
eas update --branch production --message "Update description"

# Database Migration
npx prisma migrate deploy
npx prisma generate
```

---

## Support Contacts

### Hosting Providers
- **Vercel Support**: https://vercel.com/support
- **Railway Support**: https://railway.app/help
- **Fly.io Support**: https://community.fly.io

### Database Providers
- **Supabase Support**: https://supabase.com/support
- **Neon Support**: https://neon.tech/docs/introduction
- **MongoDB Atlas Support**: https://www.mongodb.com/support

### Mobile App
- **Expo Support**: https://expo.dev/support
- **Apple Developer Support**: https://developer.apple.com/support
- **Google Play Support**: https://support.google.com/googleplay

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check API uptime
- Review crash reports

**Weekly:**
- Review analytics
- Check database size
- Monitor API performance
- Review user feedback

**Monthly:**
- Update dependencies
- Security audit
- Database backup verification
- Review and update documentation

**As Needed:**
- Release OTA updates for bug fixes
- Submit app updates to stores (major features)
- Scale backend resources

---

## Troubleshooting

### Common Issues

**1. App Can't Connect to Backend**
- Check EXPO_PUBLIC_RORK_API_BASE_URL is set correctly
- Verify backend is running: `curl https://your-api-domain.com`
- Check CORS configuration in backend
- Ensure API is using HTTPS

**2. Images Not Uploading**
- Verify image storage credentials
- Check file size limits
- Review backend logs for errors

**3. Database Connection Failed**
- Verify DATABASE_URL format
- Check database is running
- Confirm IP whitelist includes backend server
- Test connection with database client

**4. Build Fails**
- Clear cache: `eas build --clear-cache`
- Verify all dependencies are installed
- Check environment variables
- Review build logs in EAS dashboard

**5. App Rejected by App Store**
- Review rejection reason carefully
- Common issues: missing privacy policy, unclear functionality, crashes
- Fix issues and resubmit

---

## Cost Estimation

### Minimum Monthly Costs

**Infrastructure:**
- Backend Hosting (Vercel/Railway): $0-20/month
- Database (Supabase/Neon): $0-25/month
- Image Storage (AWS S3): $1-10/month
- Domain + SSL: $1/month (Cloudflare) - $12/year

**Mobile:**
- Apple Developer: $99/year (~$8.25/month)
- Google Play: $25 one-time
- EAS Subscription (optional): Free tier available

**Third-Party Services:**
- Twilio SMS: $0.0075/message (pay as you go)
- Push Notifications: Free with Expo
- Sentry: Free tier available

**Total Estimated: $30-60/month** for basic production deployment

---

## Scaling Considerations

As your app grows, consider:

1. **Backend Scaling:**
   - Horizontal scaling (multiple instances)
   - Load balancer
   - CDN for static assets
   - Redis for caching

2. **Database Scaling:**
   - Read replicas
   - Connection pooling
   - Database sharding (for very large scale)

3. **Image Storage:**
   - CDN integration (CloudFront, Cloudflare)
   - Image optimization pipeline
   - Lazy loading strategies

4. **Monitoring:**
   - Application Performance Monitoring (APM)
   - Real User Monitoring (RUM)
   - Uptime monitoring
   - Custom alerting

---

## Next Steps After Deployment

1. Set up continuous integration/deployment (CI/CD)
2. Create automated testing pipeline
3. Implement A/B testing for features
4. Add advanced analytics
5. Build admin dashboard for managing users/data
6. Implement customer support chat
7. Add payment integration (if monetizing)
8. Create marketing website
9. Set up social media presence
10. Gather user feedback and iterate

---

## Contact

For questions about this deployment guide, refer to:
- Expo Documentation: https://docs.expo.dev
- tRPC Documentation: https://trpc.io
- Hono Documentation: https://hono.dev

Last Updated: 2026-01-13
