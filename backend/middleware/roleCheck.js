/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Roles hierarchy:
 *   farmer          — Product management, farm profile
 *   buyer           — Browse, bid, order
 *   support_admin   — View reports, suspend users, moderate products
 *   platform_manager— Manage categories, approve farmers, manage commissions
 *   super_admin     — Full access to everything
 *   admin           — Legacy admin role (treated same as super_admin)
 */

// Generic role checker — accepts one or more allowed roles
const roleCheck = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        // super_admin and legacy admin always have access
        if (['super_admin', 'admin'].includes(req.user.user_type)) {
            return next();
        }

        if (!allowedRoles.includes(req.user.user_type)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
                requiredRoles: allowedRoles,
                currentRole: req.user.user_type
            });
        }

        next();
    };
};

// ═══════════════════════════════════════════════════
// Specific role middleware shortcuts
// ═══════════════════════════════════════════════════

const farmerOnly = roleCheck('farmer');
const buyerOnly = roleCheck('buyer');
const adminOnly = roleCheck('admin', 'super_admin');

// New granular role checks
const supportAdminOnly = roleCheck('support_admin', 'platform_manager', 'super_admin', 'admin');
const platformManagerOnly = roleCheck('platform_manager', 'super_admin', 'admin');
const superAdminOnly = roleCheck('super_admin', 'admin');

// Combined role checks
const farmerOrBuyer = roleCheck('farmer', 'buyer');
const anyAdmin = roleCheck('admin', 'support_admin', 'platform_manager', 'super_admin');

// Ownership check middleware — verifies user owns the resource
const requireOwnership = (getResourceOwnerId) => {
    return async (req, res, next) => {
        try {
            // Admins bypass ownership checks
            if (['admin', 'super_admin', 'platform_manager'].includes(req.user.user_type)) {
                return next();
            }

            const ownerId = await getResourceOwnerId(req);
            if (ownerId !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You do not own this resource.'
                });
            }
            next();
        } catch (error) {
            console.error('Ownership check error:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Authorization check failed.'
            });
        }
    };
};

module.exports = {
    roleCheck,
    farmerOnly,
    buyerOnly,
    adminOnly,
    supportAdminOnly,
    platformManagerOnly,
    superAdminOnly,
    farmerOrBuyer,
    anyAdmin,
    requireOwnership
};
