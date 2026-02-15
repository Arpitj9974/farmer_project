const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/database');
const jwtConfig = require('../config/jwt');

// ─── Structured logger (never logs passwords) ───
const authLog = (action, data) => {
    const timestamp = new Date().toISOString();
    const safeData = { ...data };
    delete safeData.password;
    delete safeData.password_hash;
    delete safeData.newPassword;
    delete safeData.currentPassword;
    console.log(JSON.stringify({ timestamp, module: 'AUTH', action, ...safeData }));
};

// ═══════════════════════════════════════════════════
// REGISTER - Production-grade registration
// ═══════════════════════════════════════════════════
exports.register = async (req, res) => {
    const requestId = `REG_${Date.now()}`;
    try {
        // 1. Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            authLog('REGISTER_VALIDATION_FAILED', { requestId, errors: errors.array().map(e => e.msg) });
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password, user_type, name, mobile,
            farm_address, city, state, pincode, farm_size,
            business_name, business_type, gst_number, business_address } = req.body;

        // 2. Check if user already exists
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            authLog('REGISTER_DUPLICATE_EMAIL', { requestId, email });
            return res.status(409).json({
                success: false,
                message: 'This email is already registered. Please login instead.'
            });
        }

        // 3. Hash password with proper salt rounds
        const SALT_ROUNDS = 12;
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        // 4. Transaction for atomicity
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const userResult = await client.query(
                `INSERT INTO users (email, password_hash, user_type, name, mobile, verification_status)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, user_type, name`,
                [email, password_hash, user_type, name, mobile, user_type === 'admin' ? 'approved' : 'pending']
            );
            const user = userResult.rows[0];

            if (user_type === 'farmer') {
                await client.query(
                    `INSERT INTO farmers (user_id, farm_address, city, state, pincode, farm_size)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [user.id, farm_address, city, state, pincode, farm_size]
                );
            } else if (user_type === 'buyer') {
                await client.query(
                    `INSERT INTO buyers (user_id, business_name, business_type, gst_number, business_address)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [user.id, business_name, business_type, gst_number || null, business_address]
                );
            }

            await client.query('COMMIT');

            // 5. Generate JWT
            const token = jwt.sign(
                { userId: user.id, userType: user.user_type },
                jwtConfig.secret,
                { expiresIn: jwtConfig.expiresIn }
            );

            authLog('REGISTER_SUCCESS', { requestId, userId: user.id, email, userType: user_type });

            res.status(201).json({
                success: true,
                message: 'Registration successful. Your account is pending verification.',
                user: { id: user.id, email: user.email, user_type: user.user_type, name: user.name },
                token
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        authLog('REGISTER_ERROR', { requestId, error: error.message, code: error.code });

        // Handle specific DB errors
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'This email is already registered.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Registration failed due to a server error. Please try again.',
            ...(process.env.NODE_ENV === 'development' && { debug: error.message })
        });
    }
};

// ═══════════════════════════════════════════════════
// LOGIN - Production-grade login
// ═══════════════════════════════════════════════════
exports.login = async (req, res) => {
    const requestId = `LOGIN_${Date.now()}`;
    try {
        // 1. Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            authLog('LOGIN_VALIDATION_FAILED', { requestId, errors: errors.array().map(e => e.msg) });
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email and password.',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // 2. Find user by email (parameterized query = SQL injection safe)
        const result = await pool.query(
            `SELECT id, email, password_hash, user_type, name, is_verified, verification_status
             FROM users WHERE email = $1`,
            [email]
        );

        // 3. User not found — use constant-time comparison to prevent timing attacks
        if (result.rows.length === 0) {
            // Run a dummy bcrypt compare to prevent timing-based user enumeration
            await bcrypt.compare(password, '$2a$12$dummyhashfortimingatttackprevention00000000');
            authLog('LOGIN_USER_NOT_FOUND', { requestId, email });
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = result.rows[0];

        // 4. Verify password using bcrypt.compare (NEVER compare raw strings)
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            authLog('LOGIN_WRONG_PASSWORD', { requestId, email, userId: user.id });
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // 5. Update last login timestamp (non-blocking, don't fail login if this errors)
        pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id])
            .catch(err => authLog('LOGIN_UPDATE_LASTLOGIN_FAILED', { requestId, userId: user.id, error: err.message }));

        // 6. Generate JWT with proper payload
        const token = jwt.sign(
            { userId: user.id, userType: user.user_type },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        authLog('LOGIN_SUCCESS', { requestId, email, userId: user.id, userType: user.user_type });

        // 7. Return clean response
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                user_type: user.user_type,
                name: user.name,
                is_verified: user.is_verified,
                verification_status: user.verification_status
            },
            token
        });
    } catch (error) {
        authLog('LOGIN_SERVER_ERROR', { requestId, error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            message: 'Login failed due to a server error. Please try again.',
            ...(process.env.NODE_ENV === 'development' && { debug: error.message })
        });
    }
};

// ═══════════════════════════════════════════════════
// GET PROFILE
// ═══════════════════════════════════════════════════
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        let profile;

        if (req.user.user_type === 'farmer') {
            const result = await pool.query(
                `SELECT u.id, u.email, u.user_type, u.name, u.mobile, u.avatar_url,
                        u.is_verified, u.verification_status, u.last_login, u.created_at,
                        f.farm_address, f.city, f.state, f.pincode, f.farm_size,
                        f.overall_rating, f.total_orders, f.bank_name, f.account_number, f.ifsc_code
                 FROM users u JOIN farmers f ON u.id = f.user_id WHERE u.id = $1`,
                [userId]
            );
            profile = result.rows[0];
        } else if (req.user.user_type === 'buyer') {
            const result = await pool.query(
                `SELECT u.id, u.email, u.user_type, u.name, u.mobile, u.avatar_url,
                        u.is_verified, u.verification_status, u.last_login, u.created_at,
                        b.business_name, b.business_type, b.gst_number, b.gst_verified,
                        b.business_address, b.total_purchases
                 FROM users u JOIN buyers b ON u.id = b.user_id WHERE u.id = $1`,
                [userId]
            );
            profile = result.rows[0];
        } else {
            const result = await pool.query(
                'SELECT id, email, user_type, name, mobile, avatar_url, is_verified, verification_status, last_login, created_at FROM users WHERE id = $1',
                [userId]
            );
            profile = result.rows[0];
        }

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        // Never send password_hash to frontend
        delete profile.password_hash;

        res.json({ success: true, profile });
    } catch (error) {
        console.error('Get profile error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
};

// ═══════════════════════════════════════════════════
// UPDATE PROFILE
// ═══════════════════════════════════════════════════
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, mobile, farm_address, city, state, pincode, farm_size,
            business_name, business_type, business_address, bank_name, account_number, ifsc_code } = req.body;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                'UPDATE users SET name = COALESCE($1, name), mobile = COALESCE($2, mobile) WHERE id = $3',
                [name, mobile, userId]
            );

            if (req.user.user_type === 'farmer') {
                await client.query(
                    `UPDATE farmers SET 
                     farm_address = COALESCE($1, farm_address), city = COALESCE($2, city),
                     state = COALESCE($3, state), pincode = COALESCE($4, pincode),
                     farm_size = COALESCE($5, farm_size), bank_name = COALESCE($6, bank_name),
                     account_number = COALESCE($7, account_number), ifsc_code = COALESCE($8, ifsc_code)
                     WHERE user_id = $9`,
                    [farm_address, city, state, pincode, farm_size, bank_name, account_number, ifsc_code, userId]
                );
            } else if (req.user.user_type === 'buyer') {
                await client.query(
                    `UPDATE buyers SET 
                     business_name = COALESCE($1, business_name), business_type = COALESCE($2, business_type),
                     business_address = COALESCE($3, business_address)
                     WHERE user_id = $4`,
                    [business_name, business_type, business_address, userId]
                );
            }

            await client.query('COMMIT');
            authLog('PROFILE_UPDATED', { userId });
            res.json({ success: true, message: 'Profile updated successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Update profile error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};

// ═══════════════════════════════════════════════════
// CHANGE PASSWORD
// ═══════════════════════════════════════════════════
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Both current and new passwords are required.' });
        }

        if (newPassword.length < 12) {
            return res.status(400).json({ success: false, message: 'New password must be at least 12 characters.' });
        }

        const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
        if (!isMatch) {
            authLog('PASSWORD_CHANGE_WRONG_CURRENT', { userId: req.user.id });
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        const SALT_ROUNDS = 12;
        const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, req.user.id]);

        authLog('PASSWORD_CHANGED', { userId: req.user.id });
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
};

// ═══════════════════════════════════════════════════
// UPLOAD AVATAR
// ═══════════════════════════════════════════════════
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, req.user.id]);

        res.json({ success: true, message: 'Avatar uploaded successfully', avatar_url: avatarUrl });
    } catch (error) {
        console.error('Upload avatar error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to upload avatar' });
    }
};
