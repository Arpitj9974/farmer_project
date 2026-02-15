import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Badge, Pagination, InputGroup, Button } from 'react-bootstrap';
import { FaSearch, FaLeaf, FaStar } from 'react-icons/fa';
import api from '../../services/api';
import Loader from '../common/Loader';

const UPLOAD_URL = process.env.REACT_APP_UPLOAD_URL || 'http://localhost:5000/uploads';

const BrowseProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({
        search: '', category_id: '', selling_mode: '', quality_grade: '', is_organic: '', sort: 'newest'
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [page, filters]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/products/categories');
            setCategories(res.data.categories);
        } catch (err) { console.error(err); }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 12 });
            Object.entries(filters).forEach(([key, val]) => { if (val) params.append(key, val); });
            const res = await api.get(`/products?${params}`);
            setProducts(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPage(1);
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">Browse Products</h2>

            <Row>
                {/* Filters Sidebar */}
                <Col lg={3}>
                    <div className="filter-sidebar">
                        <h6>Filters</h6>

                        <Form.Group className="mb-3">
                            <InputGroup>
                                <Form.Control placeholder="Search..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
                                <Button variant="outline-success"><FaSearch /></Button>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select value={filters.category_id} onChange={e => handleFilterChange('category_id', e.target.value)}>
                                <option value="">All Categories</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Selling Mode</Form.Label>
                            <Form.Select value={filters.selling_mode} onChange={e => handleFilterChange('selling_mode', e.target.value)}>
                                <option value="">All</option>
                                <option value="fixed_price">Fixed Price</option>
                                <option value="bidding">Bidding</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Quality Grade</Form.Label>
                            <Form.Select value={filters.quality_grade} onChange={e => handleFilterChange('quality_grade', e.target.value)}>
                                <option value="">All Grades</option>
                                <option value="A+">A+ (Premium)</option>
                                <option value="A">A (Standard)</option>
                                <option value="B">B (Economy)</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check type="checkbox" label="Organic Only" checked={filters.is_organic === 'true'} onChange={e => handleFilterChange('is_organic', e.target.checked ? 'true' : '')} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Sort By</Form.Label>
                            <Form.Select value={filters.sort} onChange={e => handleFilterChange('sort', e.target.value)}>
                                <option value="newest">Newest First</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                            </Form.Select>
                        </Form.Group>
                    </div>
                </Col>

                {/* Products Grid */}
                <Col lg={9}>
                    {loading ? <Loader /> : products.length === 0 ? (
                        <div className="empty-state"><p>No products found matching your criteria</p></div>
                    ) : (
                        <>
                            <Row className="g-4">
                                {products.map(product => (
                                    <Col md={6} lg={4} key={product.id}>
                                        <Card className="product-card h-100">
                                            <div className="position-relative">
                                                <Card.Img variant="top" src={product.primary_image ? (product.primary_image.startsWith('http') ? product.primary_image : `${UPLOAD_URL}/${product.primary_image.replace(/^\/+/, '')}`) : '/placeholder.jpg'} style={{ height: '200px', objectFit: 'cover' }} />
                                                {product.is_organic && <Badge className="position-absolute top-0 start-0 m-2 badge-organic"><FaLeaf /> Organic</Badge>}
                                                <Badge className={`position-absolute top-0 end-0 m-2 ${product.selling_mode === 'bidding' ? 'badge-bidding' : 'badge-fixed'}`}>
                                                    {product.selling_mode === 'bidding' ? '🔨 Bidding' : '💰 Fixed'}
                                                </Badge>
                                            </div>
                                            <Card.Body>
                                                <Badge bg="secondary" className="mb-2">{product.category_name}</Badge>
                                                <Card.Title className="h6">{product.name}</Card.Title>
                                                <p className="mb-1"><small className="text-muted">{product.quantity_kg} kg available • Grade {product.quality_grade}</small></p>
                                                <p className="text-success fw-bold mb-2">
                                                    {product.selling_mode === 'fixed_price'
                                                        ? `₹${product.fixed_price}/kg`
                                                        : `Starting ₹${product.base_price}/kg`}
                                                </p>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <small className="text-muted"><FaStar className="text-warning" /> {product.farmer_rating || 'New'}</small>
                                                    <Link to={`/products/${product.id}`} className="btn btn-primary btn-sm">View Details</Link>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            {pagination.totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-4">
                                    <Pagination>
                                        <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
                                        {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => (
                                            <Pagination.Item key={i + 1} active={page === i + 1} onClick={() => setPage(i + 1)}>{i + 1}</Pagination.Item>
                                        ))}
                                        <Pagination.Next disabled={page === pagination.totalPages} onClick={() => setPage(page + 1)} />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default BrowseProducts;
