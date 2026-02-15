// Format currency (Indian Rupee)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

// Format date
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

// Format datetime
const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Calculate commission
const calculateCommission = (totalAmount, rate = 0.05) => {
    return parseFloat((totalAmount * rate).toFixed(2));
};

// Sanitize string (basic XSS prevention)
const sanitizeString = (str) => {
    if (!str) return '';
    return str.replace(/[<>]/g, '').trim();
};

// Paginate results
const paginate = (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return { limit: parseInt(limit), offset };
};

// Build pagination response
const paginationResponse = (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: parseInt(total),
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

module.exports = {
    formatCurrency, formatDate, formatDateTime,
    calculateCommission, sanitizeString, paginate, paginationResponse
};
