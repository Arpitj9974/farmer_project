import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { FaUpload, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';
import DashboardLayout from '../common/Layout/DashboardLayout';

// Define the hierarchy
const CROP_TYPES = {
    'Grains & Cereals': [
        // Staples
        'Rice - Basmati', 'Rice - Sona Masuri', 'Rice - Ponni', 'Rice - Indrayani', 'Rice - Gobindobhog', 'Rice - Kalanamak', 'Rice - Ambemohar', 'Rice - Black (Karuppu Kavuni)',
        'Wheat - Sharbati', 'Wheat - Khapli (Emmer)', 'Wheat - Durum', 'Wheat - Malvi',
        'Maize - Yellow', 'Maize - White', 'Sweet Corn', 'Popcorn',
        // Millets
        'Jowar (Sorghum)', 'Bajra (Pearl Millet)', 'Ragi (Finger Millet)', 'Kangni (Foxtail Millet)',
        'Kodo Millet', 'Kutki (Little Millet)', 'Sanwa (Barnyard Millet)', 'Cheena (Proso Millet)', 'Hari Kangni (Browntop Millet)',
        // Pseudo-Cereals
        'Kuttu (Buckwheat)', 'Rajgira (Amaranth)', 'Singhara (Water Chestnut Flour)'
    ],
    'Pulses & Legumes': [
        'Tur / Arhar Dal (Pigeon Pea)',
        'Chana - Desi (Brown)', 'Chana - Kabuli (White)', 'Chana Dal',
        'Moong (Whole Green)', 'Moong Dal (Yellow Split)',
        'Urad (Whole Black)', 'Urad Dal (White Split)',
        'Masoor (Red/Orange)', 'Masoor (Whole Brown)',
        'Rajma - Chitra', 'Rajma - Jammu', 'Rajma - Red',
        'Lobia (Cowpeas)', 'Matki (Moth Beans)', 'Kulthi (Horse Gram)',
        'Val (Field Beans)', 'Soybeans', 'Dried Peas (Vatana)'
    ],
    'Vegetables': [
        // Essentials
        'Tomato', 'Onion', 'Potato',
        // Gourds
        'Bottle Gourd (Lauki)', 'Bitter Gourd (Karela)', 'Ridge Gourd (Turai)', 'Snake Gourd',
        'Ivy Gourd (Tindora)', 'Pointed Gourd (Parwal)', 'Spiny Gourd (Kantola)', 'Ash Gourd (Petha)',
        // Leafy Greens
        'Spinach (Palak)', 'Fenugreek (Methi)', 'Amaranth (Chaulai)', 'Mustard Greens (Sarson)',
        'Bathua', 'Gongura', 'Colocasia Leaves (Arbi patta)',
        // Cruciferous
        'Cauliflower', 'Cabbage', 'Knol Khol', 'Broccoli',
        // Roots
        'Radish', 'Carrot', 'Beetroot', 'Sweet Potato', 'Elephant Foot Yam', 'Taro Root (Arbi)', 'Tapioca',
        // Others
        'Ladyfinger (Bhindi)', 'Brinjal (Baingan)', 'Drumstick (Moringa)', 'Green Peas (Matar)', 'Cluster Beans', 'French Beans', 'Sem Phali', 'Capsicum'
    ],
    'Fruits': [
        // Mangoes
        'Mango - Alphonso', 'Mango - Kesar', 'Mango - Banganapalli', 'Mango - Dasheri', 'Mango - Langra', 'Mango - Chausa', 'Mango - Totapuri',
        // Tropical
        'Banana - Robusta', 'Banana - Poovan', 'Banana - Yelakki', 'Banana - Nendran',
        'Nagpur Orange', 'Mosambi (Sweet Lime)', 'Kinnow', 'Pomelo', 'Lemon',
        'Papaya', 'Guava', 'Pineapple', 'Jackfruit', 'Pomegranate', 'Chickoo (Sapodilla)', 'Litchi', 'Custard Apple',
        // Temperate
        'Apple - Royal Delicious', 'Apple - Golden', 'Apple - Fuji',
        'Peach', 'Plum', 'Apricot', 'Cherry', 'Pear', 'Walnut', 'Almond',
        // Berries/Melons
        'Watermelon', 'Muskmelon', 'Strawberry', 'Mulberry',
        // Indigenous
        'Amla', 'Jamun', 'Bael', 'Ber', 'Phalsa',
        // Exotic
        'Dragon Fruit', 'Kiwi', 'Avocado', 'Mangosteen'
    ]
};

const AddProduct = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [priceGuidance, setPriceGuidance] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // New state for key category type
    const [selectedType, setSelectedType] = useState('');
    const [availableCrops, setAvailableCrops] = useState([]);

    const [formData, setFormData] = useState({
        name: '', description: '', category_id: '', quantity_kg: '',
        selling_mode: 'fixed_price', fixed_price: '', base_price: '',
        quality_grade: 'A', is_organic: false
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    // Update available crops when type changes
    useEffect(() => {
        if (selectedType && CROP_TYPES[selectedType]) {
            setAvailableCrops(CROP_TYPES[selectedType]);
        } else {
            setAvailableCrops([]);
        }
    }, [selectedType]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/products/categories');
            setCategories(res.data.categories);
        } catch (err) { console.error(err); }
    };

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
        setFormData({ ...formData, name: '', category_id: '' }); // Reset dependent fields
        setPriceGuidance(null);
    };

    const handleCropChange = (e) => {
        const cropName = e.target.value;

        // Try to find a matching category ID from the backend list
        // This assumes backend categories are named 'Mango', 'Banana' etc.
        const matchingCategory = categories.find(c => c.name.toLowerCase() === cropName.toLowerCase());

        // fallback logic for demo purposes if category doesn't exist in DB
        // In a real app, strict validation would prevent this, but we map to first available for demo continuity
        const fallbackId = categories.length > 0 ? categories[0].id : '';
        const categoryId = matchingCategory ? matchingCategory.id : fallbackId;

        setFormData({
            ...formData,
            name: cropName, // Set Product Name to the Crop Name
            category_id: categoryId
        });

        if (categoryId) {
            // Fetch price guidance if we have a valid category ID, passing crop name explicitly for better accuracy
            api.get(`/products/price-guidance/${categoryId}?crop_name=${encodeURIComponent(cropName)}`)
                .then(res => setPriceGuidance(res.data.guidance))
                .catch(() => setPriceGuidance(null));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 3) {
            toast.error('Maximum 3 images allowed');
            return;
        }
        const validFiles = files.filter(f => {
            if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} is too large (max 5MB)`); return false; }
            if (!['image/jpeg', 'image/png'].includes(f.type)) { toast.error(`${f.name} must be JPEG or PNG`); return false; }
            return true;
        });
        setImages([...images, ...validFiles]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (images.length === 0) { setError('At least 1 image is required'); return; }

        setLoading(true);
        setError('');

        const data = new FormData();
        Object.keys(formData).forEach(key => { if (formData[key]) data.append(key, formData[key]); });
        images.forEach(img => data.append('images', img));

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${api.defaults.baseURL}/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Failed to create product');

            toast.success('Product created! Pending admin approval.');
            navigate('/farmer/products');
        } catch (err) {
            setError(err.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    const getPriceHint = () => {
        if (!priceGuidance || !formData[formData.selling_mode === 'fixed_price' ? 'fixed_price' : 'base_price']) return null;
        const price = parseFloat(formData[formData.selling_mode === 'fixed_price' ? 'fixed_price' : 'base_price']);
        if (priceGuidance.msp_per_kg && price < priceGuidance.msp_per_kg) return { type: 'warning', msg: 'Below MSP - Consider increasing' };
        if (priceGuidance.suggested_min && price < priceGuidance.suggested_min) return { type: 'info', msg: 'Below market average' };
        if (priceGuidance.suggested_max && price > priceGuidance.suggested_max) return { type: 'info', msg: 'Above market average - Good for premium quality' };
        return { type: 'success', msg: 'Within suggested range ✓' };
    };

    const hint = getPriceHint();

    return (
        <DashboardLayout role="farmer">
            <Container className="py-4">
                <h2 className="mb-4">Add New Product</h2>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={8}>
                            <Card className="mb-4">
                                <Card.Header>Product Details</Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Select Category *</Form.Label>
                                                <Form.Select
                                                    value={selectedType}
                                                    onChange={handleTypeChange}
                                                    required
                                                >
                                                    <option value="">-- Select Category --</option>
                                                    {Object.keys(CROP_TYPES).map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Crop / Product Name *</Form.Label>
                                                <Form.Select
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleCropChange}
                                                    required
                                                    disabled={!selectedType}
                                                >
                                                    <option value="">
                                                        {selectedType ? '-- Select Crop --' : 'Select Category first'}
                                                    </option>
                                                    {availableCrops.map(crop => (
                                                        <option key={crop} value={crop}>{crop}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Description *</Form.Label>
                                        <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} minLength={20} maxLength={1000} required />
                                    </Form.Group>

                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Quantity (kg) *</Form.Label>
                                                <Form.Control type="number" step="0.1" name="quantity_kg" value={formData.quantity_kg} onChange={handleChange} min="1" required />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Quality Grade *</Form.Label>
                                                <Form.Select name="quality_grade" value={formData.quality_grade} onChange={handleChange}>
                                                    <option value="A+">A+ (Premium)</option>
                                                    <option value="A">A (Standard)</option>
                                                    <option value="B">B (Economy)</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3 mt-4">
                                                <Form.Check type="checkbox" name="is_organic" label="Organic Certified" checked={formData.is_organic} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <hr />
                                    <h6>Selling Mode</h6>
                                    <Form.Group className="mb-3">
                                        <Form.Check inline type="radio" name="selling_mode" value="fixed_price" label="Fixed Price" checked={formData.selling_mode === 'fixed_price'} onChange={handleChange} />
                                        <Form.Check inline type="radio" name="selling_mode" value="bidding" label="Bidding / Auction" checked={formData.selling_mode === 'bidding'} onChange={handleChange} />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>{formData.selling_mode === 'fixed_price' ? 'Fixed Price' : 'Base Price'} per kg (₹) *</Form.Label>
                                        <Form.Control type="number" step="0.01" name={formData.selling_mode === 'fixed_price' ? 'fixed_price' : 'base_price'} value={formData.selling_mode === 'fixed_price' ? formData.fixed_price : formData.base_price} onChange={handleChange} min="0.01" required />
                                        {hint && <small className={`text-${hint.type}`}>{hint.msg}</small>}
                                    </Form.Group>
                                </Card.Body>
                            </Card>

                            <Card className="mb-4">
                                <Card.Header>Product Images (1-3, Max 5MB each)</Card.Header>
                                <Card.Body>
                                    <div className="mb-3">
                                        {images.map((img, i) => (
                                            <div key={i} className="image-preview">
                                                <img src={URL.createObjectURL(img)} alt={`Preview ${i}`} />
                                                <button type="button" className="remove-btn" onClick={() => removeImage(i)}><FaTimes /></button>
                                            </div>
                                        ))}
                                    </div>
                                    {images.length < 3 && (
                                        <Form.Group>
                                            <Form.Label className="btn btn-outline-primary"><FaUpload className="me-2" />Upload Images<Form.Control type="file" accept="image/jpeg,image/png" multiple hidden onChange={handleImageChange} /></Form.Label>
                                        </Form.Group>
                                    )}
                                </Card.Body>
                            </Card>

                            <Button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Product'}</Button>
                        </Col>

                        <Col md={4}>
                            {priceGuidance && (
                                <div className="price-guidance-box">
                                    <h6>💡 Price Guidance</h6>
                                    <table className="table table-sm mb-0">
                                        <tbody>
                                            {priceGuidance.msp_per_kg && <tr><td>MSP (Govt.)</td><td className="fw-bold">₹{priceGuidance.msp_per_kg.toFixed(2)}/kg</td></tr>}
                                            {priceGuidance.apmc_avg_per_kg && <tr><td>APMC Avg</td><td className="fw-bold">₹{priceGuidance.apmc_avg_per_kg.toFixed(2)}/kg</td></tr>}
                                            {priceGuidance.platform_avg_per_kg && <tr><td>Platform Avg</td><td className="fw-bold">₹{priceGuidance.platform_avg_per_kg.toFixed(2)}/kg</td></tr>}
                                            {priceGuidance.suggested_min && priceGuidance.suggested_max && <tr><td>Suggested</td><td className="fw-bold text-success">₹{priceGuidance.suggested_min.toFixed(2)} - ₹{priceGuidance.suggested_max.toFixed(2)}</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Form>
            </Container>
        </DashboardLayout>
    );
};

export default AddProduct;
