import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Table, Button, Alert, Badge, Modal, Form } from 'react-bootstrap';
import { FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Loader from '../common/Loader';

const ViewBids = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCloseModal, setShowCloseModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [productRes, bidsRes] = await Promise.all([
                api.get(`/products/${id}`),
                api.get(`/bids/product/${id}`)
            ]);
            setProduct(productRes.data.product);
            setBids(bidsRes.data.bids);
        } catch (err) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptBid = async (bidId) => {
        if (!window.confirm('Accept this bid? This will create an order and reject all other bids.')) return;
        try {
            await api.post(`/bids/${bidId}/accept`);
            toast.success('Bid accepted! Order created.');
            navigate('/farmer/orders');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept bid');
        }
    };

    const handleCloseBidding = async () => {
        try {
            await api.post(`/bids/product/${id}/close`);
            toast.success('Bidding closed');
            setShowCloseModal(false);
            navigate('/farmer/products');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to close bidding');
        }
    };

    if (loading) return <Loader />;
    if (!product) return <Alert variant="danger">Product not found</Alert>;

    const activeBids = bids.filter(b => b.status === 'active');
    const highestBid = activeBids.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))[0];

    return (
        <Container className="py-4">
            <Button variant="link" className="mb-3 p-0" onClick={() => navigate(-1)}><FaArrowLeft /> Back</Button>

            <Card className="mb-4">
                <Card.Header>
                    <h5 className="mb-0">{product.name}</h5>
                </Card.Header>
                <Card.Body>
                    <div className="d-flex gap-4 flex-wrap">
                        <div><strong>Quantity:</strong> {product.quantity_kg} kg</div>
                        <div><strong>Base Price:</strong> ₹{product.base_price}/kg</div>
                        <div><strong>Highest Bid:</strong> <span className="text-success fw-bold">₹{highestBid?.amount || product.base_price}/kg</span></div>
                        <div><strong>Total Bids:</strong> {bids.length}</div>
                    </div>
                </Card.Body>
            </Card>

            {bids.length === 0 ? (
                <Alert variant="info">No bids received yet. Buyers will be able to see your product and place bids.</Alert>
            ) : (
                <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <span>All Bids</span>
                        <Button variant="outline-danger" size="sm" onClick={() => setShowCloseModal(true)}>Close Bidding</Button>
                    </Card.Header>
                    <Card.Body>
                        <Table responsive hover>
                            <thead>
                                <tr><th>#</th><th>Buyer</th><th>Business</th><th>Bid Amount</th><th>Status</th><th>Time</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {bids.map((bid, i) => (
                                    <tr key={bid.id} className={bid.id === highestBid?.id ? 'table-success' : ''}>
                                        <td>{i + 1}</td>
                                        <td>{bid.buyer_name}</td>
                                        <td>{bid.business_name || '-'}</td>
                                        <td className="fw-bold">₹{bid.amount}/kg {bid.id === highestBid?.id && <Badge bg="success">Highest</Badge>}</td>
                                        <td><Badge bg={bid.status === 'active' ? 'primary' : bid.status === 'accepted' ? 'success' : 'secondary'}>{bid.status}</Badge></td>
                                        <td>{new Date(bid.created_at).toLocaleString()}</td>
                                        <td>
                                            {bid.status === 'active' && (
                                                <Button variant="success" size="sm" onClick={() => handleAcceptBid(bid.id)}><FaCheck /> Accept</Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {/* Close Bidding Modal */}
            <Modal show={showCloseModal} onHide={() => setShowCloseModal(false)}>
                <Modal.Header closeButton><Modal.Title>Close Bidding</Modal.Title></Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to close bidding without accepting any bid?</p>
                    <p className="text-muted">All bids will be rejected and the product will be marked as bidding closed.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCloseModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleCloseBidding}>Close Bidding</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ViewBids;
