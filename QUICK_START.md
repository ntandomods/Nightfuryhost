# 🚀 Quick Start Guide

Get NightFury Hosting Platform running in 5 minutes!

## Local Development (5 minutes)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/NightFuryHost.git
cd NightFuryHost
npm install
cd frontend && npm install && cd ..
```

### 2. Create .env

```bash
cp .env.example .env
```

Edit `.env` with minimal config:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=dev_secret_key_12345
MONGODB_URI=mongodb://localhost:27017/nightfury
```

### 3. Run with Docker (Easiest)

```bash
docker-compose up
```

This starts:
- Backend API (port 5000)
- Frontend (port 3000)
- MongoDB (port 27017)

### 4. Access the Platform

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

### 5. Create Test Account

1. Click "Register"
2. Create account with:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123!`
3. Login

---

## Deploy to Render (10 minutes)

### 1. Prepare

```bash
# Add all files to git
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Create Services on Render

**Backend Service:**
- Go to https://dashboard.render.com
- New → Web Service
- Connect GitHub repo
- Build: `npm install`
- Start: `npm start`
- Add environment variables from `.env`

**Frontend Service:**
- New → Static Site
- Connect same GitHub repo
- Build: `cd frontend && npm install && npm run build`
- Publish: `frontend/build`

### 3. Set Environment Variables

Backend needs:
```
JWT_SECRET=your_secret
MONGODB_URI=your_mongodb_url
```

Frontend needs:
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

---

## Features to Try

### 1. Authentication
- Register → Login → Logout
- View profile
- Change password

### 2. Host Management
- Create new host
- View all hosts
- Start/Stop host
- Delete host

### 3. Coin System
- View coin balance
- Browse coin packages
- (Stripe integration for real payments)

### 4. Dashboard
- Real-time stats
- Host overview
- Transaction history

---

## Project Structure (Key Files)

```
NightFuryHost/
├── server.js                # Main API server
├── models/                  # Database models
│   ├── User.js
│   ├── Host.js
│   ├── CoinTransaction.js
│   └── Subscription.js
├── controllers/             # Business logic
├── routes/                  # API endpoints
├── frontend/                # React app
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── store/
│   │   └── App.jsx
│   └── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Common Commands

```bash
# Start development
npm run dev

# Build Docker image
docker build -t nightfury-hosting .

# Run Docker locally
docker run -p 5000:5000 -e MONGODB_URI=... nightfury-hosting

# Start with docker-compose
docker-compose up -d
docker-compose down

# View logs
docker-compose logs -f app

# Frontend development
cd frontend && npm start

# Frontend build
cd frontend && npm run build
```

---

## API Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "confirmPassword": "Test123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Create Host (requires token)
```bash
curl -X POST http://localhost:5000/api/hosts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "botName": "MyBot",
    "hostProvider": "render",
    "whatsappPhoneNumber": "1234567890"
  }'
```

---

## Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Check MongoDB is running
docker-compose ps
# Should show MongoDB container running
```

### "Port 5000 already in use"
```bash
# Change port in .env
PORT=5001
```

### "Build failed on Render"
- Check Node version in package.json
- View build logs in Render dashboard
- Ensure .env variables are set

### "Frontend can't connect to API"
- Check REACT_APP_API_URL env var
- Ensure backend service is running
- Check CORS settings in server.js

---

## Next Steps

1. ✅ Get it running locally
2. ✅ Test authentication
3. ✅ Try creating a host
4. ✅ Deploy to Render
5. ✅ Set up MongoDB Atlas
6. ✅ Configure Stripe (optional)
7. ✅ Add custom domain

---

## Documentation

- Full README: [README.md](README.md)
- Deployment: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Structure: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- API Docs: See route files in `routes/`

---

## Need Help?

- GitHub Issues: [Create Issue](https://github.com/yourusername/NightFuryHost/issues)
- Full Docs: [Documentation Site](https://docs.nightfuryhost.com)
- Email: support@nightfuryhost.com

---

**You're all set! Happy hosting! 🔥**
