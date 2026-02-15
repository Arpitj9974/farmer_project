require('dotenv').config();

// ─── Validate JWT secret at startup ───
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_key_change_in_production') {
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ FATAL: JWT_SECRET is not set or using default value in production!');
        process.exit(1);
    } else {
        console.warn('⚠️  JWT_SECRET is using default value. Change it before deploying to production.');
    }
}

module.exports = {
    secret: process.env.JWT_SECRET || 'dev_fallback_secret_do_not_use_in_production',
    expiresIn: process.env.JWT_EXPIRE || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
};
