import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Tabs, Tab } from 'react-bootstrap';
import { FaMoneyBillWave, FaArrowDown, FaArrowUp, FaTruck } from 'react-icons/fa';
import api from '../../services/api';

const TransactionHistory = ({ role }) => {
    const [transactions, setTransactions] = useState([]);

    // Simulate transactions based on orders (In a real app, this would be a separate API)
    useEffect(() => {
        const fetchTxns = async () => {
            const endpoint = role === 'farmer' ? '/orders/my-orders?payment_status=completed' : '/orders/my-orders?payment_status=completed';
            try {
                const res = await api.get(endpoint);
                const orders = res.data.data;
                const txns = orders.map(o => ({
                    id: o.transaction_id || `TXN_${o.id}`,
                    date: o.delivered_at || o.created_at,
                    amount: role === 'farmer' ? (o.total_amount - o.commission_amount) : o.total_amount,
                    type: role === 'farmer' ? 'credit' : 'debit',
                    description: role === 'farmer' ? `Payment for ${o.product_name}` : `Purchase of ${o.product_name}`,
                    status: 'success'
                }));
                setTransactions(txns);
            } catch (e) {
                console.error(e);
            }
        };
        fetchTxns();
    }, [role]);

    return (
        <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom-0 py-3">
                <h5 className="mb-0 text-primary">
                    <FaMoneyBillWave className="me-2" />
                    {role === 'farmer' ? 'Recent Payments Received' : 'Payment History'}
                </h5>
            </Card.Header>
            <Card.Body className="p-0">
                <Table hover responsive className="mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th>Transaction ID</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? transactions.map((txn, i) => (
                            <tr key={i}>
                                <td className="small font-monospace text-muted">{txn.id}</td>
                                <td>{new Date(txn.date).toLocaleDateString()}</td>
                                <td>
                                    {txn.type === 'credit' ? <FaArrowDown className="text-success me-1 small" /> : <FaArrowUp className="text-danger me-1 small" />}
                                    {txn.description}
                                </td>
                                <td className={`fw-bold ${txn.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                                    {txn.type === 'credit' ? '+' : '-'} ₹{parseFloat(txn.amount).toLocaleString()}
                                </td>
                                <td><Badge bg="success">Success</Badge></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="text-center text-muted py-4">No completed transactions yet</td></tr>
                        )}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default TransactionHistory;
