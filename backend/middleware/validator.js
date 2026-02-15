const { body, param, query } = require('express-validator');

const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 12 }).withMessage('Password must be at least 12 characters')
        .matches(/[A-Z]/).withMessage('Password must contain uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain a number')
        .matches(/[!@#$%^&*]/).withMessage('Password must contain special character (!@#$%^&*)'),
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('mobile').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid mobile number'),
    body('user_type').isIn(['farmer', 'buyer']).withMessage('User type must be farmer or buyer'),
    // Farmer fields
    body('farm_address').if(body('user_type').equals('farmer')).notEmpty().withMessage('Farm address required'),
    body('city').if(body('user_type').equals('farmer')).notEmpty().withMessage('City required'),
    body('state').if(body('user_type').equals('farmer')).notEmpty().withMessage('State required'),
    body('pincode').if(body('user_type').equals('farmer')).matches(/^\d{6}$/).withMessage('Invalid pincode'),
    body('farm_size').if(body('user_type').equals('farmer')).isFloat({ min: 0.1 }).withMessage('Farm size must be positive'),
    // Buyer fields
    body('business_name').if(body('user_type').equals('buyer')).notEmpty().withMessage('Business name required'),
    body('business_type').if(body('user_type').equals('buyer')).notEmpty().withMessage('Business type required'),
    body('gst_number').optional({ checkFalsy: true }).matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).withMessage('Invalid GST number format'),
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
];

const productValidation = [
    body('name').trim().isLength({ min: 5, max: 200 }).withMessage('Name must be 5-200 characters'),
    body('description').trim().isLength({ min: 20, max: 1000 }).withMessage('Description must be 20-1000 characters'),
    body('category_id').isInt({ min: 1 }).withMessage('Valid category required'),
    body('quantity_kg').isFloat({ min: 1 }).withMessage('Quantity must be positive'),
    body('selling_mode').isIn(['fixed_price', 'bidding']).withMessage('Invalid selling mode'),
    body('fixed_price').if(body('selling_mode').equals('fixed_price')).isFloat({ min: 0.01 }).withMessage('Fixed price required'),
    body('base_price').if(body('selling_mode').equals('bidding')).isFloat({ min: 0.01 }).withMessage('Base price required'),
    body('quality_grade').isIn(['A+', 'A', 'B']).withMessage('Invalid quality grade'),
    body('is_organic').optional().isBoolean().withMessage('is_organic must be boolean'),
];

const bidValidation = [
    body('product_id').isInt({ min: 1 }).withMessage('Valid product required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Bid amount must be positive'),
];

const orderValidation = [
    body('product_id').isInt({ min: 1 }).withMessage('Valid product required'),
    body('quantity_kg').isFloat({ min: 50 }).withMessage('Minimum order quantity is 50kg'),
];

const reviewValidation = [
    body('order_id').isInt({ min: 1 }).withMessage('Valid order required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('review_text').trim().isLength({ min: 10, max: 500 }).withMessage('Review must be 10-500 characters'),
];

const paginationValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
];

module.exports = {
    registerValidation, loginValidation, productValidation,
    bidValidation, orderValidation, reviewValidation, paginationValidation
};
