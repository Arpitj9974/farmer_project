import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaLeaf, FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => (
    <footer>
        <Container>
            <Row>
                <Col md={4} className="mb-4">
                    <h5><FaLeaf className="me-2" />FarmerConnect</h5>
                    <p className="text-muted mt-3">Connecting farmers directly with bulk buyers. Eliminating middlemen, ensuring fair prices.</p>
                    <div className="mt-3">
                        <a href="#" className="me-3"><FaFacebook size={20} /></a>
                        <a href="#" className="me-3"><FaTwitter size={20} /></a>
                        <a href="#"><FaInstagram size={20} /></a>
                    </div>
                </Col>
                <Col md={2} className="mb-4">
                    <h6>Quick Links</h6>
                    <ul className="list-unstyled mt-3">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/products">Products</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </ul>
                </Col>
                <Col md={3} className="mb-4">
                    <h6>For Farmers</h6>
                    <ul className="list-unstyled mt-3">
                        <li><Link to="/register">Register as Farmer</Link></li>
                        <li><Link to="/farmer/add-product">List Products</Link></li>
                        <li><Link to="/farmer/dashboard">Dashboard</Link></li>
                    </ul>
                </Col>
                <Col md={3} className="mb-4">
                    <h6>Contact</h6>
                    <ul className="list-unstyled mt-3">
                        <li><FaPhone className="me-2" />+91 98765 43210</li>
                        <li><FaEnvelope className="me-2" />support@farmerconnect.com</li>
                    </ul>
                </Col>
            </Row>
            <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <Row>
                <Col className="text-center text-muted">
                    <small>© 2024 FarmerConnect. All rights reserved. | 5% Commission Model</small>
                </Col>
            </Row>
        </Container>
    </footer>
);

export default Footer;
