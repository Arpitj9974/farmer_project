import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Nav, Tab, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [userType, setUserType] = useState('farmer');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');

    const [formData, setFormData] = useState({
        email: '', password: '', confirmPassword: '', name: '', mobile: '',
        farm_address: '', city: '', state: '', pincode: '', farm_size: '',
        business_name: '', business_type: '', gst_number: '', business_address: ''
    });

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[!@#$%^&*]/.test(password)) strength++;
        if (strength <= 1) return 'weak';
        if (strength <= 2) return 'fair';
        if (strength <= 3) return 'good';
        return 'strong';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'password') setPasswordStrength(checkPasswordStrength(value));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 12) {
            setError('Password must be at least 12 characters');
            return;
        }

        setLoading(true);
        try {
            const userData = { ...formData, user_type: userType };
            await register(userData);
            toast.success('Registration successful!');
            navigate(userType === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '600px' }}>
                <h2>Create Account</h2>
                <p className="text-center text-muted mb-4">Join FarmerConnect today</p>

                <Tab.Container activeKey={userType} onSelect={setUserType}>
                    <Nav variant="pills" className="justify-content-center mb-4">
                        <Nav.Item><Nav.Link eventKey="farmer">🌾 Farmer</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="buyer">🛒 Buyer</Nav.Link></Nav.Item>
                    </Nav>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Full Name *</Form.Label>
                                    <Form.Control name="name" value={formData.name} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mobile *</Form.Label>
                                    <Form.Control name="mobile" value={formData.mobile} onChange={handleChange} pattern="[6-9][0-9]{9}" required />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Email *</Form.Label>
                            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password *</Form.Label>
                                    <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} minLength={12} required />
                                    {formData.password && <div className={`password-strength ${passwordStrength}`}></div>}
                                    <small className="text-muted">Min 12 chars, uppercase, lowercase, number, special char</small>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Confirm Password *</Form.Label>
                                    <Form.Control type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                        </Row>

                        {userType === 'farmer' && (
                            <>
                                <hr />
                                <h6 className="mb-3">Farm Details</h6>
                                <Form.Group className="mb-3">
                                    <Form.Label>Farm Address *</Form.Label>
                                    <Form.Control name="farm_address" value={formData.farm_address} onChange={handleChange} required />
                                </Form.Group>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>City *</Form.Label>
                                            <Form.Control name="city" value={formData.city} onChange={handleChange} required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>State *</Form.Label>
                                            <Form.Select name="state" value={formData.state} onChange={handleChange} required>
                                                <option value="">Select</option>
                                                <option value="Gujarat">Gujarat</option>
                                                <option value="Maharashtra">Maharashtra</option>
                                                <option value="Rajasthan">Rajasthan</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Pincode *</Form.Label>
                                            <Form.Control name="pincode" value={formData.pincode} onChange={handleChange} pattern="[0-9]{6}" required />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Farm Size (acres) *</Form.Label>
                                    <Form.Control type="number" step="0.1" name="farm_size" value={formData.farm_size} onChange={handleChange} required />
                                </Form.Group>
                            </>
                        )}

                        {userType === 'buyer' && (
                            <>
                                <hr />
                                <h6 className="mb-3">Business Details</h6>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Business Name *</Form.Label>
                                            <Form.Control name="business_name" value={formData.business_name} onChange={handleChange} required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Business Type *</Form.Label>
                                            <Form.Select name="business_type" value={formData.business_type} onChange={handleChange} required>
                                                <option value="">Select</option>
                                                <option value="Manufacturer">Manufacturer</option>
                                                <option value="Exporter">Exporter</option>
                                                <option value="Wholesaler">Wholesaler</option>
                                                <option value="Retailer">Retailer</option>
                                                <option value="E-commerce">E-commerce</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>GST Number (optional)</Form.Label>
                                    <Form.Control name="gst_number" value={formData.gst_number} onChange={handleChange} />
                                </Form.Group>
                            </>
                        )}

                        <Button type="submit" className="w-100 btn-primary mt-3" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </Form>

                    <p className="text-center mt-4">
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>
                </Tab.Container>
            </div>
        </div>
    );
};

export default Register;
