# 🔥 NightFury Hosting Platform

A professional, feature-rich hosting platform for NightFuryBot with multi-host management, advanced coin system, and Render.com integration.

## ✨ Features

### Core Features
- **Multi-Host Management** - Manage unlimited bot instances simultaneously
- **Advanced Coin System** - In-app currency for payments and subscriptions
- **Real-time Monitoring** - Live bot status, uptime, and performance metrics
- **Render Deployment** - One-click deployment to Render.com
- **Stripe Integration** - Secure payment processing
- **Socket.io Real-time Updates** - Live notifications and status updates

### Admin Features
- User management and account suspension
- Bonus coin distribution
- Transaction monitoring
- Host resource allocation
- Analytics dashboard

### User Features
- Personal dashboard with quick stats
- Create and manage multiple bot instances
- Coin purchase packages (5 tiers)
- Comprehensive analytics and reporting
- Host backup and restore
- Custom bot configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Stripe account
- Render.com account
- GitHub account

### Backend Setup

```bash
# Clone repository
git clone https://github.com/yourusername/NightFuryHost.git
cd NightFuryHost

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
# Edit .env with your credentials
nano .env

# Start development server
npm run dev

# Or start production server
npm start
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start development server
npm start
```

## 📋 Environment Variables

Create `.env` file with the following:

```env
# Server
PORT=5000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/nightfury

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Render
RENDER_API_KEY=your_render_api_key

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Admin
ADMIN_EMAIL=admin@nightfuryhost.com
ADMIN_PASSWORD=secure_password
```

## 🐳 Docker Deployment

### Build and Run Locally

```bash
# Build image
docker build -t nightfury-hosting .

# Run container
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://... \
  -e JWT_SECRET=your_secret \
  -e STRIPE_SECRET_KEY=sk_... \
  nightfury-hosting
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🎯 Render.com Deployment

### Create a Web Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Set all variables from `.env`
5. Deploy!

### Or Use Blueprint

```yaml
services:
  - type: web
    name: nightfury-hosting
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: MONGODB_URI
        value: your_mongodb_uri
      - key: JWT_SECRET
        value: your_secret_key
      - key: NODE_ENV
        value: production
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Hosts
- `GET /api/hosts` - List all user hosts
- `POST /api/hosts` - Create new host
- `GET /api/hosts/:id` - Get host details
- `PUT /api/hosts/:id` - Update host
- `DELETE /api/hosts/:id` - Delete host
- `POST /api/hosts/:id/start` - Start host
- `POST /api/hosts/:id/stop` - Stop host
- `GET /api/hosts/:id/stats` - Get host stats

### Coins
- `GET /api/coins/packages` - Get coin packages
- `GET /api/coins/user/balance` - Get user balance
- `GET /api/coins/history` - Get transaction history
- `POST /api/coins/purchase` - Purchase coins
- `POST /api/coins/confirm-purchase` - Confirm payment
- `GET /api/coins/stats` - Get coin stats

### Dashboard
- `GET /api/dashboard` - Get dashboard summary
- `GET /api/dashboard/summary` - Get detailed summary

### Analytics
- `GET /api/analytics/overview` - Get overview
- `GET /api/analytics/host/:id` - Get host analytics

## 💰 Coin System

### Coin Packages
- **Starter**: 100 coins = $4.99
- **Basic**: 500 coins = $19.99
- **Standard**: 1,000 coins = $34.99
- **Premium**: 2,500 coins = $79.99 (10% bonus)
- **Ultimate**: 5,000 coins = $139.99 (20% bonus)

### Coin Usage
- **Host Deployment**: 50 coins (initial)
- **Monthly Hosting**: 50-200 coins (depending on tier)
- **Premium Features**: Variable pricing

## 🎨 UI Components

### Dashboard
- Real-time stats cards
- Host status overview
- Recent transactions
- Quick action buttons

### Host Management
- Create new bot instances
- Configure bot settings
- Monitor real-time performance
- View logs and backups

### Coin Shop
- Browse packages
- Secure checkout
- Transaction history
- Usage analytics

## 🔐 Security

- JWT authentication
- Password hashing (bcryptjs)
- Rate limiting
- CORS protection
- Helmet.js headers
- Input validation
- SQL injection prevention

## 📱 Real-time Features

- Live host status updates
- WebSocket notifications
- Coin balance updates
- System alerts
- Performance metrics

## 📈 Monitoring & Analytics

- Message processing count
- Command usage tracking
- Bot uptime percentage
- Group membership tracking
- Error rate monitoring
- Custom date range reports

## 🛠️ Tech Stack

### Backend
- Node.js & Express
- MongoDB & Mongoose
- Stripe API
- Socket.io
- JWT Authentication
- Render Integration

### Frontend
- React 18
- Tailwind CSS
- Framer Motion
- Recharts
- Zustand (State Management)
- React Router v6
- Axios

## 📝 License

MIT License - Feel free to use this project for commercial or personal use.

## 🤝 Contributing

Contributions welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

- GitHub Issues: [Report bugs](https://github.com/yourusername/NightFuryHost/issues)
- Email: support@nightfuryhost.com
- Documentation: [Full docs](https://docs.nightfuryhost.com)

## 🚀 Roadmap

- [ ] Advanced scheduling system
- [ ] Custom bot templates
- [ ] Multi-language support
- [ ] Advanced reporting (PDF export)
- [ ] API rate limiting dashboard
- [ ] Webhook management
- [ ] Team collaboration features
- [ ] White-label solution

---

**Built with ❤️ for the NightFury Community**
