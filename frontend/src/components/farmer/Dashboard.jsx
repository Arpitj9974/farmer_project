import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaBox, FaGavel, FaShoppingBag, FaRupeeSign, FaPlus, FaList, FaClipboardList } from 'react-icons/fa';
import api from '../../services/api';
import Loader from '../common/Loader';
import PriceWatchWidget from '../common/PriceWatchWidget';
import DashboardLayout from '../common/Layout/DashboardLayout';

const FarmerDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [productsRes, ordersRes] = await Promise.all([
                api.get('/products/farmer/my-products?limit=100'),
                api.get('/orders/my-orders?limit=5')
            ]);

            const products = productsRes.data.data || [];
            const orders = ordersRes.data.data || [];

            const totalBids = products.reduce((sum, p) => sum + (parseInt(p.active_bids) || 0), 0);
            const totalEarnings = orders.filter(o => o.payment_status === 'completed')
                .reduce((sum, o) => sum + parseFloat(o.total_amount) - parseFloat(o.commission_amount), 0);

            setStats({
                totalProducts: products.length,
                activeProducts: products.filter(p => p.status === 'active').length,
                activeBids: totalBids,
                totalOrders: orders.length,
                totalEarnings: totalEarnings
            });
            setRecentOrders(orders);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <DashboardLayout role="farmer">
            <Container className="py-4">
                <h2 className="mb-4">Farmer Dashboard</h2>

                {/* Stats */}
                <Row className="g-4 mb-4">
                    <Col md={3}>
                        <div className="stat-card"><FaBox size={24} className="mb-2" /><h3>{stats?.totalProducts || 0}</h3><p>Total Products</p></div>
                    </Col>
                    <Col md={3}>
                        <div className="stat-card secondary"><FaGavel size={24} className="mb-2" /><h3>{stats?.activeBids || 0}</h3><p>Active Bids</p></div>
                    </Col>
                    <Col md={3}>
                        <div className="stat-card warning"><FaShoppingBag size={24} className="mb-2" /><h3>{stats?.totalOrders || 0}</h3><p>Total Orders</p></div>
                    </Col>
                    <Col md={3}>
                        <div className="stat-card success"><FaRupeeSign size={24} className="mb-2" /><h3>₹{(stats?.totalEarnings || 0).toLocaleString()}</h3><p>Total Earnings</p></div>
                    </Col>
                </Row>

                {/* Quick Actions */}
                <h5 className="mb-3">Quick Actions</h5>
                <Row className="g-4 mb-4">
                    <Col md={4}>
                        <Link to="/farmer/add-product" className="quick-action-btn"><FaPlus /><span>Add Product</span></Link>
                    </Col>
                    <Col md={4}>
                        <Link to="/farmer/products" className="quick-action-btn"><FaList /><span>My Products</span></Link>
                    </Col>
                    <Col md={4}>
                        <Link to="/farmer/orders" className="quick-action-btn"><FaClipboardList /><span>View Orders</span></Link>
                    </Col>
                </Row>

                <Row>
                    <Col lg={8}>
                        {/* Recent Orders */}
                        <Card className="mb-4">
                            <Card.Header>Recent Orders</Card.Header>
                            <Card.Body>
                                {recentOrders.length === 0 ? (
                                    <p className="text-muted text-center">No orders yet</p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead><tr><th>Order #</th><th>Product</th><th>Buyer</th><th>Amount</th><th>Status</th></tr></thead>
                                            <tbody>
                                                {recentOrders.map(order => (
                                                    <tr key={order.id}>
                                                        <td>{order.order_number}</td>
                                                        <td>{order.product_name}</td>
                                                        <td>{order.buyer_name}</td>
                                                        <td>₹{parseFloat(order.total_amount).toLocaleString()}</td>
                                                        <td><span className={`badge status-${order.order_status}`}>{order.order_status}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <PriceWatchWidget />
                    </Col>
                </Row>
            </Container>
        </DashboardLayout>
    );
};

export default FarmerDashboard;
