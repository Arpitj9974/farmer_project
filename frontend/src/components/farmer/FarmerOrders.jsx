import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Form, Row, Col, Modal, Tabs, Tab } from 'react-bootstrap';
import { FaFileInvoice, FaCheck, FaEye, FaTruck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Loader from '../common/Loader';
import TransactionHistory from '../common/TransactionHistory';
import DashboardLayout from '../common/Layout/DashboardLayout';

const FarmerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ order_status: '', payment_status: '' });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filter);
            const res = await api.get(`/orders/my-orders?${params}`);
            setOrders(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order marked as ${newStatus}`);
            fetchOrders();
            setShowModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const getNextStatus = (current) => {
        const flow = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready', ready: 'delivered' };
        return flow[current];
    };

    const downloadInvoice = async (orderId) => {
        try {
            const res = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Invoice not available');
        }
    };

    const getStatusBadge = (status) => {
        const colors = { pending: 'warning', confirmed: 'info', preparing: 'primary', ready: 'success', delivered: 'success' };
        return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
    };

    if (loading) return <Loader />;

    return (
        <DashboardLayout role="farmer">
            <Container className="py-4">
                <h2 className="mb-4">Orders & Shipments</h2>

                <Tabs defaultActiveKey="orders" className="mb-4">
                    <Tab eventKey="orders" title="All Orders">
                        <Card className="mb-4 border-0 shadow-sm bg-light">
                            <Card.Body>
                                {/* Filter Bar */}
                                <Row>
                                    <Col md={4}>
                                        <Form.Select value={filter.order_status} onChange={e => setFilter({ ...filter, order_status: e.target.value })}>
                                            <option value="">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="preparing">Preparing</option>
                                            <option value="ready">Ready</option>
                                            <option value="delivered">Delivered</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Select value={filter.payment_status} onChange={e => setFilter({ ...filter, payment_status: e.target.value })}>
                                            <option value="">All Payment Status</option>
                                            <option value="pending">Payment Pending</option>
                                            <option value="completed">Payment Completed</option>
                                        </Form.Select>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {orders.length === 0 ? (
                            <div className="empty-state p-5 text-center bg-light rounded"><p className="text-muted">No orders yet</p></div>
                        ) : (
                            <Card className="shadow-sm border-0">
                                <Card.Body className="p-0">
                                    <Table responsive hover className="mb-0">
                                        <thead className="bg-light"><tr><th>Order #</th><th>Product</th><th>Buyer</th><th>Qty</th><th>Amount</th><th>Your Earnings</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order.id}>
                                                    <td className="fw-bold">{order.order_number}</td>
                                                    <td>{order.product_name}</td>
                                                    <td>{order.buyer_name}<br /><small className="text-muted">{order.business_name}</small></td>
                                                    <td>{order.quantity_kg} kg</td>
                                                    <td>₹{parseFloat(order.total_amount).toLocaleString()}</td>
                                                    <td className="text-success fw-bold">₹{(parseFloat(order.total_amount) - parseFloat(order.commission_amount)).toLocaleString()}</td>
                                                    <td>{getStatusBadge(order.order_status)}</td>
                                                    <td><Badge bg={order.payment_status === 'completed' ? 'success' : 'warning'}>{order.payment_status}</Badge></td>
                                                    <td>
                                                        <div className="d-flex gap-1">
                                                            <Button variant="outline-primary" size="sm" onClick={() => { setSelectedOrder(order); setShowModal(true); }}><FaEye /></Button>
                                                            {order.payment_status === 'completed' && <Button variant="outline-secondary" size="sm" onClick={() => downloadInvoice(order.id)}><FaFileInvoice /></Button>}
                                                            {order.order_status !== 'delivered' && getNextStatus(order.order_status) && (
                                                                <Button variant="success" size="sm" onClick={() => updateStatus(order.id, getNextStatus(order.order_status))}><FaCheck /> {getNextStatus(order.order_status)}</Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        )}
                    </Tab>

                    <Tab eventKey="payments_delivery" title="Payments & Delivery">
                        <Row>
                            <Col lg={12} className="mb-4">
                                <TransactionHistory role="farmer" />
                            </Col>
                            <Col lg={12}>
                                <Card className="shadow-sm border-0">
                                    <Card.Header className="bg-white py-3 border-bottom-0"><h5 className="mb-0 text-info"><FaTruck className="me-2" /> Pending Shipments</h5></Card.Header>
                                    <Card.Body className="p-0">
                                        <Table hover responsive className="mb-0">
                                            <thead className="bg-light"><tr><th>Order</th><th>Buyer</th><th>Address</th><th>Current Status</th><th>Action</th></tr></thead>
                                            <tbody>
                                                {orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.order_status)).length > 0 ? (
                                                    orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.order_status)).map(order => (
                                                        <tr key={order.id}>
                                                            <td>{order.order_number}<br /><small>{order.product_name}</small></td>
                                                            <td>{order.buyer_name}</td>
                                                            <td className="small text-muted" style={{ maxWidth: '200px' }}>{order.buyer_address || '123 Farm Road, Village Area, District'}</td>
                                                            <td>{getStatusBadge(order.order_status)}</td>
                                                            <td>
                                                                {getNextStatus(order.order_status) && (
                                                                    <Button variant="success" size="sm" onClick={() => updateStatus(order.id, getNextStatus(order.order_status))}>
                                                                        Mark {getNextStatus(order.order_status)}
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="5" className="text-center text-muted py-4">No pending shipments</td></tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab>
                </Tabs>

                {/* Order Detail Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                    <Modal.Header closeButton><Modal.Title>Order Details</Modal.Title></Modal.Header>
                    <Modal.Body>
                        {selectedOrder && (
                            <Row>
                                <Col md={6}>
                                    <h6>Order Info</h6>
                                    <p><strong>Order #:</strong> {selectedOrder.order_number}</p>
                                    <p><strong>Product:</strong> {selectedOrder.product_name}</p>
                                    <p><strong>Quantity:</strong> {selectedOrder.quantity_kg} kg</p>
                                    <p><strong>Price/kg:</strong> ₹{selectedOrder.price_per_kg}</p>
                                </Col>
                                <Col md={6}>
                                    <h6>Payment Breakdown</h6>
                                    <p><strong>Total Amount:</strong> ₹{parseFloat(selectedOrder.total_amount).toLocaleString()}</p>
                                    <p><strong>Commission (5%):</strong> -₹{parseFloat(selectedOrder.commission_amount).toLocaleString()}</p>
                                    <p className="text-success fw-bold"><strong>Your Earnings:</strong> ₹{(parseFloat(selectedOrder.total_amount) - parseFloat(selectedOrder.commission_amount)).toLocaleString()}</p>
                                </Col>
                                <Col md={12} className="mt-3">
                                    <h6>Delivery Status</h6>
                                    <div className="d-flex justify-content-between position-relative mt-4 mb-2 px-3">
                                        {['pending', 'confirmed', 'preparing', 'ready', 'delivered'].map((status, i) => {
                                            const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
                                            const currentIndex = statusOrder.indexOf(selectedOrder.order_status);
                                            const isCompleted = i <= currentIndex;
                                            return (
                                                <div key={status} className="text-center" style={{ zIndex: 1, width: '20%' }}>
                                                    <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${isCompleted ? 'bg-success text-white shadow' : 'bg-light text-muted border'}`} style={{ width: 32, height: 32 }}>
                                                        {isCompleted ? <FaCheck size={12} /> : i + 1}
                                                    </div>
                                                    <small className={`fw-bold ${isCompleted ? 'text-success' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>{status.toUpperCase()}</small>
                                                </div>
                                            );
                                        })}
                                        <div className="position-absolute top-0 start-0 w-100 bg-light" style={{ height: 2, top: 16, zIndex: 0 }}></div>
                                        <div className="position-absolute top-0 start-0 bg-success transition" style={{ height: 2, top: 16, zIndex: 0, width: `${(statusOrder.indexOf(selectedOrder.order_status) / 4) * 100}%` }}></div>
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </Modal.Body>
                </Modal>
            </Container>
        </DashboardLayout>
    );
};

export default FarmerOrders;
