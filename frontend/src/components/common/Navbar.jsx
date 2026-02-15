import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FaBell, FaLeaf, FaUser, FaSignOutAlt, FaStore, FaShoppingCart, FaChartBar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Navbar = () => {
    const { user, isAuthenticated, logout, isFarmer, isBuyer, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/notifications/unread-count');
            setUnreadCount(res.data.count);
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => { logout(); navigate('/'); };

    const getDashboardLink = () => {
        if (isFarmer) return '/farmer/dashboard';
        if (isBuyer) return '/buyer/dashboard';
        if (isAdmin) return '/admin/dashboard';
        return '/';
    };

    return (
        <BSNavbar expand="lg" sticky="top" className="py-3">
            <Container>
                <BSNavbar.Brand as={Link} to="/">
                    <FaLeaf className="me-2" />FarmerConnect
                </BSNavbar.Brand>
                <BSNavbar.Toggle />
                <BSNavbar.Collapse>
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/products">Browse Products</Nav.Link>
                        {isAuthenticated && <Nav.Link as={Link} to="/market-prices">Market Prices</Nav.Link>}
                    </Nav>
                    <Nav>
                        {isAuthenticated ? (
                            <>
                                {isFarmer && (
                                    <NavDropdown title={<><FaStore className="me-1" />Farmer</>}>
                                        <NavDropdown.Item as={Link} to="/farmer/dashboard">Dashboard</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/farmer/add-product">Add Product</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/farmer/products">My Products</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/farmer/orders">Orders</NavDropdown.Item>
                                    </NavDropdown>
                                )}
                                {isBuyer && (
                                    <NavDropdown title={<><FaShoppingCart className="me-1" />Buyer</>}>
                                        <NavDropdown.Item as={Link} to="/buyer/dashboard">Dashboard</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/buyer/bids">My Bids</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/buyer/orders">My Orders</NavDropdown.Item>
                                    </NavDropdown>
                                )}
                                {isAdmin && (
                                    <NavDropdown title={<><FaChartBar className="me-1" />Admin</>}>
                                        <NavDropdown.Item as={Link} to="/admin/dashboard">Dashboard</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/admin/verify-users">Verify Users</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/admin/products">Manage Products</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/admin/analytics">Analytics</NavDropdown.Item>
                                    </NavDropdown>
                                )}
                                <Nav.Link className="notification-bell">
                                    <FaBell />
                                    {unreadCount > 0 && <Badge className="notification-badge">{unreadCount}</Badge>}
                                </Nav.Link>
                                <NavDropdown title={<><FaUser className="me-1" />{user?.name?.split(' ')[0]}</>} align="end">
                                    <NavDropdown.Item as={Link} to={getDashboardLink()}>Dashboard</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout}><FaSignOutAlt className="me-2" />Logout</NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                <Nav.Link as={Link} to="/register" className="btn btn-primary text-white ms-2">Register</Nav.Link>
                            </>
                        )}
                    </Nav>
                </BSNavbar.Collapse>
            </Container>
        </BSNavbar>
    );
};

export default Navbar;
