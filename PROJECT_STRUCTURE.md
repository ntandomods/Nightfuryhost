# Project Structure

```
NightFuryHost/
├── frontend/                          # React Frontend
│   ├── public/
│   │   ├── index.html                # Main HTML
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Button.jsx
│   │   │   └── ...
│   │   ├── pages/                    # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── HostsPage.jsx
│   │   │   ├── CoinsPage.jsx
│   │   │   └── ...
│   │   ├── layouts/                  # Layout components
│   │   │   ├── MainLayout.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── store/                    # Zustand stores
│   │   │   ├── authStore.js
│   │   │   ├── hostStore.js
│   │   │   └── coinStore.js
│   │   ├── hooks/                    # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useHosts.js
│   │   │   └── useCoins.js
│   │   ├── services/                 # API services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── ...
│   │   ├── styles/                   # Global styles
│   │   │   ├── index.css
│   │   │   └── tailwind.css
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── config.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
│
├── config/
│   ├── database.js                   # MongoDB connection
│   └── stripe.js                     # Stripe configuration
│
├── models/                           # Mongoose models
│   ├── User.js
│   ├── Host.js
│   ├── CoinTransaction.js
│   └── Subscription.js
│
├── controllers/                      # Route controllers
│   ├── authController.js
│   ├── hostController.js
│   ├── coinController.js
│   ├── userController.js
│   └── dashboardController.js
│
├── routes/                           # API routes
│   ├── auth.js
│   ├── hosts.js
│   ├── coins.js
│   ├── users.js
│   ├── dashboard.js
│   ├── bots.js
│   ├── payments.js
│   └── analytics.js
│
├── middleware/
│   ├── auth.js                       # JWT authentication
│   ├── errorHandler.js               # Error handling
│   ├── validation.js                 # Input validation
│   └── rateLimiter.js                # Rate limiting
│
├── services/                         # Business logic
│   ├── hostService.js                # Host operations
│   ├── coinService.js                # Coin transactions
│   ├── renderService.js              # Render.com integration
│   └── emailService.js               # Email notifications
│
├── utils/                            # Utility functions
│   ├── validators.js
│   ├── helpers.js
│   ├── constants.js
│   └── logger.js
│
├── public/                           # Static files
│   ├── images/
│   └── docs/
│
├── server.js                         # Main entry point
├── package.json                      # Dependencies
├── .env.example                      # Environment template
├── .gitignore
├── Dockerfile                        # Docker configuration
├── docker-compose.yml                # Docker Compose
├── render.yaml                       # Render deployment config
├── README.md                         # Project documentation
├── DEPLOYMENT_GUIDE.md               # Deployment instructions
└── PROJECT_STRUCTURE.md              # This file
```

## Key Files Explained

### Backend Files

- **server.js** - Express server setup, Socket.io configuration, route mounting
- **config/database.js** - MongoDB connection and configuration
- **models/** - Database schemas and business logic
- **controllers/** - Request handlers for all routes
- **routes/** - API endpoint definitions
- **middleware/** - Authentication, validation, error handling

### Frontend Files

- **App.jsx** - Main React component with routing
- **store/** - Global state management with Zustand
- **pages/** - Full-page components for each route
- **components/** - Reusable UI components
- **services/** - API communication layer

### Configuration Files

- **.env** - Environment variables (create from .env.example)
- **Dockerfile** - Container image definition
- **docker-compose.yml** - Multi-container orchestration
- **render.yaml** - Render.com infrastructure configuration
- **package.json** - Node.js dependencies and scripts

## Development Flow

1. Create feature branch from `main`
2. Implement changes in `controllers/`, `routes/`, and `models/`
3. Create React components in `frontend/src/`
4. Test locally with `npm run dev`
5. Push to GitHub
6. Deploy to Render.com

## Database Schema

### User
- _id, username, email, password, coins, tier, subscriptionStatus, isAdmin, createdAt

### Host  
- _id, userId, botName, status, hostProvider, stats, config, deploymentUrl, createdAt

### CoinTransaction
- _id, userId, type, amount, description, status, createdAt

### Subscription
- _id, userId, tier, price, billingCycle, status, features, renewalDate, createdAt

## API Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "error": null
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Authentication

- Register → Get JWT token → Store in localStorage
- Include token in Authorization header: `Bearer <token>`
- Token expires in 7 days
- Refresh token can be implemented for longer sessions

## Deployment Paths

### Local Development
```bash
npm run dev          # Backend
cd frontend && npm start  # Frontend
```

### Docker Local
```bash
docker-compose up    # All services including MongoDB
```

### Production (Render)
```bash
1. Push to GitHub
2. Connect repository to Render
3. Set environment variables
4. Deploy!
```

## Available Scripts

### Backend
- `npm start` - Production server
- `npm run dev` - Development with nodemon
- `npm test` - Run tests
- `npm run build` - Build Docker image

### Frontend
- `npm start` - Development server (port 3000)
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run eject` - Expose configuration

## Best Practices

1. **Authentication** - Always validate JWT tokens
2. **Database** - Use indexes on frequently queried fields
3. **API** - Return consistent response format
4. **Frontend** - Use Zustand for global state
5. **Environment** - Never commit .env files
6. **Errors** - Log errors for debugging
7. **Security** - Validate user input
8. **Performance** - Cache data appropriately

## Troubleshooting

See DEPLOYMENT_GUIDE.md for common issues and solutions.
