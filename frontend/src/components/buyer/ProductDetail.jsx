import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form, Alert, Table } from 'react-bootstrap';
import { FaLeaf, FaStar, FaMapMarkerAlt, FaPhone, FaGavel, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';

const UPLOAD_URL = process.env.REACT_APP_UPLOAD_URL || 'http://localhost:5000/uploads';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, isBuyer } = useAuth();
    const [product, setProduct] = useState(null);
    const [bidHistory, setBidHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderQty, setOrderQty] = useState(50);
    const [bidAmount, setBidAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const [productRes, bidRes] = await Promise.all([
                api.get(`/products/${id}`),
                api.get(`/bids/product/${id}/history`).catch(() => ({ data: { bids: [] } }))
            ]);
            setProduct(productRes.data.product);
            setBidHistory(bidRes.data.bids || []);
            if (productRes.data.product.selling_mode === 'bidding') {
                setBidAmount((parseFloat(productRes.data.product.current_highest_bid || productRes.data.product.base_price) + 1).toFixed(2));
            }
        } catch (err) {
            toast.error('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const handleOrder = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        if (!isBuyer) { toast.error('Only buyers can place orders'); return; }
        setSubmitting(true);
        try {
            const res = await api.post('/orders', { product_id: id, quantity_kg: orderQty });
            toast.success('Order placed successfully!');
            navigate(`/buyer/orders/${res.data.order.id}/payment`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBid = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        if (!isBuyer) { toast.error('Only buyers can place bids'); return; }
        setSubmitting(true);
        try {
            await api.post('/bids', { product_id: id, amount: parseFloat(bidAmount) });
            toast.success('Bid placed successfully!');
            fetchProduct();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place bid');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;
    if (!product) return <Alert variant="danger">Product not found</Alert>;

    const minBid = parseFloat(product.current_highest_bid || product.base_price) + 0.01;
    const totalAmount = ((parseInt(orderQty) || 0) * parseFloat(product.fixed_price || 0)).toFixed(2);

    return (
        <Container className="py-4">
            <Button variant="link" className="mb-3 p-0" onClick={() => navigate(-1)}><FaArrowLeft /> Back to products</Button>

            <Row>
                <Col lg={8}>
                    <Card className="mb-4">
                        <Row className="g-0">
                            <Col md={5}>
                                <img src={product.images?.[0]?.image_url ? (product.images[0].image_url.startsWith('http') ? product.images[0].image_url : `${UPLOAD_URL}/${product.images[0].image_url.replace(/^\/+/, '')}`) : '/placeholder.jpg'} className="img-fluid rounded-start" alt={product.name} style={{ height: '300px', width: '100%', objectFit: 'cover' }} />
                                {product.images?.length > 1 && (
                                    <div className="d-flex gap-2 p-2">
                                        {product.images.slice(1).map((img, i) => (
                                            <img key={i} src={img.image_url.startsWith('http') ? img.image_url : `${UPLOAD_URL}/${img.image_url.replace(/^\/+/, '')}`} className="rounded" style={{ width: '60px', height: '60px', objectFit: 'cover' }} alt="" />
                                        ))}
                                    </div>
                                )}
                            </Col>
                            <Col md={7}>
                                <Card.Body>
                                    <div className="d-flex gap-2 mb-2">
                                        <Badge bg="secondary">{product.category_name}</Badge>
                                        <Badge bg={product.selling_mode === 'bidding' ? 'purple' : 'info'}>{product.selling_mode === 'bidding' ? '🔨 Bidding' : '💰 Fixed Price'}</Badge>
                                        {product.is_organic && <Badge bg="success"><FaLeaf /> Organic</Badge>}
                                        <Badge bg="warning" text="dark">Grade {product.quality_grade}</Badge>
                                    </div>
                                    <h3>{product.name}</h3>
                                    <p className="text-muted">{product.description}</p>

                                    <div className="mb-3">
                                        <h4 className="text-success mb-0">
                                            {product.selling_mode === 'fixed_price'
                                                ? `₹${product.fixed_price}/kg`
                                                : <>Current Bid: ₹{product.current_highest_bid || product.base_price}/kg</>}
                                        </h4>
                                        {product.selling_mode === 'bidding' && <small className="text-muted">Base: ₹{product.base_price}/kg</small>}
                                    </div>

                                    <p><strong>Available:</strong> {product.quantity_kg} kg</p>
                                </Card.Body>
                            </Col>
                        </Row>
                    </Card>

                    {/* Farmer Info */}
                    <Card className="mb-4">
                        <Card.Header>Seller Information</Card.Header>
                        <Card.Body>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                    {product.farmer_name?.[0]}
                                </div>
                                <div>
                                    <h6 className="mb-0">{product.farmer_name}</h6>
                                    <small className="text-muted"><FaMapMarkerAlt /> {product.farmer_city}, {product.farmer_state}</small>
                                    <div><FaStar className="text-warning" /> {product.farmer_rating || 'New Seller'}</div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Bid History */}
                    {product.selling_mode === 'bidding' && bidHistory.length > 0 && (
                        <Card>
                            <Card.Header>Bid History</Card.Header>
                            <Card.Body className="p-0">
                                <Table responsive className="mb-0">
                                    <thead><tr><th>Amount</th><th>Status</th><th>Time</th></tr></thead>
                                    <tbody>
                                        {bidHistory.map((bid, i) => (
                                            <tr key={i}><td className="fw-bold">₹{bid.amount}/kg</td><td><Badge bg={bid.status === 'active' ? 'success' : 'secondary'}>{bid.status}</Badge></td><td>{new Date(bid.bid_time).toLocaleString()}</td></tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    )}
                </Col>

                {/* Action Sidebar */}
                <Col lg={4}>
                    {product.status === 'active' && (
                        <Card className="sticky-top" style={{ top: '100px' }}>
                            <Card.Header className="bg-success text-white">
                                {product.selling_mode === 'fixed_price' ? <><FaShoppingCart /> Place Order</> : <><FaGavel /> Place Bid</>}
                            </Card.Header>
                            <Card.Body>
                                {product.selling_mode === 'fixed_price' ? (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Quantity (kg)</Form.Label>
                                            <Form.Control type="number" value={orderQty} onChange={e => setOrderQty(e.target.value)} min={50} max={product.quantity_kg} />
                                            <small className="text-muted">Min: 50 kg, Max: {product.quantity_kg} kg</small>
                                        </Form.Group>
                                        <div className="mb-3 p-3 bg-light rounded">
                                            <div className="d-flex justify-content-between"><span>Price/kg:</span><span>₹{product.fixed_price}</span></div>
                                            <div className="d-flex justify-content-between"><span>Quantity:</span><span>{orderQty} kg</span></div>
                                            <hr />
                                            <div className="d-flex justify-content-between fw-bold"><span>Total:</span><span className="text-success">₹{totalAmount}</span></div>
                                        </div>
                                        <Button className="w-100 btn-primary" onClick={handleOrder} disabled={submitting || (parseInt(orderQty) || 0) < 50 || (parseInt(orderQty) || 0) > product.quantity_kg}>
                                            {submitting ? 'Placing Order...' : 'Place Order'}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-3 p-3 bg-light rounded">
                                            <div className="d-flex justify-content-between"><span>Base Price:</span><span>₹{product.base_price}/kg</span></div>
                                            <div className="d-flex justify-content-between"><span>Current Highest:</span><span className="text-success fw-bold">₹{product.current_highest_bid || product.base_price}/kg</span></div>
                                            <div className="d-flex justify-content-between"><span>Quantity:</span><span>{product.quantity_kg} kg</span></div>
                                        </div>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Your Bid (₹/kg)</Form.Label>
                                            <Form.Control type="number" step="0.01" value={bidAmount} onChange={e => setBidAmount(e.target.value)} min={minBid} />
                                            <small className="text-muted">Min bid: ₹{minBid.toFixed(2)}/kg</small>
                                        </Form.Group>
                                        <Button className="w-100 btn-primary" onClick={handleBid} disabled={submitting || parseFloat(bidAmount) < minBid}>
                                            {submitting ? 'Placing Bid...' : 'Place Bid'}
                                        </Button>
                                    </>
                                )}
                                {!isAuthenticated && <Alert variant="info" className="mt-3 mb-0">Please <a href="/login">login</a> to {product.selling_mode === 'fixed_price' ? 'order' : 'bid'}</Alert>}
                            </Card.Body>
                        </Card>
                    )}
                    {product.status !== 'active' && <Alert variant="warning">This product is no longer available for purchase.</Alert>}
                </Col>
            </Row>
        </Container>
    );
};

export default ProductDetail;
