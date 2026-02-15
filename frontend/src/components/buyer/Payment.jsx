import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Form, Alert, Tab, Nav, Modal } from 'react-bootstrap';
import { FaCreditCard, FaCheckCircle, FaLock, FaShieldAlt, FaMobileAlt, FaUniversity } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Loader from '../common/Loader';

const Payment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    // Fake Form States
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [upiId, setUpiId] = useState('');

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/orders/${id}`);
            setOrder(res.data.order);
            if (res.data.order.payment_status === 'completed') {
                setSuccess(true);
            }
        } catch (err) {
            toast.error('Order not found');
            navigate('/buyer/orders');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!order) return;

        // Simulate "Processing" Delay
        setProcessing(true);

        // Fake API delay
        setTimeout(async () => {
            try {
                // Actual Backend Call to confirm order
                await api.post(`/orders/${id}/payment`, { payment_method: 'online' });
                setProcessing(false);
                setSuccess(true);
                toast.success('Payment Verified Successfully!');
            } catch (err) {
                setProcessing(false);
                toast.error(err.response?.data?.message || 'Payment failed');
            }
        }, 2500); // 2.5s simulated delay
    };

    if (loading) return <Loader />;
    if (!order) return <Alert variant="danger">Order not found</Alert>;

    const total = parseFloat(order.total_amount);

    if (success) {
        return (
            <Container className="py-5">
                <Card className="text-center p-5 shadow border-0" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="mb-4">
                        <FaCheckCircle size={80} className="text-success" />
                    </div>
                    <h2 className="text-success mb-3">Payment Successful!</h2>
                    <p className="text-muted mb-4 fs-5">Thank you for your purchase.</p>

                    <div className="bg-light p-4 rounded mb-4 text-start">
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Transaction ID:</span>
                            <span className="fw-bold font-monospace">{order.transaction_id || 'TXN_' + Date.now().toString().slice(-8)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Amount Paid:</span>
                            <span className="fw-bold">₹{total.toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span className="text-muted">Date:</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="d-grid gap-2 d-md-block">
                        <Button variant="primary" size="lg" className="me-md-2" onClick={() => navigate('/buyer/orders')}>
                            Track Order
                        </Button>
                        <Button variant="outline-primary" size="lg" onClick={() => navigate('/products')}>
                            Continue Shopping
                        </Button>
                    </div>
                </Card>
            </Container>
        );
    }

    // Format Card Number simulation
    const handleCardChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        val = val.substring(0, 16);
        val = val.match(/.{1,4}/g)?.join(' ') || val;
        setCardNumber(val);
    };

    return (
        <Container className="py-5">
            <Row className="g-5">
                {/* Order Summary on Left */}
                <Col lg={5}>
                    <Card className="border-0 shadow-sm bg-light h-100">
                        <Card.Header className="bg-white border-bottom-0 py-3">
                            <h5 className="mb-0">Order Summary</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-white p-2 rounded border me-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                    <span className="fs-3">📦</span>
                                </div>
                                <div>
                                    <h6 className="mb-1">{order.product_name}</h6>
                                    <small className="text-muted">Sold by {order.farmer_name}</small>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Price ({order.quantity_kg}kg x ₹{order.price_per_kg})</span>
                                <span>₹{(parseFloat(order.price_per_kg) * parseFloat(order.quantity_kg)).toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Handling & Logistics</span>
                                <span>₹250</span> {/* Demo fee */}
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Platform Fee</span>
                                <span className="text-success">FREE</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="h5 mb-0">Total</span>
                                <span className="h4 mb-0 text-success">₹{(total + 250).toLocaleString()}</span>
                            </div>

                            <div className="mt-4 pt-4 border-top">
                                <div className="d-flex align-items-center text-muted small">
                                    <FaShieldAlt className="me-2 text-success" />
                                    <span>Detailed invoice will be emailed to you after payment.</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Secure Payment Gateway on Right */}
                <Col lg={7}>
                    <Card className="shadow border-0">
                        <Card.Header className="bg-success text-white py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0"><FaLock className="me-2" /> Secure Payment Gateway</h5>
                                <span className="badge bg-white text-success">Trusted</span>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Tab.Container defaultActiveKey="card">
                                <Nav variant="tabs" className="mb-4">
                                    <Nav.Item>
                                        <Nav.Link eventKey="card" className="d-flex align-items-center gap-2">
                                            <FaCreditCard /> Card
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="upi" className="d-flex align-items-center gap-2">
                                            <FaMobileAlt /> UPI
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="netbanking" className="d-flex align-items-center gap-2">
                                            <FaUniversity /> NetBanking
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>

                                <Tab.Content>
                                    <Tab.Pane eventKey="card">
                                        <Form>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Card Number</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-white"><FaCreditCard className="text-muted" /></span>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="0000 0000 0000 0000"
                                                        value={cardNumber}
                                                        onChange={handleCardChange}
                                                        maxLength="19"
                                                    />
                                                </div>
                                            </Form.Group>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Expiry Date</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="MM/YY"
                                                            value={expiry}
                                                            onChange={e => {
                                                                let v = e.target.value.replace(/\D/g, '');
                                                                if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                                                                setExpiry(v);
                                                            }}
                                                            maxLength="5"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>CVV</Form.Label>
                                                        <Form.Control
                                                            type="password"
                                                            placeholder="123"
                                                            value={cvv}
                                                            onChange={e => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                                            maxLength="3"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Form.Group className="mb-4">
                                                <Form.Label>Name on Card</Form.Label>
                                                <Form.Control type="text" placeholder="John Doe" />
                                            </Form.Group>
                                        </Form>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="upi">
                                        <div className="text-center mb-4">
                                            <p className="text-muted">Pay using any UPI App</p>
                                            <div className="d-flex justify-content-center gap-3 mb-4">
                                                {/* Mock UI Icons - using generic badges/colors for simulation */}
                                                <div className="p-2 border rounded text-center" style={{ width: 80 }}>
                                                    <div className="fw-bold text-primary">GPay</div>
                                                </div>
                                                <div className="p-2 border rounded text-center" style={{ width: 80 }}>
                                                    <div className="fw-bold text-purple-600" style={{ color: '#6739b7' }}>PhonePe</div>
                                                </div>
                                                <div className="p-2 border rounded text-center" style={{ width: 80 }}>
                                                    <div className="fw-bold text-info">Paytm</div>
                                                </div>
                                            </div>
                                            <Form.Group className="mb-3 text-start">
                                                <Form.Label>Or enter UPI ID</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="mobile-number@upi"
                                                    value={upiId}
                                                    onChange={e => setUpiId(e.target.value)}
                                                />
                                                <Form.Text className="text-muted">
                                                    Check your UPI app for payment request after clicking Pay.
                                                </Form.Text>
                                            </Form.Group>
                                        </div>
                                    </Tab.Pane>
                                </Tab.Content>

                                <Button
                                    className="w-100 btn-success py-3 fs-5 fw-bold shadow-sm"
                                    onClick={handlePayment}
                                    style={{ background: 'linear-gradient(45deg, #198754, #20c997)' }}
                                >
                                    Pay ₹{(total + 250).toLocaleString()}
                                </Button>

                                <div className="text-center mt-3">
                                    <small className="text-muted">
                                        <FaLock className="me-1" /> 256-bit SSL Encrypted Payment
                                    </small>
                                </div>
                            </Tab.Container>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Simulated Processing Modal */}
            <Modal show={processing} centered backdrop="static" keyboard={false}>
                <Modal.Body className="text-center p-5">
                    <div className="spinner-border text-success mb-4" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                    <h4>Processing Payment...</h4>
                    <p className="text-muted">Please do not close this window.</p>
                    <div className="progress mt-3 icon-link-hover" style={{ height: '5px' }}>
                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-success" style={{ width: '100%' }}></div>
                    </div>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Payment;
