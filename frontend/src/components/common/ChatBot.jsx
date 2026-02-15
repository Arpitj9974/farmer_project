import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { FaPaperPlane, FaTimes, FaRobot, FaUser } from 'react-icons/fa';
import api from '../../services/api';

const ChatBot = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hello! I am your Agri-Assistant. Ask me about crop prices, market trends, or farming tips.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            console.log('Sending request to /prices/search with:', userMessage.text);
            const res = await api.post('/prices/search', { query: userMessage.text });
            console.log('Response:', res);
            const botMessage = { role: 'assistant', text: res.data.answer };
            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            console.error('ChatBot Error Details:', err);
            let errorMsg = 'Sorry, I am having trouble connecting to the server right now.';

            if (err.response && err.response.data && err.response.data.message) {
                errorMsg = `Error: ${err.response.data.message}`;
            }

            setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="h-100 border-0 rounded-0 shadow-lg d-flex flex-column">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center py-3">
                <div className="d-flex align-items-center">
                    <FaRobot className="me-2" size={20} />
                    <strong>Agri-Assistant</strong>
                </div>
                <Button variant="link" className="text-white p-0" onClick={onClose}><FaTimes size={20} /></Button>
            </Card.Header>
            <Card.Body className="p-3 bg-light d-flex flex-column" style={{ flex: 1, overflowY: 'auto' }} ref={scrollRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="me-2 mt-1 flex-shrink-0">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                    <FaRobot size={16} />
                                </div>
                            </div>
                        )}
                        <div
                            className={`p-3 rounded-3 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                            style={{ maxWidth: '85%', whiteSpace: 'pre-line', fontSize: '0.95rem' }}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="d-flex justify-content-start mb-3">
                        <div className="bg-white p-3 rounded-3 shadow-sm text-muted fst-italic">
                            <Spinner animation="grow" size="sm" className="me-2" /> Thinking...
                        </div>
                    </div>
                )}
            </Card.Body>
            <Card.Footer className="bg-white border-top p-3">
                <Form onSubmit={handleSend}>
                    <InputGroup>
                        <Form.Control
                            placeholder="Ask anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                            className="border-end-0"
                            style={{ padding: '0.7rem' }}
                        />
                        <Button variant="outline-primary" type="submit" disabled={loading} className="border-start-0 px-4">
                            <FaPaperPlane />
                        </Button>
                    </InputGroup>
                </Form>
            </Card.Footer>
        </Card>
    );
};

export default ChatBot;
