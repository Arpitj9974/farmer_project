# Agricultural B2B Bulk Trading Platform

A full-stack web application connecting farmers directly with bulk buyers, eliminating middlemen and ensuring fair prices.

## 🌾 Features

### For Farmers
- **Product Listing**: List products with multiple images, quality grades, and organic certification
- **Dual Selling Modes**: Fixed Price for quick sales, Bidding/Auction for premium pricing
- **Price Guidance**: MSP, APMC, and platform average prices to help set competitive rates
- **Order Management**: Track orders through pending → confirmed → preparing → ready → delivered
- **Earnings Dashboard**: View total earnings with 5% commission breakdown

### For Buyers
- **Browse Products**: Filter by category, selling mode, quality, organic certification
- **Place Orders**: Minimum 50kg bulk orders at fixed prices
- **Bidding System**: Place competitive bids on auction products
- **Payment Processing**: Online payment or Cash on Delivery
- **Review System**: Rate farmers after successful deliveries

### For Admin
- **User Verification**: Approve/reject farmer and buyer registrations
- **Product Moderation**: Review and approve new product listings
- **Analytics Dashboard**: Revenue trends, category performance, farmer benefits
- **CSV Export**: Export orders, products, and users data

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT with bcrypt password hashing
- **File Uploads**: Multer for product images
- **PDF Generation**: PDFKit for invoices
- **Scheduling**: node-cron for daily analytics

### Frontend
- **Framework**: React 18
- **UI Library**: Bootstrap 5 + React-Bootstrap
- **Charts**: Chart.js with react-chartjs-2
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Notifications**: React-Toastify

## 📁 Project Structure

```
farmer_project/
├── backend/
│   ├── config/           # Database, JWT, Multer configs
│   ├── controllers/      # Route handlers
│   ├── database/         # Schema and seed SQL
│   ├── middleware/       # Auth, validation, error handling
│   ├── routes/           # API route definitions
│   ├── utils/            # Helpers, PDF generator, price guidance
│   ├── uploads/          # Stored images and invoices
│   ├── server.js         # Express app entry point
│   └── .env              # Environment variables
├── frontend/
│   ├── public/           # Static assets
│   └── src/
│       ├── components/   # React components by role
│       ├── context/      # Auth context
│       ├── services/     # API configuration
│       └── App.jsx       # Main routing
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Database Setup
```bash
# Create database
psql -U postgres
CREATE DATABASE farmer_connect;

# Run schema
psql -U postgres -d farmer_connect -f backend/database/schema.sql

# Run seed data
psql -U postgres -d farmer_connect -f backend/database/seed.sql
```

### Backend Setup
```bash
cd backend
npm install

# Configure .env
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=farmer_connect
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_jwt_secret
# PORT=5000

npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@farmerconnect.com | Password123!@# |
| Farmer | ramesh.patel@email.com | Password123!@# |
| Buyer | orders@freshjuice.com | Password123!@# |

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile

### Products
- `GET /api/products` - List products (public)
- `POST /api/products` - Create product (farmer)
- `GET /api/products/:id` - Get product details
- `GET /api/products/price-guidance/:category_id` - Get pricing guidance

### Bids
- `POST /api/bids` - Place bid (buyer)
- `POST /api/bids/:id/accept` - Accept bid (farmer)
- `GET /api/bids/my-bids` - Get my bids (buyer)

### Orders
- `POST /api/orders` - Create order (buyer)
- `PUT /api/orders/:id/status` - Update status (farmer)
- `POST /api/orders/:id/payment` - Process payment (buyer)
- `GET /api/orders/:id/invoice` - Download invoice

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `PUT /api/admin/verify/:user_id` - Verify user
- `PUT /api/admin/products/:product_id` - Approve/reject product
- `GET /api/analytics/dashboard` - Analytics

## 💰 Business Logic

- **Commission**: 5% platform fee on all transactions
- **Minimum Order**: 50 kg for bulk trading
- **Concurrency**: Bidding uses PostgreSQL transactions with `FOR UPDATE` locks
- **Order Flow**: pending → confirmed → preparing → ready → delivered

## 📝 License

MIT License
