import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Table, Badge, Form, Row, Col } from 'react-bootstrap';
import api from '../../services/api';
import Loader from '../common/Loader';

const MyBids = () => {
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchBids();
    }, [filter]);

    const fetchBids = async () => {
        setLoading(true);
        try {
            const params = filter ? `?status=${filter}` : '';
            const res = await api.get(`/bids/my-bids${params}`);
            setBids(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const colors = { active: 'primary', accepted: 'success', outbid: 'warning', rejected: 'danger' };
        return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
    };

    if (loading) return <Loader />;

    return (
        <Container className="py-4">
            <h2 className="mb-4">My Bids</h2>

            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Select value={filter} onChange={e => setFilter(e.target.value)}>
                                <option value="">All Bids</option>
                                <option value="active">Active</option>
                                <option value="accepted">Won</option>
                                <option value="outbid">Outbid</option>
                                <option value="rejected">Rejected</option>
                            </Form.Select>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {bids.length === 0 ? (
                <div className="empty-state">
                    <p>No bids found</p>
                    <Link to="/products" className="btn btn-primary">Browse Products</Link>
                </div>
            ) : (
                <Card>
                    <Card.Body className="p-0">
                        <Table responsive hover className="mb-0">
                            <thead><tr><th>Product</th><th>Farmer</th><th>Your Bid</th><th>Highest Bid</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                            <tbody>
                                {bids.map(bid => (
                                    <tr key={bid.id}>
                                        <td>{bid.product_name}</td>
                                        <td>{bid.farmer_name}</td>
                                        <td className="fw-bold">₹{bid.amount}/kg</td>
                                        <td>₹{bid.current_highest_bid || bid.amount}/kg</td>
                                        <td>{getStatusBadge(bid.status)}</td>
                                        <td>{new Date(bid.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <Link to={`/products/${bid.product_id}`} className="btn btn-sm btn-outline-primary">View</Link>
                                            {bid.status === 'accepted' && bid.order_id && (
                                                <Link to={`/buyer/orders`} className="btn btn-sm btn-success ms-1">Order</Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default MyBids;
