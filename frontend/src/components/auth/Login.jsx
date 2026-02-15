import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    React.useEffect(() => {
        if (isAuthenticated && user) {
            const redirectPath = user.user_type === 'farmer' ? '/farmer/dashboard'
                : user.user_type === 'buyer' ? '/buyer/dashboard' : '/admin/dashboard';
            navigate(redirectPath);
        }
    }, [isAuthenticated, user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const loggedUser = await login(formData.email, formData.password);
            toast.success('Login successful!');
            const redirectPath = loggedUser.user_type === 'farmer' ? '/farmer/dashboard'
                : loggedUser.user_type === 'buyer' ? '/buyer/dashboard' : '/admin/dashboard';
            navigate(redirectPath);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p className="text-center text-muted mb-4">Login to your FarmerConnect account</p>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label><FaEnvelope className="me-2" />Email</Form.Label>
                        <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label><FaLock className="me-2" />Password</Form.Label>
                        <div className="position-relative">
                            <Form.Control type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required />
                            <Button variant="link" className="position-absolute top-50 end-0 translate-middle-y" onClick={() => setShowPassword(!showPassword)} style={{ zIndex: 10 }}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                        </div>
                    </Form.Group>

                    <Button type="submit" className="w-100 btn-primary" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </Form>

                <p className="text-center mt-4">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>

                <hr />
                <p className="text-center text-muted small">
                    Demo: ramesh.patel@email.com (Farmer)<br />
                    orders@freshjuice.com (Buyer) / admin@farmerconnect.com<br />
                    Password: Password123!@#
                </p>
            </div>
        </div>
    );
};

export default Login;
