import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';

const PrivateRoute = ({ children, roles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return <Loader />;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && !roles.includes(user?.user_type)) {
        return (
            <div className="container text-center mt-5">
                <h2>Access Denied</h2>
                <p>You don't have permission to access this page.</p>
            </div>
        );
    }

    return children;
};

export default PrivateRoute;
