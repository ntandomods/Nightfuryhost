# 🚀 NightFury Hosting Platform - Deployment Guide

Complete step-by-step guide to deploy the NightFury Hosting Platform to Render.com

## Prerequisites

Before starting, ensure you have:

1. ✅ GitHub account with this repository
2. ✅ Render.com account (https://render.com)
3. ✅ MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
4. ✅ Stripe account (https://stripe.com)
5. ✅ Cloudinary account for image hosting (optional)
6. ✅ Gmail account for SMTP (or other email provider)

---

## Step 1: Set Up MongoDB Atlas

### 1.1 Create Cluster
1. Go to https://cloud.mongodb.com
2. Sign in and create a new project
3. Click "Create" database
4. Choose "M0 Free" tier
5. Select your region and create cluster
6. Wait 5-10 minutes for cluster creation

### 1.2 Create Database User
1. Go to "Security" → "Database Access"
2. Click "Add New Database User"
3. Create username and generate a secure password
4. Save the credentials (you'll need them for `.env`)

### 1.3 Get Connection String
1. Go to "Databases" and click "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Save as `MONGODB_URI` in your `.env`

Example:
```
mongodb+srv://admin:password123@cluster0.xxxxx.mongodb.net/nightfury_hosting?retryWrites=true&w=majority
```

---

## Step 2: Set Up Stripe

### 2.1 Get API Keys
1. Go to https://dashboard.stripe.com
2. Navigate to "Developers" → "API keys"
3. Copy your:
   - **Publishable Key** → `STRIPE_PUBLISHABLE_KEY`
   - **Secret Key** → `STRIPE_SECRET_KEY`

### 2.2 Create Webhook
1. Go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Set endpoint URL: `https://your-app.onrender.com/api/payments/webhook`
4. Select events: `payment_intent.succeeded`, `payment_intent.failed`
5. Copy Signing secret → `STRIPE_WEBHOOK_SECRET`

---

## Step 3: Set Up Gmail SMTP

### 3.1 Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification

### 3.2 Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Google will generate a 16-character password
4. Copy it → `SMTP_PASSWORD`

Set these in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
```

---

## Step 4: Push to GitHub

### 4.1 Initialize Git Repository
```bash
cd NightFuryHost
git init
git add .
git commit -m "Initial commit: NightFury Hosting Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/NightFuryHost.git
git push -u origin main
```

### 4.2 Verify on GitHub
1. Go to https://github.com/YOUR_USERNAME/NightFuryHost
2. Ensure all files are uploaded
3. You're ready to deploy!

---

## Step 5: Deploy to Render.com

### Option A: Using Render Dashboard (Recommended)

#### 5.1 Create Backend Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Choose "Build and deploy from Git repository"
4. Select your NightFuryHost repository
5. Configure:
   - **Name**: `nightfury-hosting-api`
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Starter` (Free tier)

#### 5.2 Add Environment Variables

Click "Advanced" and add all from `.env`:

```
JWT_SECRET=your_random_secret_key
MONGODB_URI=your_mongodb_connection_string
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
NODE_ENV=production
PORT=5000
```

5.3 Click "Create Web Service" and wait for deployment (5-10 minutes)

#### 5.4 Get API URL
Once deployed, your backend will be at:
```
https://nightfury-hosting-api.onrender.com
```

#### 5.5 Update Stripe Webhook
1. Go back to Stripe dashboard
2. Update webhook endpoint to your new Render URL:
```
https://nightfury-hosting-api.onrender.com/api/payments/webhook
```

#### 5.6 Create Frontend Service

1. Create another Web Service for frontend
2. Point to same repository
3. Configure:
   - **Name**: `nightfury-hosting-web`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Start Command**: `cd frontend && npm start`
   - **Environment**: Add `REACT_APP_API_URL=https://nightfury-hosting-api.onrender.com/api`

### Option B: Using render.yaml (Advanced)

1. Ensure `render.yaml` is in repository root
2. Go to https://dashboard.render.com
3. Click "Infrastructure as Code"
4. Choose your repository and branch
5. Review and deploy

---

## Step 6: Set Up Custom Domain (Optional)

1. Go to your Render service settings
2. Scroll to "Custom Domain"
3. Add your domain (e.g., `nightfury.yourdomain.com`)
4. Follow DNS instructions from your domain registrar
5. Wait 24 hours for DNS propagation

---

## Step 7: Post-Deployment Configuration

### 7.1 Create Admin User

```bash
# SSH into your Render service or use MongoDB Atlas
# Run this in your Node.js environment:

const User = require('./models/User');

await User.create({
  username: 'admin',
  email: 'admin@nightfuryhost.com',
  password: 'change_this_password',
  isAdmin: true,
  coins: 10000
});
```

### 7.2 Test API
```bash
curl https://nightfury-hosting-api.onrender.com/health
# Should return: {"status":"Server is running"}
```

### 7.3 Access Dashboard
Open: `https://nightfury-hosting-web.onrender.com`

---

## Troubleshooting

### Issue: "Build failed"
- Check Node version in package.json
- Verify all dependencies in package.json are correct
- View build logs in Render dashboard

### Issue: "Cannot connect to MongoDB"
- Verify MONGODB_URI in Render env vars
- Check MongoDB Atlas IP whitelist includes Render IPs
- Test connection string locally first

### Issue: "Stripe not working"
- Verify STRIPE_SECRET_KEY is from correct environment (test/live)
- Check webhook endpoint URL is correct
- View webhook logs in Stripe dashboard

### Issue: "Static site not building"
- Ensure frontend has `npm run build` command
- Check for build errors in logs
- Verify `build` directory exists after build

---

## Production Checklist

- [ ] MongoDB Atlas backup enabled
- [ ] Stripe webhook configured
- [ ] Email SMTP tested
- [ ] JWT_SECRET is strong and unique
- [ ] All environment variables are set
- [ ] Domain name configured
- [ ] SSL certificate active
- [ ] Database backups scheduled
- [ ] Monitoring and alerts enabled
- [ ] Error logging configured
- [ ] Rate limiting tested
- [ ] Admin account created and password changed

---

## Performance Optimization

1. **Enable Gzip Compression** - Already in production Node.js
2. **Use CDN for Assets** - Configure Cloudinary for images
3. **Database Indexing** - Already configured in models
4. **Connection Pooling** - Configured in MongoDB Atlas
5. **Caching Headers** - Implement in middleware

---

## Monitoring & Maintenance

### Monitor Render Dashboards
- CPU and Memory usage
- Network traffic
- Error rates
- Build success rate

### Monitor MongoDB
- Database size
- Query performance
- Backup status

### Monitor Stripe
- Payment success rate
- Failed transactions
- Webhook health

---

## Scaling (When Needed)

1. Upgrade Render plan from "Starter" to "Standard"
2. Enable horizontal scaling
3. Use MongoDB Atlas M1+ tier
4. Implement Redis caching
5. Set up load balancer

---

## Support & Resources

- Render Documentation: https://render.com/docs
- MongoDB Documentation: https://docs.mongodb.com
- Stripe Documentation: https://stripe.com/docs
- Express.js: https://expressjs.com
- React: https://react.dev

---

## 🎉 You're Live!

Congratulations! Your NightFury Hosting Platform is now live.

**Share your deployment link:**
- Backend API: `https://nightfury-hosting-api.onrender.com`
- Frontend: `https://nightfury-hosting-web.onrender.com`

---

**Need help?** Check the README.md or create an issue on GitHub.
