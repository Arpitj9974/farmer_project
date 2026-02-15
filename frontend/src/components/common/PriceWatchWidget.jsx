import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Alert } from 'react-bootstrap';
import { FaEye, FaArrowUp, FaArrowDown, FaTrash } from 'react-icons/fa';
import api from '../../services/api';

// Reusing the same crop list structure
const CROP_TYPES = {
    'Grains & Cereals': [
        'Rice - Basmati', 'Rice - Sona Masuri', 'Wheat - Sharbati', 'Maize - Yellow', 'Jowar', 'Bajra', 'Ragi'
    ],
    'Vegetables': [
        'Tomato', 'Onion', 'Potato', 'Bottle Gourd', 'Bitter Gourd', 'Spinach', 'Cauliflower', 'Brinjal', 'Ladyfinger'
    ],
    'Fruits': [
        'Mango - Alphonso', 'Mango - Kesar', 'Banana - Robusta', 'Papaya', 'Guava', 'Pomegranate', 'Chickoo', 'Apple'
    ]
};

const PriceWatchWidget = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [selectedCrop, setSelectedCrop] = useState('');
    const [displayData, setDisplayData] = useState({});

    // Load watchlist from API
    useEffect(() => {
        fetchWatchlist();
    }, []);

    const fetchWatchlist = async () => {
        try {
            const res = await api.get('/products/farmer/watchlist');
            const list = res.data.watchlist || [];
            if (list.length === 0) {
                // Determine defaults based on user (optional, but good for UX) or just empty
                // For now, let's keep it empty or maybe just 'Jowar', 'Brinjal' as defaults if really needed
                // But user wants "their own", so empty is better for "fresh" personalization
                setWatchlist([]);
            } else {
                setWatchlist(list);
                fetchPrices(list);
            }
        } catch (err) {
            console.error('Failed to load watchlist', err);
        }
    };

    const fetchPrices = async (list) => {
        const newData = {};
        for (const item of list) {
            try {
                const res = await api.get(`/products/price-guidance/1?crop_name=${encodeURIComponent(item)}`);
                if (res.data.guidance) {
                    newData[item] = res.data.guidance;
                }
            } catch (err) {
                console.error('Failed to fetch price for', item);
            }
        }
        setDisplayData(prev => ({ ...prev, ...newData }));
    };

    const updateRemoteWatchlist = async (newList) => {
        try {
            await api.post('/products/farmer/watchlist', { watchlist: newList });
        } catch (err) {
            console.error('Failed to update remote watchlist', err);
        }
    };

    const addToWatchlist = () => {
        if (selectedCrop && !watchlist.includes(selectedCrop)) {
            const newList = [...watchlist, selectedCrop];
            setWatchlist(newList);
            fetchPrices([selectedCrop]);
            updateRemoteWatchlist(newList); // Save to DB
            setSelectedType('');
            setSelectedCrop('');
        }
    };

    const removeFromWatchlist = (crop) => {
        const newList = watchlist.filter(item => item !== crop);
        setWatchlist(newList);
        updateRemoteWatchlist(newList); // Save to DB
    };



    return (
        <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white py-3">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 text-success"><FaEye className="me-2" /> Daily Price Watch</h5>
                    <span className="badge bg-success bg-opacity-10 text-success">Live Updates</span>
                </div>
            </Card.Header>
            <Card.Body>
                {/* Add New Item */}
                <div className="bg-light p-3 rounded mb-4">
                    <Row className="g-2 align-items-end">
                        <Col md={5}>
                            <Form.Label className="small text-muted">Category</Form.Label>
                            <Form.Select size="sm" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                                <option value="">Select Category</option>
                                {Object.keys(CROP_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={5}>
                            <Form.Label className="small text-muted">Crop</Form.Label>
                            <Form.Select size="sm" value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)} disabled={!selectedType}>
                                <option value="">Select Crop</option>
                                {selectedType && CROP_TYPES[selectedType]?.map(c => <option key={c} value={c}>{c}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <button className="btn btn-sm btn-success w-100" onClick={addToWatchlist} disabled={!selectedCrop}>
                                Add
                            </button>
                        </Col>
                    </Row>
                </div>

                {/* Watchlist Items */}
                {watchlist.length === 0 ? (
                    <div className="text-center text-muted py-4">
                        <small>Add crops to track daily prices here.</small>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {watchlist.map(crop => {
                            const data = displayData[crop];
                            const trend = Math.random() > 0.5 ? 'up' : 'down'; // Simulated trend

                            return (
                                <div key={crop} className="border rounded p-3 position-relative hover-shadow transition">
                                    <button
                                        className="btn btn-link text-danger p-0 position-absolute top-0 end-0 mt-2 me-2"
                                        onClick={() => removeFromWatchlist(crop)}
                                        style={{ opacity: 0.5 }}
                                    >
                                        <FaTrash size={12} />
                                    </button>

                                    <h6 className="fw-bold mb-2">{crop}</h6>

                                    {data ? (
                                        <Row className="g-0 text-center small">
                                            <Col xs={4} className="border-end">
                                                <div className="text-muted mb-1">MSP (Govt)</div>
                                                <div className="fw-bold">₹{data.msp_per_kg || '--'}</div>
                                            </Col>
                                            <Col xs={4} className="border-end">
                                                <div className="text-muted mb-1">Market Avg</div>
                                                <div className="fw-bold text-dark">₹{data.apmc_avg_per_kg || '--'}</div>
                                            </Col>
                                            <Col xs={4}>
                                                <div className="text-muted mb-1">Today's Range</div>
                                                <div className={`fw-bold ${trend === 'up' ? 'text-success' : 'text-danger'}`}>
                                                    ₹{data.suggested_min} - ₹{data.suggested_max}
                                                    {trend === 'up' ? <FaArrowUp className="ms-1 small" /> : <FaArrowDown className="ms-1 small" />}
                                                </div>
                                            </Col>
                                        </Row>
                                    ) : (
                                        <div className="text-center text-muted small py-2">Loading price data...</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default PriceWatchWidget;
