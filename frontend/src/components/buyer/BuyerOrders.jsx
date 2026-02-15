import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Table, Badge, Button, Form, Row, Col, Modal, Tabs, Tab } from 'react-bootstrap';
import { FaFileInvoice, FaCreditCard, FaStar, FaBox, FaTruck, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Loader from '../common/Loader';
import TransactionHistory from '../common/TransactionHistory';

const BuyerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ order_status: '', payment_status: '' });
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewOrder, setReviewOrder] = useState(null);
    const [reviewData, setReviewData] = useState({ rating: 5, review_text: '' });

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filter);
            const res = await api.get(`/orders/my-orders?${params}`);
            setOrders(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const downloadInvoice = async (orderId) => {
        try {
            const res = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Invoice not available');
        }
    };

    const handleReview = async () => {
        try {
            await api.post('/reviews', { order_id: reviewOrder.id, ...reviewData });
            toast.success('Review submitted!');
            setShowReviewModal(false);
            fetchOrders();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        }
    };

    const getStatusBadge = (status) => {
        const colors = { pending: 'warning', confirmed: 'info', preparing: 'primary', ready: 'success', delivered: 'success' };
        return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
    };

    if (loading) return <Loader />;

    return (
        <Container className="py-4">
            <h2 className="mb-4">My Orders & Purchases</h2>

            <Tabs defaultActiveKey="orders" className="mb-4">
                <Tab eventKey="orders" title="My Orders">
                    <Card className="mb-4 border-0 shadow-sm bg-light">
                        <Card.Body>
                            <Row>
                                <Col md={4}>
                                    <Form.Select value={filter.order_status} onChange={e => setFilter({ ...filter, order_status: e.target.value })}>
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="preparing">Preparing</option>
                                        <option value="ready">Ready</option>
                                        <option value="delivered">Delivered</option>
                                    </Form.Select>
                                </Col>
                                <Col md={4}>
                                    <Form.Select value={filter.payment_status} onChange={e => setFilter({ ...filter, payment_status: e.target.value })}>
                                        <option value="">All Payment</option>
                                        <option value="pending">Payment Pending</option>
                                        <option value="completed">Paid</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {orders.length === 0 ? (
                        <div className="empty-state p-5 text-center bg-light rounded">
                            <p className="text-muted">No orders yet</p>
                            <Link to="/products" className="btn btn-primary">Browse Products</Link>
                        </div>
                    ) : (
                        <Card className="shadow-sm border-0">
                            <Card.Body className="p-0">
                                <Table responsive hover className="mb-0">
                                    <thead className="bg-light"><tr><th>Order #</th><th>Product</th><th>Farmer</th><th>Qty</th><th>Amount</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td className="fw-bold">{order.order_number}</td>
                                                <td>{order.product_name}</td>
                                                <td>{order.farmer_name}</td>
                                                <td>{order.quantity_kg} kg</td>
                                                <td>₹{parseFloat(order.total_amount).toLocaleString()}</td>
                                                <td>{getStatusBadge(order.order_status)}</td>
                                                <td><Badge bg={order.payment_status === 'completed' ? 'success' : 'warning'}>{order.payment_status}</Badge></td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        {order.payment_status === 'pending' && (
                                                            <Link to={`/buyer/orders/${order.id}/payment`} className="btn btn-sm btn-success"><FaCreditCard /></Link>
                                                        )}
                                                        {order.payment_status === 'completed' && (
                                                            <Button variant="outline-secondary" size="sm" onClick={() => downloadInvoice(order.id)}><FaFileInvoice /></Button>
                                                        )}
                                                        {order.order_status === 'delivered' && !order.has_review && (
                                                            <Button variant="outline-warning" size="sm" onClick={() => { setReviewOrder(order); setShowReviewModal(true); }}><FaStar /></Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    )}
                </Tab>

                <Tab eventKey="payments_delivery" title="Payments & Delivery">
                    <Row>
                        <Col lg={12} className="mb-4">
                            <TransactionHistory role="buyer" />
                        </Col>
                        <Col lg={12}>
                            <h5 className="mb-3 text-primary"><FaTruck className="me-2" /> Live Shipment Tracking</h5>
                            {orders.filter(o => o.order_status !== 'delivered').length > 0 ? (
                                <Row>
                                    {orders.filter(o => o.order_status !== 'delivered').slice(0, 3).map(order => {
                                        const steps = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
                                        const currentStep = steps.indexOf(order.order_status);
                                        return (
                                            <Col md={12} key={order.id} className="mb-3">
                                                <Card className="shadow-sm border-0">
                                                    <Card.Body>
                                                        <div className="d-flex justify-content-between mb-3">
                                                            <div>
                                                                <span className="badge bg-light text-dark mb-1">{order.order_number}</span>
                                                                <h6 className="mb-0">{order.product_name} ({order.quantity_kg}kg)</h6>
                                                            </div>
                                                            <div className="text-end">
                                                                <small className="text-muted">Expected Delivery</small>
                                                                <div className="fw-bold text-success">Within 2 Days</div>
                                                            </div>
                                                        </div>

                                                        {/* Progress Bar */}
                                                        <div className="position-relative px-4 py-2">
                                                            <div className="d-flex justify-content-between position-relative" style={{ zIndex: 1 }}>
                                                                {steps.map((step, i) => {
                                                                    const isCompleted = i <= currentStep;
                                                                    return (
                                                                        <div key={step} className="text-center" style={{ width: '20%' }}>
                                                                            <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 transition ${isCompleted ? 'bg-primary text-white shadow-sm' : 'bg-light text-muted border'}`} style={{ width: 36, height: 36, transition: 'all 0.3s' }}>
                                                                                {isCompleted ? (step === 'delivered' ? <FaCheck /> : <FaBox size={14} />) : <small>{i + 1}</small>}
                                                                            </div>
                                                                            <small className={`fw-bold d-block text-capitalize ${isCompleted ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>{step}</small>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                            <div className="position-absolute top-0 start-0 w-100 bg-light rounded" style={{ height: 4, top: 25, zIndex: 0 }}></div>
                                                            <div className="position-absolute top-0 start-0 bg-primary rounded transition" style={{ height: 4, top: 25, zIndex: 0, width: `${(currentStep / 4) * 100}%`, transition: 'width 0.5s ease' }}></div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        )
                                    })}
                                </Row>
                            ) : (
                                <div className="text-center py-5 bg-light rounded">
                                    <FaCheck size={40} className="text-success mb-3" />
                                    <h6 className="text-muted">No active shipments. All orders delivered!</h6>
                                </div>
                            )}
                        </Col>

                        {/* Delivered History */}
                        <Col lg={12} className="mt-4">
                            <h6 className="text-muted mb-3">Past Deliveries</h6>
                            {orders.filter(o => o.order_status === 'delivered').length > 0 ? (
                                <Table hover size="sm" className="bg-white">
                                    <thead><tr><th>Date</th><th>Order</th><th>Product</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {orders.filter(o => o.order_status === 'delivered').map(o => (
                                            <tr key={o.id}>
                                                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                                                <td>{o.order_number}</td>
                                                <td>{o.product_name}</td>
                                                <td><span className="badge bg-success">Delivered</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : <p className="small text-muted">No past deliveries.</p>}
                        </Col>
                    </Row>
                </Tab>
            </Tabs>

            {/* Review Modal stays same */}
            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
                <Modal.Header closeButton><Modal.Title>Review Order</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Rating</Form.Label>
                        <div className="d-flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Button key={star} variant={reviewData.rating >= star ? 'warning' : 'outline-warning'} onClick={() => setReviewData({ ...reviewData, rating: star })}>
                                    <FaStar />
                                </Button>
                            ))}
                        </div>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Review</Form.Label>
                        <Form.Control as="textarea" rows={3} value={reviewData.review_text} onChange={e => setReviewData({ ...reviewData, review_text: e.target.value })} placeholder="Share your experience..." />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReviewModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleReview}>Submit Review</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default BuyerOrders;
