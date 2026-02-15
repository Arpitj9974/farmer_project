import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaLeaf, FaShoppingCart, FaChartLine, FaHandshake, FaShieldAlt, FaClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
    const { isAuthenticated, isFarmer, isBuyer } = useAuth();

    return (
        <>
            {/* Hero Section */}
            <section className="hero-section">
                <Container>
                    <h1>Direct Farm to Business Trading</h1>
                    <p>Empowering farmers with fair prices. Connecting buyers with quality produce. Zero middlemen, 5% commission, 100% transparency.</p>
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                        {!isAuthenticated ? (
                            <>
                                <Link to="/register"><Button variant="light" size="lg">Get Started</Button></Link>
                                <Link to="/products"><Button variant="outline-light" size="lg">Browse Products</Button></Link>
                            </>
                        ) : (
                            <Link to={isFarmer ? '/farmer/dashboard' : isBuyer ? '/buyer/dashboard' : '/admin/dashboard'}>
                                <Button variant="light" size="lg">Go to Dashboard</Button>
                            </Link>
                        )}
                    </div>
                </Container>
            </section>

            {/* Stats */}
            <Container className="my-5">
                <Row className="g-4 text-center">
                    {[
                        { value: '500+', label: 'Active Farmers' },
                        { value: '200+', label: 'Verified Buyers' },
                        { value: '₹2Cr+', label: 'Total Trade Value' },
                        { value: '5%', label: 'Only Commission' }
                    ].map((stat, i) => (
                        <Col md={3} key={i}>
                            <Card className="h-100">
                                <Card.Body>
                                    <h2 className="text-success fw-bold">{stat.value}</h2>
                                    <p className="text-muted mb-0">{stat.label}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* Features */}
            <Container className="my-5 py-4">
                <h2 className="text-center mb-5">Why Choose FarmerConnect?</h2>
                <Row className="g-4">
                    {[
                        { icon: <FaLeaf size={40} />, title: 'Direct Connection', desc: 'Connect directly with farmers or buyers. No middlemen, no hidden fees.' },
                        { icon: <FaChartLine size={40} />, title: 'Price Transparency', desc: 'MSP + APMC + Platform pricing visible. Make informed decisions.' },
                        { icon: <FaHandshake size={40} />, title: 'Dual Selling Modes', desc: 'Fixed price for quick sales, bidding for premium pricing.' },
                        { icon: <FaShieldAlt size={40} />, title: 'Verified Users', desc: 'All farmers and buyers verified for secure transactions.' },
                        { icon: <FaClock size={40} />, title: 'Fast Payments', desc: '24-hour payment cycle. No more waiting for weeks.' },
                        { icon: <FaShoppingCart size={40} />, title: 'Bulk Orders', desc: 'Minimum 50kg orders. Perfect for B2B trading.' }
                    ].map((feature, i) => (
                        <Col md={4} key={i}>
                            <Card className="h-100 text-center p-3">
                                <Card.Body>
                                    <div className="text-success mb-3">{feature.icon}</div>
                                    <h5>{feature.title}</h5>
                                    <p className="text-muted">{feature.desc}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* How It Works */}
            <section className="bg-light py-5">
                <Container>
                    <h2 className="text-center mb-5">How It Works</h2>
                    <Row>
                        <Col md={6} className="mb-4">
                            <Card>
                                <Card.Header className="bg-success text-white"><FaLeaf className="me-2" />For Farmers</Card.Header>
                                <Card.Body>
                                    <ol className="mb-0">
                                        <li className="mb-2">Register and get verified</li>
                                        <li className="mb-2">List your products with photos</li>
                                        <li className="mb-2">Choose fixed price or bidding mode</li>
                                        <li className="mb-2">Receive orders from verified buyers</li>
                                        <li>Get paid within 24 hours of delivery</li>
                                    </ol>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} className="mb-4">
                            <Card>
                                <Card.Header className="bg-primary text-white"><FaShoppingCart className="me-2" />For Buyers</Card.Header>
                                <Card.Body>
                                    <ol className="mb-0">
                                        <li className="mb-2">Register your business</li>
                                        <li className="mb-2">Browse quality produce</li>
                                        <li className="mb-2">Buy at fixed price or place bids</li>
                                        <li className="mb-2">Track your orders in real-time</li>
                                        <li>Rate farmers and build relationships</li>
                                    </ol>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* CTA */}
            <section className="py-5 text-center">
                <Container>
                    <h2>Ready to Transform Your Agricultural Trade?</h2>
                    <p className="text-muted mb-4">Join hundreds of farmers and buyers already benefiting from direct trade.</p>
                    <Link to="/register"><Button variant="success" size="lg">Create Free Account</Button></Link>
                </Container>
            </section>
        </>
    );
};

export default Home;
