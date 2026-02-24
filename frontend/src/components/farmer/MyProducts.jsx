import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form, Pagination, Modal } from 'react-bootstrap';
import { FaEye, FaGavel, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api, { UPLOAD_URL } from '../../services/api';
import Loader from '../common/Loader';
import DashboardLayout from '../common/Layout/DashboardLayout';

const MyProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: '', selling_mode: '' });
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    // Delete Confirmation State
    const [showDelete, setShowDelete] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    useEffect(() => {
        console.log("MyProducts mounted");
        fetchProducts();
    }, [page, filter]);

    console.log("MyProducts Render:", { loading, productsCount: products.length, filter, page });

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

    const handleDeleteClick = (productId) => {
        setProductToDelete(productId);
        setShowDelete(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        try {
            await api.delete(`/products/${productToDelete}`);
            toast.success('Product deleted successfully');
            setShowDelete(false);
            setProductToDelete(null);
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete product');
            setShowDelete(false);
            setProductToDelete(null);
        }
    };

    const getStatusBadge = (status) => {
        const colors = { active: 'success', pending_approval: 'warning', sold: 'secondary', bidding_closed: 'info', rejected: 'danger' };
        return <Badge bg={colors[status] || 'secondary'}>{status.replace('_', ' ')}</Badge>;
    };

    if (loading) return <div className="p-5 text-center"><h1>LOADING PRODUCTS...</h1></div>;

    if (!Array.isArray(products)) {
        console.error("Products is not an array:", products);
        return <div className="alert alert-danger">Error: Products data is invalid</div>;
    }

    if (products.length === 0) return <div className="p-5 text-center"><h1>NO PRODUCTS FOUND</h1></div>;

    const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80';

    const getImageUrl = (product) => {
        try {
            if (!product.primary_image) return FALLBACK_IMAGE;
            if (product.primary_image.startsWith('http')) return product.primary_image;
            return `${UPLOAD_URL}${product.primary_image}`;
        } catch (e) {
            console.error("Error generating image URL for product:", product, e);
            return FALLBACK_IMAGE;
        }
    };

    const getPageNumbers = () => {
        const totalPages = pagination.totalPages || 1;
        let startPage = Math.max(1, page - 2);
        let endPage = Math.min(totalPages, page + 2);

        if (endPage - startPage < 4) {
            if (startPage === 1) {
                endPage = Math.min(totalPages, startPage + 4);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, endPage - 4);
            }
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        return pages;
    };

    return (
        <DashboardLayout role="farmer">
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
                        {products.map(product => {
                            console.log("Rendering product:", product.id);
                            return (
                                <Col md={4} lg={3} key={product.id}>
                                    <Card className="product-card h-100">
                                        <Card.Img variant="top" src={getImageUrl(product)} style={{ height: '200px', objectFit: 'cover' }} onError={(e) => { e.target.src = FALLBACK_IMAGE; }} alt={product.name} />
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
                                                {product.status !== 'sold' && (
                                                    <Link to={`/farmer/edit-product/${product.id}`} className="btn btn-sm btn-outline-secondary">
                                                        <FaEdit />
                                                    </Link>
                                                )}
                                                {product.status !== 'sold' && (
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(product.id)} title="Delete Product"><FaTrash /></Button>
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                        <Pagination>
                            <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
                            {getPageNumbers().map((pageNum) => (
                                <Pagination.Item key={pageNum} active={page === pageNum} onClick={() => setPage(pageNum)}>{pageNum}</Pagination.Item>
                            ))}
                            <Pagination.Next disabled={page === pagination.totalPages} onClick={() => setPage(page + 1)} />
                        </Pagination>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to delete this product? This action cannot be undone.</p>
                        <p className="text-muted small mb-0">Note: Products with active orders or bids cannot be deleted.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancel</Button>
                        <Button variant="danger" onClick={confirmDelete}>Yes, Delete</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </DashboardLayout>
    );
};

export default MyProducts;
