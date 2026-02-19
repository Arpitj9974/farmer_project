# 🚀 FarmerConnect Deployment Guide

This guide will walk you through deploying your full-stack application for free using **Render** (Backend & Database) and **Vercel** (Frontend).

---

## 📋 Prerequisites

1.  **GitHub Repository**: Ensure your code is pushed (you already did this!).
2.  **Render Account**: Sign up at [render.com](https://render.com).
3.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
4.  **pgAdmin / DBeaver**: Installed locally to manage your live database.

---

## 1️⃣ Part 1: Deploy Database (PostgreSQL)

We need a live database first so the backend can connect to it.

1.  Log in to **Render Dashboard**.
2.  Click **New +** → **PostgreSQL**.
3.  **Name**: `farmer-db` (or similar).
4.  **Region**: Choose closest to you (e.g., Singapore/Frankfurt).
5.  **Instance Type**: **Free**.
6.  Click **Create Database**.
7.  **Wait** for it to be created.
8.  **Copy the "Internal Database URL"** (saves bandwidth for backend).
9.  **Copy the "External Database URL"** (for your local pgAdmin).

### 📤 Import Your Data
1.  Open **pgAdmin** or **DBeaver** on your computer.
2.  Connect using the **External Database URL**.
3.  Open the **Query Tool** (SQL Editor) on the new database.
4.  Open the file `backend/database/production_seed.sql` from this project.
5.  copy ALL content and paste it into the Query Tool.
6.  **Run** (▶️) the query to create tables and seed data.

---

## 2️⃣ Part 2: Deploy Backend (Node.js)

1.  On Render Dashboard, click **New +** → **Web Service**.
2.  Connect your GitHub repository.
3.  **Name**: `farmer-api`.
4.  **Root Directory**: `backend` (Important!).
5.  **Runtime**: **Node**.
6.  **Build Command**: `npm install`
7.  **Start Command**: `node server.js`
8.  **Instance Type**: **Free**.
9.  **Environment Variables** (Click "Advanced"):
    *   `NODE_ENV`: `production`
    *   `DB_HOST`: (Host from Internal DB URL, e.g., `dpg-xxxx-a`)
    *   `DB_NAME`: (Database name from Render)
    *   `DB_USER`: (User from Render)
    *   `DB_PASSWORD`: (Password from Render)
    *   `GEMINI_API_KEY`: (Your Gemini API Key)
    *   `JWT_SECRET`: (Generate a random string)
    *   `FRONTEND_URL`: (Leave empty for now, update after frontend deploy)

10. Click **Create Web Service**.
11. **Copy the Backend URL** once deployed (e.g., `https://farmer-api.onrender.com`).

---

## 3️⃣ Part 3: Deploy Frontend (React)

1.  Log in to **Vercel Dashboard**.
2.  Click **Add New...** → **Project**.
3.  Import your GitHub repository.
4.  **Framework Preset**: **Create React App** (should auto-detect).
5.  **Root Directory**: Click "Edit" and select `frontend`.
6.  **Environment Variables**:
    *   `REACT_APP_API_URL`: `https://your-backend-url.onrender.com/api` (NO trailing slash after /api)
    *   `REACT_APP_UPLOAD_URL`: `https://your-backend-url.onrender.com/uploads`
7.  Click **Deploy**.

---

## 4️⃣ Part 4: Final Connection

1.  Copy your new **Frontend URL** (e.g., `https://farmer-connect.vercel.app`).
2.  Go back to **Render** (Backend Service) → **Environment**.
3.  Add/Update `FRONTEND_URL` to your Vercel URL.
4.  **Save Changes** (Render will restart).

---

## 🎉 Done!
Your app is now live.

- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-backend.onrender.com
- **Database**: Hosted on Render PostgreSQL

---

### ⚠️ Important Note on Images
Since Render's free tier has an "Ephemeral Filesystem", **newly uploaded images** (profile pics, product photos) will disappear when the server restarts (every ~15 mins of inactivity).
*   **The fixes we made**: All "seed" products use external Unsplash/Pexels URLs, so they **WILL** work perfectly!
*   **Solution for uploads**: For a real production app later, you would use AWS S3 or Cloudinary.
