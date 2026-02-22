const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const pool = require('../config/database');

const auth = async (req, res, next) => {
    try {
        // 1. Extract token
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.replace('Bearer ', '');

        // 2. Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, jwtConfig.secret);
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please login again.',
                    code: 'TOKEN_EXPIRED'
                });
            }
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token.',
                    code: 'TOKEN_INVALID'
                });
            }
            throw jwtError;
        }

        // 3. Fetch user from DB
        const result = await pool.query(
            'SELECT id, email, user_type, name, is_verified, verification_status, bio, avatar_url, mobile FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User account no longer exists.',
                code: 'USER_NOT_FOUND'
            });
        }

        // 4. Attach user to request
        req.user = result.rows[0];
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Authentication service error. Please try again.'
        });
    }
};

module.exports = auth;
