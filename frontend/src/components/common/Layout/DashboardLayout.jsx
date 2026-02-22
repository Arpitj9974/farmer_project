import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { UPLOAD_URL } from '../../../services/api';
import {
    FaTachometerAlt, FaBoxOpen, FaPlusCircle,
    FaClipboardList, FaChartLine, FaUserCircle,
    FaSignOutAlt, FaCog
} from 'react-icons/fa';
import './DashboardLayout.css';

const FarmerSidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Grouping nav items by categories
    const navCategories = [
        {
            title: 'Overview',
            items: [
                { path: '/farmer/dashboard', name: 'Dashboard', icon: <FaTachometerAlt /> },
                { path: '/farmer/analytics', name: 'Analytics', icon: <FaChartLine /> },
            ]
        },
        {
            title: 'Management',
            items: [
                { path: '/farmer/products', name: 'My Products', icon: <FaBoxOpen /> },
                { path: '/farmer/add-product', name: 'Add Product', icon: <FaPlusCircle /> },
                { path: '/farmer/orders', name: 'Orders', icon: <FaClipboardList /> },
            ]
        },
        {
            title: 'Settings',
            items: [
                { path: '/farmer/profile', name: 'My Profile', icon: <FaUserCircle /> },
            ]
        }
    ];

    const avatarSrc = useMemo(() => {
        if (!user || !user.avatar_url) return null;
        if (user.avatar_url.startsWith('http')) return user.avatar_url;
        return `${UPLOAD_URL}${user.avatar_url}`;
    }, [user]);

    return (
        <aside className="dashboard-sidebar">
            <div className="sidebar-profile">
                {avatarSrc ? (
                    <img src={avatarSrc} alt={user?.name} className="sidebar-avatar" />
                ) : (
                    <div className="sidebar-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5b6574' }}>
                        <FaUserCircle size={28} />
                    </div>
                )}
                <div className="sidebar-profile-info">
                    <h4 className="sidebar-name">{user?.name || 'Farmer'}</h4>
                    <span className="sidebar-role">Farmer Account</span>
                </div>
            </div>

            <nav className="sidebar-nav-container">
                {navCategories.map((category, idx) => (
                    <div key={category.title} className="mb-4">
                        <div className="sidebar-section-title">{category.title}</div>
                        <ul className="sidebar-nav">
                            {category.items.map((item) => (
                                <li key={item.path} className="sidebar-item">
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                    >
                                        <span className="sidebar-icon">{item.icon}</span>
                                        <span className="sidebar-text">{item.name}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button onClick={logout} className="logout-btn">
                    <span className="sidebar-icon"><FaSignOutAlt /></span>
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

const DashboardLayout = ({ children, role }) => {
    return (
        <div className="dashboard-layout">
            {role === 'farmer' && <FarmerSidebar />}
            {role === 'buyer' && {/* Placeholder Buyer Sidebar */ }}
            {role === 'admin' && {/* Placeholder Admin Sidebar */ }}

            <main className="dashboard-main-content">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
