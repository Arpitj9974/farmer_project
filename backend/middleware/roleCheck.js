const roleCheck = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }

        if (!allowedRoles.includes(req.user.user_type)) {
            return res.status(403).json({
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`
            });
        }

        next();
    };
};

// Specific role middleware shortcuts
const farmerOnly = roleCheck('farmer');
const buyerOnly = roleCheck('buyer');
const adminOnly = roleCheck('admin');
const farmerOrBuyer = roleCheck('farmer', 'buyer');

module.exports = { roleCheck, farmerOnly, buyerOnly, adminOnly, farmerOrBuyer };
