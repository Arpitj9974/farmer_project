import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FaDownload, FaRupeeSign, FaUsers, FaChartLine } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import api from '../../services/api';
import Loader from '../common/Loader';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(dateRange);
            const res = await api.get(`/analytics/dashboard?${params}`);
            setAnalytics(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = async (type) => {
        try {
            const res = await api.get(`/analytics/export?type=${type}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_export.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <Loader />;

    const revenueChartData = {
        labels: analytics?.revenue_over_time?.map(d => d.date) || [],
        datasets: [
            { label: 'Revenue', data: analytics?.revenue_over_time?.map(d => d.revenue) || [], borderColor: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)', fill: true },
            { label: 'Commission', data: analytics?.revenue_over_time?.map(d => d.commission) || [], borderColor: '#2196F3', backgroundColor: 'rgba(33, 150, 243, 0.1)', fill: true }
        ]
    };

    const categoryChartData = {
        labels: analytics?.revenue_by_category?.map(d => d.category) || [],
        datasets: [{ label: 'Revenue', data: analytics?.revenue_by_category?.map(d => d.revenue) || [], backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'] }]
    };

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Analytics</h2>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm" onClick={() => exportCSV('orders')}><FaDownload /> Orders</Button>
                    <Button variant="outline-primary" size="sm" onClick={() => exportCSV('products')}><FaDownload /> Products</Button>
                    <Button variant="outline-primary" size="sm" onClick={() => exportCSV('users')}><FaDownload /> Users</Button>
                </div>
            </div>

            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control type="date" value={dateRange.start_date} onChange={e => setDateRange({ ...dateRange, start_date: e.target.value })} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>End Date</Form.Label>
                                <Form.Control type="date" value={dateRange.end_date} onChange={e => setDateRange({ ...dateRange, end_date: e.target.value })} />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Row className="g-4 mb-4">
                <Col md={4}>
                    <div className="stat-card success">
                        <FaRupeeSign size={24} className="mb-2" />
                        <h3>₹{analytics?.revenue_over_time?.reduce((a, b) => a + parseFloat(b.revenue || 0), 0).toLocaleString() || 0}</h3>
                        <p>Total Revenue</p>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="stat-card secondary">
                        <FaChartLine size={24} className="mb-2" />
                        <h3>₹{analytics?.revenue_over_time?.reduce((a, b) => a + parseFloat(b.commission || 0), 0).toLocaleString() || 0}</h3>
                        <p>Commission Earned</p>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="stat-card warning">
                        <FaUsers size={24} className="mb-2" />
                        <h3>{analytics?.farmer_benefits?.active_farmers || 0}</h3>
                        <p>Active Farmers</p>
                    </div>
                </Col>
            </Row>

            {analytics?.farmer_benefits && (
                <Card className="mb-4 bg-light">
                    <Card.Body>
                        <h6>🌾 Farmer Benefits</h6>
                        <Row>
                            <Col md={4}><strong>Avg Price per kg:</strong> ₹{analytics.farmer_benefits.avg_price?.toFixed(2) || 0}</Col>
                            <Col md={4}><strong>MSP Average:</strong> ₹{analytics.farmer_benefits.msp_avg?.toFixed(2) || 0}</Col>
                            <Col md={4}><strong>Price Above MSP:</strong> <span className="text-success">{analytics.farmer_benefits.price_above_msp_percent || 0}%</span></Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            <Row className="g-4">
                <Col md={8}>
                    <Card>
                        <Card.Header>Revenue Over Time</Card.Header>
                        <Card.Body><Line data={revenueChartData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} /></Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Header>Revenue by Category</Card.Header>
                        <Card.Body><Bar data={categoryChartData} options={{ plugins: { legend: { display: false } } }} /></Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Analytics;
