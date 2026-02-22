import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaUserCircle, FaUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api, { UPLOAD_URL } from '../../services/api';
import DashboardLayout from '../common/Layout/DashboardLayout';
import Loader from '../common/Loader';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const uploadRef = React.useRef(false);

    const [formData, setFormData] = useState({
        name: '', mobile: '', bio: '', farm_address: '',
        city: '', state: '', pincode: '', farm_size: '',
        bank_name: '', account_number: '', ifsc_code: ''
    });

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [newAvatar, setNewAvatar] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/profile');
            const p = res.data.profile;
            setFormData({
                name: p.name || '',
                mobile: p.mobile || '',
                bio: p.bio || '',
                farm_address: p.farm_address || '',
                city: p.city || '',
                state: p.state || '',
                pincode: p.pincode || '',
                farm_size: p.farm_size || '',
                bank_name: p.bank_name || '',
                account_number: p.account_number || '',
                ifsc_code: p.ifsc_code || ''
            });

            if (p.avatar_url) {
                setAvatarPreview(p.avatar_url.startsWith('http') ? p.avatar_url : `${UPLOAD_URL}${p.avatar_url}`);
            }
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Avatar must be under 2MB');
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Must be JPEG, PNG, or WEBP');
            return;
        }

        setNewAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleAvatarUpload = async () => {
        console.log("Upload triggered");
        if (!newAvatar || uploadRef.current) return;

        uploadRef.current = true;
        setUpdating(true);
        const data = new FormData();
        data.append('avatar', newAvatar);

        try {
            console.log("Sending PUT request to /auth/profile/avatar...");

            const token = localStorage.getItem('token');
            const res = await fetch(`${api.defaults.baseURL}/auth/profile/avatar`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do not set Content-Type, letting the browser automatically set the correct boundary
                },
                body: data
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Failed to update avatar');

            console.log("PUT request successful. Status:", res.status, "Data:", json);

            toast.success('Avatar updated successfully');
            setNewAvatar(null);

            console.log("Setting user context with new avatar:", json.avatar_url);
            const updatedUser = { ...user, avatar_url: json.avatar_url };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log("Avatar upload process completed successfully.");
        } catch (err) {
            console.error("Avatar upload failed! Error:", err);
            toast.error(err.message || 'Failed to update avatar');
        } finally {
            console.log("Avatar upload finally block - setting updating to false");
            setUpdating(false);
            uploadRef.current = false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');

        try {
            await api.put('/auth/profile', formData);
            toast.success('Profile updated successfully');
            const updatedUser = { ...user, name: formData.name };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
            window.scrollTo(0, 0);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <DashboardLayout role="farmer">
            <Container className="py-4">
                <h2 className="mb-4">My Profile</h2>

                {error && <Alert variant="danger">{error}</Alert>}

                <Row>
                    <Col md={4} className="mb-4">
                        <Card className="text-center shadow-sm">
                            <Card.Body>
                                <div className="mb-3">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Profile" className="rounded-circle" style={{ width: '150px', height: '150px', objectFit: 'cover', border: '3px solid var(--primary-green)' }} />
                                    ) : (
                                        <FaUserCircle size={150} color="#ccc" />
                                    )}
                                </div>
                                <h4 className="mb-1">{user.name}</h4>
                                <p className="text-muted mb-3">{user.user_type.toUpperCase()}</p>

                                <div className="d-grid gap-2">
                                    <Button variant="outline-primary" as="label">
                                        <FaUpload className="me-2" /> Choose Avatar
                                        <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} />
                                    </Button>

                                    {newAvatar && (
                                        <Button variant="success" onClick={handleAvatarUpload} disabled={updating}>
                                            {updating ? 'Uploading...' : 'Save Avatar'}
                                        </Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={8}>
                        <Card className="shadow-sm">
                            <Card.Header className="bg-white">
                                <h5 className="mb-0">Profile Information</h5>
                            </Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Full Name *</Form.Label>
                                                <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Mobile Number *</Form.Label>
                                                <Form.Control type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Bio / About Farm</Form.Label>
                                        <Form.Control as="textarea" rows={3} name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell buyers about yourself and your farming practices..." />
                                    </Form.Group>

                                    <hr />
                                    <h6 className="mb-3">Farm Details</h6>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Farm Address *</Form.Label>
                                        <Form.Control type="text" name="farm_address" value={formData.farm_address} onChange={handleChange} required />
                                    </Form.Group>

                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>City *</Form.Label>
                                                <Form.Control type="text" name="city" value={formData.city} onChange={handleChange} required />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>State *</Form.Label>
                                                <Form.Control type="text" name="state" value={formData.state} onChange={handleChange} required />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Pincode *</Form.Label>
                                                <Form.Control type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Farm Size (e.g., 5 Acres)</Form.Label>
                                        <Form.Control type="text" name="farm_size" value={formData.farm_size} onChange={handleChange} />
                                    </Form.Group>

                                    <hr />
                                    <h6 className="mb-3">Bank Details (For Payments)</h6>

                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Bank Name</Form.Label>
                                                <Form.Control type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Account Number</Form.Label>
                                                <Form.Control type="text" name="account_number" value={formData.account_number} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>IFSC Code</Form.Label>
                                                <Form.Control type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <div className="d-flex justify-content-end mt-4">
                                        <Button type="submit" variant="primary" disabled={updating}>
                                            {updating ? 'Saving...' : 'Save Profile Changes'}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </DashboardLayout>
    );
};

export default Profile;
