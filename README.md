# 🌾 FarmerConnect

A comprehensive marketplace connecting farmers directly with buyers, featuring AI-powered pricing insights, secure bidding, and verified product listings.

## 🚀 Features

- **Direct Farmer-to-Buyer Sales**: Eliminated middlemen.
- **AI-Powered Insights**: Uses Gemini AI to validate product images and suggest optimal pricing.
- **Smart Bidding System**: Real-time bidding for bulk produce.
- **Secure Authentication**: Role-based access for Farmers, Buyers, and Admins.
- **Interactive Dashboard**: Track sales, orders, and market trends.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Bootstrap 5, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **AI Integration**: Google Gemini API
- **Authentication**: JWT (JSON Web Tokens)

## 📂 Project Structure

```bash
farmer-connect/
├── backend/         # Node.js API server
│   ├── config/      # Database configuration
│   ├── controllers/ # Request handlers
│   ├── models/      # Database models
│   ├── routes/      # API endpoints
│   ├── services/    # Business logic & AI integration
│   └── scripts/     # Utility scripts (e.g., seeding)
│
└── frontend/        # React client application
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Application pages
    │   └── services/   # API client (Axios)
    └── public/         # Static assets
```

## ⚡ Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL (v12+)
- Google Gemini API Key

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your DB credentials and API keys

# Run database migrations/seeds (if applicable)
npm run seed

# Start server
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start client
npm start
```

## 🔒 Security Note

This repository does **not** contain sensitive API keys or database passwords. 
Please refer to `.env.example` files to configure your local environment safely.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.
