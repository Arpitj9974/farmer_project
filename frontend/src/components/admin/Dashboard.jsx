import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUsers, FaBox, FaShoppingBag, FaRupeeSign, FaUserCheck, FaClipboardCheck, FaChartBar, FaClock } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../../services/api';
import Loader from '../common/Loader';
import PriceWatchWidget from '../common/PriceWatchWidget';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/admin/dashboard');
            setStats(res.data.stats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    const orderChartData = {
        labels: Object.keys(stats?.orders_by_status || {}),
        datasets: [{
            data: Object.values(stats?.orders_by_status || {}),
            backgroundColor: ['#FFC107', '#2196F3', '#FF9800', '#8BC34A', '#4CAF50'],
        }]
    };

    const productChartData = {
        labels: Object.keys(stats?.products_by_status || {}),
        datasets: [{
            label: 'Products',
            data: Object.values(stats?.products_by_status || {}),
            backgroundColor: '#4CAF50',
        }]
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">Admin Dashboard</h2>

            <Row className="g-4 mb-4">
                <Col md={3}>
                    <div className="stat-card"><FaUsers size={24} className="mb-2" /><h3>{stats?.total_users || 0}</h3><p>Total Users</p></div>
                </Col>
                <Col md={3}>
                    <div className="stat-card secondary"><FaBox size={24} className="mb-2" /><h3>{stats?.total_products || 0}</h3><p>Total Products</p></div>
                </Col>
                <Col md={3}>
                    <div className="stat-card warning"><FaShoppingBag size={24} className="mb-2" /><h3>{stats?.total_orders || 0}</h3><p>Total Orders</p></div>
                </Col>
                <Col md={3}>
                    <div className="stat-card success"><FaRupeeSign size={24} className="mb-2" /><h3>₹{(stats?.total_commission || 0).toLocaleString()}</h3><p>Commission Earned</p></div>
                </Col>
            </Row>

// ... imports
            import PriceWatchWidget from '../common/PriceWatchWidget';

            // ... (render) ...

            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Link to="/admin/verify-users" className="quick-action-btn">
                        <FaUserCheck /><span>Verify Users ({stats?.pending_verifications || 0})</span>
                    </Link>
                </Col>
                <Col md={3}>
                    <Link to="/admin/products" className="quick-action-btn">
                        <FaClipboardCheck /><span>Pending Products</span>
                    </Link>
                </Col>
                <Col md={3}>
                    <Link to="/admin/analytics" className="quick-action-btn">
                        <FaChartBar /><span>Analytics</span>
                    </Link>
                </Col>
                <Col md={3}>
                    <Card className="h-100 text-center p-3">
                        <Card.Body>
                            <FaClock size={24} className="text-warning mb-2" />
                            <h5>{stats?.pending_verifications || 0}</h5>
                            <small className="text-muted">Pending Verifications</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                <Col lg={4}>
                    <PriceWatchWidget />
                </Col>
                <Col lg={8}>
                    <Row>
                        <Col md={6} className="mb-4">
                            <Card className="h-100">
                                <Card.Header>Orders by Status</Card.Header>
                                <Card.Body><Doughnut data={orderChartData} /></Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} className="mb-4">
                            <Card className="h-100">
                                <Card.Header>Products by Status</Card.Header>
                                <Card.Body><Bar data={productChartData} options={{ plugins: { legend: { display: false } } }} /></Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {stats?.recent_orders?.length > 0 && (
                <Card className="mt-4">
                    <Card.Header>Recent Orders</Card.Header>
                    <Card.Body className="p-0">
                        <table className="table mb-0">
                            <thead><tr><th>Order #</th><th>Product</th><th>Amount</th><th>Status</th></tr></thead>
                            <tbody>
                                {stats.recent_orders.map((order, i) => (
                                    <tr key={i}>
                                        <td>{order.order_number}</td>
                                        <td>{order.product_name}</td>
                                        <td>₹{parseFloat(order.total_amount).toLocaleString()}</td>
                                        <td><span className={`badge status-${order.order_status}`}>{order.order_status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default AdminDashboard;
