import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Loader from '../common/Loader';

const UPLOAD_URL = process.env.REACT_APP_UPLOAD_URL || 'http://localhost:5000/uploads';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [action, setAction] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await api.get('/admin/pending-products');
            setProducts(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        try {
            await api.put(`/admin/products/${selectedProduct.id}`, { action, reason });
            toast.success(`Product ${action}d successfully`);
            setShowModal(false);
            setReason('');
            fetchPending();
        } catch (err) {
            toast.error('Failed to manage product');
        }
    };

    if (loading) return <Loader />;

    return (
        <Container className="py-4">
            <h2 className="mb-4">Manage Products</h2>

            {products.length === 0 ? (
                <Card className="text-center p-5">
                    <FaCheck size={40} className="text-success mx-auto mb-3" />
                    <h5>All caught up!</h5>
                    <p className="text-muted">No pending products</p>
                </Card>
            ) : (
                <Card>
                    <Card.Body className="p-0">
                        <Table responsive hover className="mb-0">
                            <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Farmer</th><th>Price</th><th>Mode</th><th>Actions</th></tr></thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td><img src={product.primary_image ? `${UPLOAD_URL}${product.primary_image.replace('/uploads', '')}` : '/placeholder.jpg'} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                                        <td>{product.name}<br /><small className="text-muted">{product.quantity_kg} kg</small></td>
                                        <td>{product.category_name}</td>
                                        <td>{product.farmer_name}<br /><small className="text-muted">{product.city}</small></td>
                                        <td>₹{product.fixed_price || product.base_price}/kg</td>
                                        <td><Badge bg={product.selling_mode === 'bidding' ? 'purple' : 'info'}>{product.selling_mode}</Badge></td>
                                        <td>
                                            <Button variant="success" size="sm" className="me-1" onClick={() => { setSelectedProduct(product); setAction('approve'); setShowModal(true); }}><FaCheck /></Button>
                                            <Button variant="danger" size="sm" onClick={() => { setSelectedProduct(product); setAction('reject'); setShowModal(true); }}><FaTimes /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton><Modal.Title>{action === 'approve' ? 'Approve' : 'Reject'} Product</Modal.Title></Modal.Header>
                <Modal.Body>
                    <p><strong>{selectedProduct?.name}</strong></p>
                    <p>By: {selectedProduct?.farmer_name}</p>
                    {action === 'reject' && (
                        <Form.Group>
                            <Form.Label>Rejection Reason *</Form.Label>
                            <Form.Control as="textarea" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Please provide a reason for rejection" required />
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant={action === 'approve' ? 'success' : 'danger'} onClick={handleAction} disabled={action === 'reject' && !reason}>
                        {action === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ManageProducts;
