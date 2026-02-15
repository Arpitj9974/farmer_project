import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaGavel, FaShoppingBag, FaRupeeSign, FaSearch, FaClock } from 'react-icons/fa';
import api from '../../services/api';
import Loader from '../common/Loader';
import PriceWatchWidget from '../common/PriceWatchWidget';

const BuyerDashboard = () => {
    const [stats, setStats] = useState(null);
    const [activeBids, setActiveBids] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [bidsRes, ordersRes] = await Promise.all([
                api.get('/bids/my-bids?limit=5'),
                api.get('/orders/my-orders?limit=5')
            ]);

            const bids = bidsRes.data.data || [];
            const orders = ordersRes.data.data || [];
            const totalSpent = orders.filter(o => o.payment_status === 'completed').reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

            setStats({
                activeBids: bids.filter(b => b.status === 'active').length,
                wonBids: bids.filter(b => b.status === 'accepted').length,
                totalOrders: orders.length,
                pendingOrders: orders.filter(o => o.order_status !== 'delivered').length,
                totalSpent
            });
            setActiveBids(bids.filter(b => b.status === 'active').slice(0, 5));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <Container className="py-4">
            <h2 className="mb-4">Buyer Dashboard</h2>

            <Row className="g-4 mb-4">
                <Col md={3}>
                    <div className="stat-card"><FaGavel size={24} className="mb-2" /><h3>{stats?.activeBids || 0}</h3><p>Active Bids</p></div>
                </Col>
                <Col md={3}>
                    <div className="stat-card secondary"><FaClock size={24} className="mb-2" /><h3>{stats?.pendingOrders || 0}</h3><p>Pending Orders</p></div>
                </Col>
                <Col md={3}>
                    <div className="stat-card warning"><FaShoppingBag size={24} className="mb-2" /><h3>{stats?.totalOrders || 0}</h3><p>Total Orders</p></div>
                </Col>
                <Col md={3}>
                    <div className="stat-card success"><FaRupeeSign size={24} className="mb-2" /><h3>₹{(stats?.totalSpent || 0).toLocaleString()}</h3><p>Total Spent</p></div>
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                <Col lg={8}>
                    <div className="d-flex gap-3 mb-4">
                        <Link to="/products" className="quick-action-btn flex-fill"><FaSearch /><span>Browse Products</span></Link>
                        <Link to="/buyer/bids" className="quick-action-btn flex-fill"><FaGavel /><span>My Bids</span></Link>
                        <Link to="/buyer/orders" className="quick-action-btn flex-fill"><FaShoppingBag /><span>My Orders</span></Link>
                    </div>

                    {/* Active Bids */}
                    <Card>
                        <Card.Header>Your Active Bids</Card.Header>
                        <Card.Body>
                            {activeBids.length > 0 ? (
                                <table className="table table-hover mb-0">
                                    <thead><tr><th>Product</th><th>Your Bid</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {activeBids.map(bid => (
                                            <tr key={bid.id}>
                                                <td>{bid.product_name}</td>
                                                <td className="fw-bold">₹{bid.amount}/kg</td>
                                                <td><span className="badge bg-primary">{bid.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-muted text-center py-3">No active bids. Check out the "Browse Products" page!</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <PriceWatchWidget />
                </Col>
            </Row>
        </Container>
    );
};

export default BuyerDashboard;
