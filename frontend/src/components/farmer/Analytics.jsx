import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../../services/api';
import DashboardLayout from '../common/Layout/DashboardLayout';
import Loader from '../common/Loader';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/products/farmer/analytics');
            setStats(res.data.analytics);
        } catch (err) {
            console.error('Failed to load analytics', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;
    if (!stats) return <div className="text-center p-5">Failed to load analytics data</div>;

    const revChartData = {
        labels: [...stats.monthlyRevenue].reverse().map(m => m.month),
        datasets: [{
            label: 'Net Earnings (₹)',
            data: [...stats.monthlyRevenue].reverse().map(m => m.earnings),
            borderColor: '#2e7d32',
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    const StatusData = {
        labels: ['Active', 'Sold', 'Pending'],
        datasets: [{
            data: [stats.products.active_products, stats.products.sold_products, stats.products.pending_products],
            backgroundColor: ['#4caf50', '#9e9e9e', '#ff9800'],
            borderWidth: 0
        }]
    };

    const TopProductsData = {
        labels: stats.topProducts.map(p => p.name),
        datasets: [{
            label: 'Revenue (₹)',
            data: stats.topProducts.map(p => p.revenue),
            backgroundColor: '#2196f3'
        }]
    };

    return (
        <DashboardLayout role="farmer">
            <Container className="py-4">
                <h2 className="mb-4">Performance Analytics</h2>

                {/* KPI Cards */}
                <Row className="g-4 mb-4">
                    <Col md={3}>
                        <Card className="border-0 shadow-sm text-center h-100">
                            <Card.Body>
                                <h6 className="text-muted">Total Net Revenue</h6>
                                <h3 className="text-success fw-bold">₹{parseFloat(stats.revenue.net_earnings).toLocaleString()}</h3>
                                <small>From {stats.revenue.total_orders} orders</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm text-center h-100">
                            <Card.Body>
                                <h6 className="text-muted">Platform Commission</h6>
                                <h3 className="text-danger fw-bold">₹{parseFloat(stats.revenue.total_commission).toLocaleString()}</h3>
                                <small>5% standard fee</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm text-center h-100">
                            <Card.Body>
                                <h6 className="text-muted">Total Products</h6>
                                <h3 className="text-primary fw-bold">{stats.products.total_products}</h3>
                                <small>{stats.products.active_products} Active</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm text-center h-100">
                            <Card.Body>
                                <h6 className="text-muted">Bidding Activity</h6>
                                <h3 className="text-info fw-bold">{stats.bids.total_bids}</h3>
                                <small>{stats.bids.active_bids} Active Bids</small>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="g-4">
                    {/* Revenue Line Chart */}
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <h5 className="mb-4">Revenue Overview (Last 6 Months)</h5>
                                <div style={{ height: '300px' }}>
                                    <Line data={revChartData} options={{ maintainAspectRatio: false }} />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Product Status Doughnut */}
                    <Col lg={4}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <h5 className="mb-4">Product Status Breakdown</h5>
                                <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                                    <Doughnut data={StatusData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col lg={12}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body>
                                <h5 className="mb-4">Top Selling Products</h5>
                                <div style={{ height: '300px' }}>
                                    <Bar data={TopProductsData} options={{ maintainAspectRatio: false }} />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

            </Container>
        </DashboardLayout>
    );
};

export default Analytics;
