import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Spinner } from 'react-bootstrap';
import { FaSearch, FaLeaf, FaRobot } from 'react-icons/fa';
import api from '../../services/api';
import AgriAssistant from '../ai/AgriAssistant';
import { locationData, commodityGroups } from '../../utils/marketData';

const MarketPrices = () => {
    const [mspData, setMspData] = useState([]);
    const [apmcData, setApmcData] = useState([]);
    const [loadingMsp, setLoadingMsp] = useState(true);
    const [loadingApmc, setLoadingApmc] = useState(false);
    const [showChat, setShowChat] = useState(false);

    // Filters matching the Agmarknet interface
    const [filters, setFilters] = useState({
        state: 'Gujarat',
        district: 'All Districts',
        market: 'All Markets',
        commodityGroup: 'Vegetables',
        commodity: 'All Commodities',
        variety: 'All Varieties',
        grade: 'FAQ'
    });

    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [availableMarkets, setAvailableMarkets] = useState([]);
    const [availableCommodities, setAvailableCommodities] = useState([]);

    useEffect(() => {
        fetchMSP();
        // Initialize cascading dropdowns based on default/initial state
        updateCascadingOptions('state', filters.state);
        updateCascadingOptions('commodityGroup', filters.commodityGroup);
    }, []);

    const fetchMSP = async () => {
        try {
            const res = await api.get('/prices/msp');
            setMspData(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMsp(false);
        }
    };

    const updateCascadingOptions = (field, value) => {
        if (field === 'state') {
            const dists = locationData[value] ? Object.keys(locationData[value]) : [];
            setAvailableDistricts(['All Districts', ...dists]);

            // Reset downstream filters
            setFilters(prev => ({
                ...prev,
                state: value,
                district: 'All Districts',
                market: 'All Markets'
            }));
            setAvailableMarkets(['All Markets']);
        }
        else if (field === 'district') {
            let mkts = ['All Markets'];
            // If a specific district is selected, show its markets
            if (value !== 'All Districts' && locationData[filters.state] && locationData[filters.state][value]) {
                mkts = ['All Markets', ...locationData[filters.state][value]];
            }
            // If "All Districts" is selected, we could show ALL markets of the state, 
            // but usually Agmarknet resets to "All Markets" (implied filter by state only).

            setAvailableMarkets(mkts);
            setFilters(prev => ({ ...prev, district: value, market: 'All Markets' }));
        }
        else if (field === 'commodityGroup') {
            let comms = ['All Commodities'];
            if (value !== 'All Groups' && commodityGroups[value]) {
                comms = ['All Commodities', ...commodityGroups[value]];
            }
            setAvailableCommodities(comms);
            setFilters(prev => ({ ...prev, commodityGroup: value, commodity: 'All Commodities' }));
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        if (['state', 'district', 'commodityGroup'].includes(name)) {
            updateCascadingOptions(name, value);
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };

    const fetchAPMC = async (e) => {
        if (e) e.preventDefault();
        setLoadingApmc(true);
        try {
            const queryParams = new URLSearchParams({
                state: filters.state === 'All States' ? '' : filters.state,
                district: filters.district.includes('All') ? '' : filters.district,
                market: filters.market.includes('All') ? '' : filters.market,
                commodity: filters.commodity.includes('All') ? '' : filters.commodity
            }).toString();

            const res = await api.get(`/prices/apmc?${queryParams}`);
            setApmcData(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingApmc(false);
        }
    };

    return (
        <div className="d-flex" style={{ overflowX: 'hidden' }}>
            {/* Main Content Area */}
            <div className="flex-grow-1" style={{ transition: 'margin-right 0.3s', marginRight: showChat ? '350px' : '0' }}>
                <Container className="py-4">
                    <h2 className="mb-4 text-primary fw-bold d-flex align-items-center justify-content-between">
                        <span><FaLeaf className="me-2" />Market Prices & Insights</span>
                        {!showChat && (
                            <Button variant="outline-primary" onClick={() => setShowChat(true)}>
                                <FaRobot className="me-2" /> Ask AI Assistant
                            </Button>
                        )}
                    </h2>

                    <Row className="g-4">
                        {/* MSP List */}
                        <Col lg={3}>
                            <Card className="h-100 shadow-sm border-0">
                                <Card.Header className="bg-success text-white py-3">
                                    <h5 className="mb-0">MSP (2025-26)</h5>
                                </Card.Header>
                                <Card.Body className="p-0" style={{ maxHeight: '700px', overflowY: 'auto' }}>
                                    {loadingMsp ? <div className="p-4 text-center"><Spinner animation="border" variant="success" /></div> : (
                                        <Table striped hover responsive className="mb-0 text-sm">
                                            <thead className="sticky-top bg-light">
                                                <tr>
                                                    <th>Crop</th>
                                                    <th className="text-end">MSP (₹)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mspData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="small">{item.crop}</td>
                                                        <td className="text-end fw-bold text-success small">{item.msp}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* APMC Section */}
                        <Col lg={9}>
                            <Card className="shadow-sm border-0 mb-4">
                                <Card.Header className="bg-white border-bottom py-3">
                                    <h5 className="mb-0 text-primary">Price & Arrival Reports (APMC)</h5>
                                </Card.Header>
                                <Card.Body className="bg-light">
                                    <Form onSubmit={fetchAPMC}>
                                        <Row className="g-3">
                                            <Col md={3}>
                                                <Form.Label className="small text-muted fw-bold">State</Form.Label>
                                                <Form.Select name="state" value={filters.state} onChange={handleFilterChange} size="sm">
                                                    {Object.keys(locationData).map(st => <option key={st}>{st}</option>)}
                                                </Form.Select>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Label className="small text-muted fw-bold">District</Form.Label>
                                                <Form.Select name="district" value={filters.district} onChange={handleFilterChange} size="sm">
                                                    {availableDistricts.length > 0 ? (
                                                        availableDistricts.map(dist => <option key={dist}>{dist}</option>)
                                                    ) : (
                                                        <option>Select State First</option>
                                                    )}
                                                </Form.Select>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Label className="small text-muted fw-bold">Market</Form.Label>
                                                <Form.Select name="market" value={filters.market} onChange={handleFilterChange} size="sm">
                                                    {availableMarkets.length > 0 ? (
                                                        availableMarkets.map(mkt => <option key={mkt}>{mkt}</option>)
                                                    ) : (
                                                        <option>Select District First</option>
                                                    )}
                                                </Form.Select>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Label className="small text-muted fw-bold">Commodity Group</Form.Label>
                                                <Form.Select name="commodityGroup" value={filters.commodityGroup} onChange={handleFilterChange} size="sm">
                                                    {Object.keys(commodityGroups).map(grp => <option key={grp}>{grp}</option>)}
                                                </Form.Select>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Label className="small text-muted fw-bold">Commodity</Form.Label>
                                                <Form.Select name="commodity" value={filters.commodity} onChange={handleFilterChange} size="sm">
                                                    {availableCommodities.length > 0 ? (
                                                        availableCommodities.map(comm => <option key={comm}>{comm}</option>)
                                                    ) : (
                                                        <option>All</option>
                                                    )}
                                                </Form.Select>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Label className="small text-muted fw-bold">Variety</Form.Label>
                                                <Form.Select name="variety" value={filters.variety} onChange={handleFilterChange} size="sm">
                                                    <option>All Varieties</option>
                                                    <option>FAQ</option>
                                                    <option>Desi</option>
                                                    <option>Hybrid</option>
                                                </Form.Select>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Label className="small text-muted fw-bold">Grade</Form.Label>
                                                <Form.Select name="grade" value={filters.grade} onChange={handleFilterChange} size="sm">
                                                    <option>FAQ</option>
                                                    <option>Medium</option>
                                                    <option>Best</option>
                                                </Form.Select>
                                            </Col>
                                            <Col md={3} className="d-flex align-items-end">
                                                <Button variant="primary" type="submit" className="w-100" disabled={loadingApmc} size="sm">
                                                    {loadingApmc ? <Spinner size="sm" /> : <><FaSearch className="me-2" />Go</>}
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Card.Body>
                            </Card>

                            {apmcData.length > 0 ? (
                                <Card className="shadow-sm border-0">
                                    <Card.Body className="p-0">
                                        <Table responsive hover className="mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>Commodity</th>
                                                    <th>Market</th>
                                                    <th>Arrival Date</th>
                                                    <th className="text-end">Min Price</th>
                                                    <th className="text-end">Max Price</th>
                                                    <th className="text-end">Modal Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {apmcData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <div className="fw-bold text-dark">{item.commodity}</div>
                                                            <small className="text-muted">{item.variety || 'FAQ'}</small>
                                                        </td>
                                                        <td>
                                                            <div>{item.market}</div>
                                                            <small className="text-muted">{item.district}, {item.state}</small>
                                                        </td>
                                                        <td className="text-muted small">{item.arrival_date}</td>
                                                        <td className="text-end">₹{item.min_price}</td>
                                                        <td className="text-end">₹{item.max_price}</td>
                                                        <td className="text-end"><Badge bg="success" className="px-2 py-1">₹{item.modal_price}</Badge></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            ) : (
                                !loadingApmc && <div className="text-center py-5 text-muted bg-white rounded shadow-sm">
                                    <h5 className="mb-2">Ready to Load Data</h5>
                                    <p>Select your filters and click "Go" to view latest market prices.</p>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Chatbot Sidebar */}
            <div
                className="bg-white shadow-lg border-start position-fixed top-0 end-0 h-100"
                style={{
                    width: '350px',
                    zIndex: 1040,
                    transform: showChat ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s ease-in-out',
                    paddingTop: '60px' // Adjust for navbar height
                }}
            >
                <div className="h-100">
                    <div className="h-100 position-relative">
                        <AgriAssistant
                            embedded={true}
                            isOpenProps={true}
                            onClose={() => setShowChat(false)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default MarketPrices;
