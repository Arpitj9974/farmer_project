import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, Button, Row, Col, Card, Alert, Badge } from 'react-bootstrap';
import { FaUpload, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api, { UPLOAD_URL } from '../../services/api';
import DashboardLayout from '../common/Layout/DashboardLayout';
import Loader from '../common/Loader';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const uploadRef = React.useRef(false);
    const [product, setProduct] = useState(null);

    const [formData, setFormData] = useState({
        name: '', description: '', quantity_kg: '',
        fixed_price: '', base_price: '', quality_grade: '',
        is_organic: false, status: ''
    });

    const [newImage, setNewImage] = useState(null);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/products/${id}`);
            const p = res.data.product;
            setProduct(p);
            setFormData({
                name: p.name,
                description: p.description,
                quantity_kg: p.quantity_kg,
                fixed_price: p.fixed_price || '',
                base_price: p.base_price || '',
                quality_grade: p.quality_grade || 'A',
                is_organic: p.is_organic,
                status: p.status
            });
        } catch (err) {
            setError('Failed to load product details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image is too large (max 5MB)');
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Must be JPEG, PNG, or WEBP');
            return;
        }
        setNewImage(file);
    };

    const handleImageUpload = async () => {
        if (!newImage || uploadRef.current) return;

        uploadRef.current = true;
        setUpdating(true);
        const uploadData = new FormData();
        uploadData.append('image', newImage);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${api.defaults.baseURL}/products/${id}/image`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do not set Content-Type, letting the browser automatically set the boundary
                },
                body: uploadData
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Failed to update image');

            toast.success('Product image updated successfully');
            setNewImage(null);
            fetchProduct(); // Refresh
        } catch (err) {
            toast.error(err.message || 'Failed to update image');
        } finally {
            setUpdating(false);
            uploadRef.current = false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');

        try {
            await api.put(`/products/${id}`, formData);
            toast.success('Product updated successfully');
            navigate('/farmer/products');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update product');
        } finally {
            setUpdating(false);
        }
    };

    const getPrimaryImage = () => {
        if (!product || !product.images) return null;
        const primary = product.images.find(img => img.is_primary) || product.images[0];
        if (!primary) return null;
        if (primary.image_url.startsWith('http')) return primary.image_url;
        return `${UPLOAD_URL}${primary.image_url}`;
    };

    if (loading) return <Loader />;
    if (!product) return <Container className="py-4"><Alert variant="danger">{error}</Alert></Container>;

    // We can't edit category or selling_mode after creation to avoid breaking bids/orders.
    // Also, we cannot edit sold products at all (blocked on backend too, but good to show in UI)

    if (product.status === 'sold') {
        return (
            <DashboardLayout role="farmer">
                <Container className="py-4">
                    <Alert variant="warning">
                        <h4>Cannot Edit Sold Product</h4>
                        <p>This product has already been sold. Editing is no longer allowed to maintain order integrity.</p>
                        <Button onClick={() => navigate('/farmer/products')} variant="primary">Back to Products</Button>
                    </Alert>
                </Container>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="farmer">
            <Container className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Edit Product</h2>
                    <Badge bg={product.status === 'active' ? 'success' : 'warning'} className="fs-6">
                        {product.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Row>
                    <Col md={8}>
                        <Form onSubmit={handleSubmit}>
                            <Card className="mb-4">
                                <Card.Header>Product Details</Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Product Name</Form.Label>
                                                <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Category</Form.Label>
                                                <Form.Control type="text" value={product.category_name} disabled readOnly />
                                                <Form.Text className="text-muted">Category cannot be changed after creation.</Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} minLength={20} required />
                                    </Form.Group>

                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Quantity (kg)</Form.Label>
                                                <Form.Control type="number" step="0.1" name="quantity_kg" value={formData.quantity_kg} onChange={handleChange} min="1" required />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Quality Grade</Form.Label>
                                                <Form.Select name="quality_grade" value={formData.quality_grade} onChange={handleChange}>
                                                    <option value="A+">A+ (Premium)</option>
                                                    <option value="A">A (Standard)</option>
                                                    <option value="B">B (Economy)</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3 mt-4">
                                                <Form.Check type="checkbox" name="is_organic" label="Organic Certified" checked={formData.is_organic} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        {product.selling_mode === 'fixed_price' ? (
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Fixed Price per kg (₹)</Form.Label>
                                                    <Form.Control type="number" step="0.01" name="fixed_price" value={formData.fixed_price} onChange={handleChange} min="0.01" required />
                                                </Form.Group>
                                            </Col>
                                        ) : (
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Base Price per kg (₹)</Form.Label>
                                                    <Form.Control type="number" step="0.01" name="base_price" value={formData.base_price} onChange={handleChange} required disabled={product.bid_count > 0} />
                                                    {product.bid_count > 0 && <Form.Text className="text-danger">Base price cannot be changed because bids have been placed.</Form.Text>}
                                                </Form.Group>
                                            </Col>
                                        )}
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Status</Form.Label>
                                                <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                                    <option value="active">Active</option>
                                                    <option value="paused">Paused (Hidden from buyers)</option>
                                                    {/* Only allow changing back to pending if it was already pending/rejected */}
                                                    {['pending_approval', 'rejected'].includes(product.status) && (
                                                        <option value="pending_approval">Pending Approval</option>
                                                    )}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Button type="submit" className="btn-primary mt-3" disabled={updating}>
                                        {updating ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Form>
                    </Col>

                    <Col md={4}>
                        <Card className="mb-4">
                            <Card.Header>Product Image</Card.Header>
                            <Card.Body className="text-center">
                                <div className="mb-3">
                                    <img
                                        src={newImage ? URL.createObjectURL(newImage) : getPrimaryImage()}
                                        alt="Product"
                                        className="img-fluid rounded"
                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                    />
                                </div>

                                <div className="d-grid gap-2">
                                    <Button variant="outline-primary" as="label">
                                        <FaUpload className="me-2" /> Select New Image
                                        <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
                                    </Button>

                                    {newImage && (
                                        <Button variant="success" onClick={handleImageUpload}>
                                            Upload & Replace Image
                                        </Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>

                        {product.selling_mode === 'bidding' && (
                            <Card>
                                <Card.Header>Bidding Status</Card.Header>
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span>Total Bids:</span>
                                        <strong>{product.bid_count}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Current Highest:</span>
                                        <strong className="text-success fs-5">
                                            {product.derived_highest_bid > 0 ? `₹${product.derived_highest_bid}/kg` : 'No bids yet'}
                                        </strong>
                                    </div>
                                    <div className="mt-3 text-center">
                                        <Button variant="outline-secondary" size="sm" onClick={() => navigate(`/farmer/products/${product.id}/bids`)}>
                                            View All Bids
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>
            </Container>
        </DashboardLayout>
    );
};

export default EditProduct;
