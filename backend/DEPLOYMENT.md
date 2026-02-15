# FarmerConnect — Deployment Checklist

## Pre-Deployment (MUST DO)

### 1. Environment Variables
- [ ] Set `NODE_ENV=production` on server
- [ ] Set strong `JWT_SECRET` (64+ random chars): `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Set `DATABASE_URL` or individual `DB_*` variables
- [ ] Set `FRONTEND_URL` to actual production domain
- [ ] Set `DB_POOL_MAX=30` (or higher for heavy traffic)
- [ ] Verify `.env` is in `.gitignore`

### 2. Database
- [ ] Run `npm run migrate:status` — ensure no pending migrations
- [ ] Run `npm run migrate` — apply any pending migrations  
- [ ] Run `npm run health` — verify DB connection
- [ ] Enable SSL on PostgreSQL for production
- [ ] Set up daily automated backups (pg_dump or cloud provider backups)
- [ ] Verify DB user has minimal permissions (no DROP/CREATE TABLE in app user)

### 3. Security
- [ ] Change default JWT_SECRET
- [ ] Remove all demo user accounts or reset passwords
- [ ] Verify CORS `FRONTEND_URL` matches actual domain
- [ ] Enable HTTPS on the server
- [ ] Rate limiter is active (login: 10/min, register: 5/hour)

### 4. Monitoring
- [ ] Check `logs/` directory exists and is writable
- [ ] Set up log rotation (Winston handles this, but verify disk space)
- [ ] Monitor `logs/error.log` for unexpected errors
- [ ] Monitor `logs/slow-queries.log` for performance issues
- [ ] Set up uptime monitoring (hit `/api/health` every 60s)

---

## Deployment Commands

```bash
# 1. Install dependencies
npm ci --production

# 2. Check migration status
npm run migrate:status

# 3. Run migrations
npm run migrate

# 4. Start server
npm start

# 5. Verify health
npm run health
```

---

## Migration Workflow (For Schema Changes)

```bash
# 1. Create a new migration
npm run migrate:create add_phone_verification

# 2. Edit the generated files:
#    database/migrations/YYYYMMDD_add_phone_verification.sql     (UP)
#    database/migrations/YYYYMMDD_add_phone_verification.down.sql (DOWN)

# 3. Test locally
npm run migrate

# 4. If something goes wrong, rollback
npm run migrate:down

# 5. Check status
npm run migrate:status

# 6. Commit migration files to git
git add database/migrations/
git commit -m "Add phone verification migration"
```

---

## Startup Validation Flow

When the server starts, it automatically runs:

```
1. ✅ DB Connection Test   — fails fast if DB is unreachable
2. ✅ Run Pending Migrations — auto-applies any new migrations
3. ✅ Schema Verification   — checks all required tables exist  
4. ✅ Start HTTP Server     — only after all checks pass
```

If ANY step fails, the server **refuses to start** with a clear error message.

---

## Folder Structure

```
backend/
├── config/
│   ├── database.js        # PostgreSQL pool + query tracking + schema verification
│   ├── jwt.js             # JWT config with startup validation
│   ├── logger.js          # Winston structured logging
│   └── multer.js          # File upload config
├── controllers/
│   ├── authController.js  # Login/Register/Profile (production-grade)
│   ├── productController.js
│   ├── bidController.js
│   ├── orderController.js
│   └── ...
├── database/
│   ├── schema.sql         # Full schema (for fresh installs)
│   ├── seed.sql           # Demo data
│   ├── migrate.js         # Migration CLI tool
│   └── migrations/        # Versioned SQL migration files
│       ├── 20260215000000_initial_baseline.sql
│       ├── 20260215000000_initial_baseline.down.sql
│       └── ...
├── middleware/
│   ├── auth.js            # JWT verification middleware
│   ├── errorHandler.js    # Centralized error handling (Winston)
│   ├── rateLimiter.js     # Brute-force protection
│   ├── roleCheck.js       # Role-based access control
│   └── validator.js       # Input validation rules
├── routes/
│   ├── auth.js
│   └── ...
├── logs/                   # Winston log files (auto-created)
│   ├── combined.log
│   ├── error.log
│   └── slow-queries.log
├── uploads/                # User-uploaded files
├── .env                    # Local development config
├── .env.production.template # Production config template
├── server.js               # Entry point with startup validation
└── package.json            # Scripts: start, migrate, health
```

---

## Why SQL Problems Occur in Production (And How This Architecture Prevents Them)

| Problem | Root Cause | Our Prevention |
|---------|-----------|----------------|
| **Login failure** | Wrong password hash, wrong API port | Parameterized bcrypt, startup URL logging, env validation |
| **User not found** | Wrong DB connected, case mismatch | Schema verification, email normalization, env safety guard |
| **Schema mismatch** | Manual table edits, missing columns | Migration system with checksums, schema verify at startup |
| **Wrong environment DB** | Dev pointing to prod or vice versa | DB name safety check (blocks `dev` DB in production) |
| **Missing migration** | Manual SQL changes not tracked | Auto-migrate on startup, migration status command |
| **Deployment breakage** | Server starts with broken schema | 4-step startup validation: connect → migrate → verify → listen |
| **Connection drops** | No keepAlive, no retry, pool exhaustion | keepAlive, exponential retry, pool stats monitoring |
| **Silent failures** | console.log only, no file logs | Winston with file rotation, slow query log, error log |
