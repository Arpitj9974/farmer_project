# 🛡️ FarmerConnect — Security Architecture

## Production-grade security design for public deployment in India

---

## 🏗️ Architecture: How Your Secrets Are Protected

```
┌─────────────────────────────────────────────────────────────────┐
│                      PUBLIC INTERNET                            │
│                   (Users, Attackers, Bots)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FRONTEND (Vercel CDN)                          │
│              https://your-app.vercel.app                       │
│                                                                 │
│  ✅ Contains: React UI, static assets                          │
│  ❌ Does NOT contain: Any API keys, secrets, or tokens         │
│                                                                 │
│  Only calls:  /api/prices/apmc                                 │
│               /api/prices/msp                                  │
│               /api/ai/chat                                     │
│               /api/auth/login                                  │
│               /api/products                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS (encrypted)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (Render Web Service)                   │
│              https://farmer-api.onrender.com                   │
│                                                                 │
│  🔒 SECURITY LAYERS (in order of execution):                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 1. Helmet.js — HTTP security headers                     │  │
│  │    • X-Content-Type-Options: nosniff                     │  │
│  │    • X-Frame-Options: DENY                               │  │
│  │    • Strict-Transport-Security (HSTS)                    │  │
│  │    • Content-Security-Policy                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 2. CORS — Only YOUR frontend domain allowed              │  │
│  │    • Production: ONLY process.env.FRONTEND_URL           │  │
│  │    • Development: localhost:3000-3007 also allowed        │  │
│  │    • All other origins → BLOCKED + logged                │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 3. Rate Limiting — Per-route throttling                  │  │
│  │    • General API: 500 req/15min per IP                   │  │
│  │    • AI (Gemini): 20 req/hour per IP ⚡ STRICT           │  │
│  │    • Market Data: 60 req/15min per IP                    │  │
│  │    • Login: 10 req/min per IP+email                      │  │
│  │    • Registration: 5 req/hour per IP                     │  │
│  │    • Bidding: 30 req/min per IP                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 4. JWT Authentication — Token-based access control       │  │
│  │    • Protected routes require valid Bearer token         │  │
│  │    • Token expires in 7 days                             │  │
│  │    • AI + Admin routes require authentication            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  🔑 SECRETS (stored in Render Environment Variables):           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ GEMINI_API_KEY    → Used by aiController, priceController│  │
│  │ DATA_GOV_KEY      → Used by priceController (APMC proxy) │  │
│  │ JWT_SECRET        → Used by auth middleware              │  │
│  │ DB_PASSWORD       → Used by database config              │  │
│  │ DB_HOST/DB_NAME   → Used by database config              │  │
│  └───────────────────────────────────────────────────────────┘  │
│  These NEVER leave the server. NEVER sent to frontend.         │
│                                                                 │
│  📡 OUTBOUND API CALLS (server-to-server, keys hidden):       │
│  ├── Gemini AI API ──→ via GEMINI_API_KEY                      │
│  ├── Data.gov.in   ──→ via DATA_GOV_KEY                        │
│  └── PostgreSQL DB ──→ via DB_PASSWORD                         │
└────────────────────────┬────────────────────────────────────────┘
                         │ Internal network (encrypted)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE (Render PostgreSQL)                    │
│              Internal connection only                           │
│                                                                 │
│  ✅ Not exposed to public internet                             │
│  ✅ Only Render's internal network can connect                 │
│  ✅ Passwords managed via environment variables                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚨 Why Frontend Must NEVER Call External APIs Directly

### ❌ WRONG: Frontend calls APMC API
```javascript
// DANGEROUS — DO NOT DO THIS!
fetch("https://api.data.gov.in/resource/xxx?api-key=YOUR_SECRET_KEY")
```

**What happens:**
1. User opens Chrome DevTools → Network tab
2. They copy your API key from the request URL
3. They write a script: `while(true) { fetch(url) }` — burns your quota
4. You get billed or IP-blocked by the provider
5. Your app stops working for ALL users

### ✅ CORRECT: Frontend calls YOUR backend
```javascript
// SAFE — Frontend code
const res = await api.get('/prices/apmc?state=Gujarat&commodity=Wheat');
```

```javascript
// Backend code (user NEVER sees this)
const API_KEY = process.env.DATA_GOV_KEY; // Hidden!
const response = await axios.get(`https://api.data.gov.in/...?api-key=${API_KEY}`);
res.json(response.data);
```

**Your project already does this correctly.** ✅

---

## 📊 Rate Limiting Configuration

| Endpoint | Limit | Window | Why |
|---|---|---|---|
| `/api/*` (general) | 500 requests | 15 minutes | Prevents DDoS |
| `/api/ai/chat` | 20 requests | 1 hour | **Gemini API costs money** |
| `/api/prices/search` | 20 requests | 1 hour | **Also calls Gemini** |
| `/api/prices/apmc` | 60 requests | 15 minutes | Protects Data.gov.in quota |
| `/api/auth/login` | 10 attempts | 1 minute | Brute-force protection |
| `/api/auth/register` | 5 accounts | 1 hour | Mass signup prevention |
| `/api/bids` | 30 bids | 1 minute | Bid flooding prevention |

---

## 🔄 Emergency Key Rotation Procedures

### If GEMINI_API_KEY is leaked:
1. Go to: https://makersuite.google.com/app/apikey
2. **Delete** the compromised key immediately
3. Click **Create API Key** → copy new key
4. Go to Render Dashboard → your backend service → **Environment**
5. Update `GEMINI_API_KEY` with new value
6. Service auto-restarts with new key
7. Check Google Cloud Console for unauthorized usage

### If DATA_GOV_KEY is leaked:
1. Go to: https://data.gov.in/user/dashboard
2. Regenerate your API key
3. Update `DATA_GOV_KEY` in Render Environment
4. Service auto-restarts

### If JWT_SECRET is leaked:
1. Generate new secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
2. Update `JWT_SECRET` in Render Environment
3. **⚠️ WARNING:** This will invalidate ALL existing user sessions
4. All users will need to log in again

### If DB_PASSWORD is leaked:
1. Go to Render Dashboard → your PostgreSQL database
2. Click **Settings** → **Change Password**
3. Copy new password
4. Update `DB_PASSWORD` in Render backend Environment
5. Service auto-restarts with new credentials

---

## ✅ Production Security Checklist

- [x] No API keys in frontend code
- [x] No API keys in GitHub repository
- [x] All secrets in Render Environment Variables
- [x] Backend proxy for ALL external APIs
- [x] Rate limiting on ALL sensitive endpoints
- [x] CORS restricted to production frontend domain only
- [x] AI calls require authentication (JWT)
- [x] AI calls rate-limited (20/hour)
- [x] Market data calls rate-limited (60/15min)
- [x] Login brute-force protection (10/min)
- [x] Helmet.js security headers active
- [x] Error messages don't expose stack traces in production
- [x] Database not directly accessible from internet
- [x] `.env` files in `.gitignore`
- [x] `.env.example` files committed (without real values)

---

## 🔐 Additional Recommendations for Future

1. **Add Cloudflare** (free tier) in front of your domain for DDoS protection
2. **Enable Google Cloud billing alerts** to catch Gemini API abuse early
3. **Add request logging to a service** like LogDNA or Papertrail
4. **Enable 2FA** on your GitHub, Google Cloud, and Render accounts
5. **Use Cloudinary/S3** for image uploads instead of server filesystem
