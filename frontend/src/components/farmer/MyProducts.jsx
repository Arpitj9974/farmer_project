import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form, Pagination } from 'react-bootstrap';
import { FaEye, FaGavel, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Loader from '../common/Loader';

const UPLOAD_URL = process.env.REACT_APP_UPLOAD_URL || 'http://localhost:5000/uploads';

const MyProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: '', selling_mode: '' });
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        fetchProducts();
    }, [page, filter]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 12, ...filter });
            const res = await api.get(`/products/farmer/my-products?${params}`);
            setProducts(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${productId}`);
            toast.success('Product deleted');
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        }
    };

    const getStatusBadge = (status) => {
        const colors = { active: 'success', pending_approval: 'warning', sold: 'secondary', bidding_closed: 'info', rejected: 'danger' };
        return <Badge bg={colors[status] || 'secondary'}>{status.replace('_', ' ')}</Badge>;
    };

    if (loading && products.length === 0) return <Loader />;

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Products</h2>
                <Link to="/farmer/add-product" className="btn btn-primary">+ Add Product</Link>
            </div>

            {/* Filters */}
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Select value={filter.status} onChange={e => { setFilter({ ...filter, status: e.target.value }); setPage(1); }}>
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="pending_approval">Pending Approval</option>
                                <option value="sold">Sold</option>
                                <option value="bidding_closed">Bidding Closed</option>
                            </Form.Select>
                        </Col>
                        <Col md={4}>
                            <Form.Select value={filter.selling_mode} onChange={e => { setFilter({ ...filter, selling_mode: e.target.value }); setPage(1); }}>
                                <option value="">All Modes</option>
                                <option value="fixed_price">Fixed Price</option>
                                <option value="bidding">Bidding</option>
                            </Form.Select>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="empty-state"><p>No products found. Start by adding your first product!</p></div>
            ) : (
                <Row className="g-4">
                    {products.map(product => (
                        <Col md={4} lg={3} key={product.id}>
                            <Card className="product-card h-100">
                                <Card.Img variant="top" src={product.primary_image ? (product.primary_image.startsWith('http') ? product.primary_image : `${UPLOAD_URL}/${product.primary_image.replace(/^\/+/, '')}`) : '/placeholder.jpg'} style={{ height: '200px', objectFit: 'cover' }} />
                                <Card.Body>
                                    <div className="d-flex justify-content-between mb-2">
                                        {getStatusBadge(product.status)}
                                        <Badge bg={product.selling_mode === 'bidding' ? 'purple' : 'info'}>{product.selling_mode === 'bidding' ? '🔨 Bidding' : '💰 Fixed'}</Badge>
                                    </div>
                                    <Card.Title className="h6">{product.name}</Card.Title>
                                    <p className="mb-1"><small className="text-muted">{product.quantity_kg} kg available</small></p>
                                    <p className="fw-bold text-success mb-2">
                                        ₹{product.selling_mode === 'fixed_price' ? product.fixed_price : product.current_highest_bid || product.base_price}/kg
                                        {product.selling_mode === 'bidding' && product.current_highest_bid > 0 && <small className="text-muted"> (highest bid)</small>}
                                    </p>
                                    <div className="d-flex gap-2">
                                        <Link to={`/products/${product.id}`} className="btn btn-sm btn-outline-primary"><FaEye /></Link>
                                        {product.selling_mode === 'bidding' && product.status === 'active' && (
                                            <Link to={`/farmer/products/${product.id}/bids`} className="btn btn-sm btn-outline-success"><FaGavel /> Bids</Link>
                                        )}
                                        {product.status === 'pending_approval' && (
                                            <Button variant="outline-secondary" size="sm"><FaEdit /></Button>
                                        )}
                                        {['pending_approval', 'rejected'].includes(product.status) && (
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(product.id)}><FaTrash /></Button>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                        <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
                        {[...Array(pagination.totalPages)].map((_, i) => (
                            <Pagination.Item key={i + 1} active={page === i + 1} onClick={() => setPage(i + 1)}>{i + 1}</Pagination.Item>
                        ))}
                        <Pagination.Next disabled={page === pagination.totalPages} onClick={() => setPage(page + 1)} />
                    </Pagination>
                </div>
            )}
        </Container>
    );
};

export default MyProducts;
