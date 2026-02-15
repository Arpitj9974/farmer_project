import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Loader from '../common/Loader';

const VerifyUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [action, setAction] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await api.get('/admin/pending-verifications');
            setUsers(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        try {
            await api.put(`/admin/verify/${selectedUser.id}`, { action, notes });
            toast.success(`User ${action}d successfully`);
            setShowModal(false);
            fetchPending();
        } catch (err) {
            toast.error('Failed to verify user');
        }
    };

    if (loading) return <Loader />;

    return (
        <Container className="py-4">
            <h2 className="mb-4">Verify Users</h2>

            {users.length === 0 ? (
                <Card className="text-center p-5">
                    <FaCheck size={40} className="text-success mx-auto mb-3" />
                    <h5>All caught up!</h5>
                    <p className="text-muted">No pending verifications</p>
                </Card>
            ) : (
                <Card>
                    <Card.Body className="p-0">
                        <Table responsive hover className="mb-0">
                            <thead><tr><th>Name</th><th>Email</th><th>Type</th><th>Details</th><th>Registered</th><th>Actions</th></tr></thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td><Badge bg={user.user_type === 'farmer' ? 'success' : 'primary'}>{user.user_type}</Badge></td>
                                        <td>
                                            {user.user_type === 'farmer' ? (
                                                <small>{user.city}, {user.state} • {user.farm_size} acres</small>
                                            ) : (
                                                <small>{user.business_name} ({user.business_type})<br />{user.gst_number || 'No GST'}</small>
                                            )}
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <Button variant="success" size="sm" className="me-1" onClick={() => { setSelectedUser(user); setAction('approve'); setShowModal(true); }}><FaCheck /></Button>
                                            <Button variant="danger" size="sm" onClick={() => { setSelectedUser(user); setAction('reject'); setShowModal(true); }}><FaTimes /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{action === 'approve' ? 'Approve' : 'Reject'} User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>{selectedUser?.name}</strong> ({selectedUser?.email})</p>
                    <Form.Group>
                        <Form.Label>Admin Notes</Form.Label>
                        <Form.Control as="textarea" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder={action === 'reject' ? 'Reason for rejection (required)' : 'Optional notes'} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant={action === 'approve' ? 'success' : 'danger'} onClick={handleAction} disabled={action === 'reject' && !notes}>
                        {action === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default VerifyUsers;
