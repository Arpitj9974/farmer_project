import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import {
    FaLeaf, FaChartLine, FaGavel, FaStore, FaShoppingCart,
    FaArrowRight, FaArrowDown, FaCheck, FaTimes,
    FaUserCheck, FaBoxOpen, FaTags, FaClipboardList, FaMoneyBillWave,
    FaSearch, FaHandshake, FaTruck, FaStar, FaQuoteLeft,
    FaShieldAlt, FaSeedling, FaRocket, FaPlay, FaPause
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Home.css';

/* ─── Animated Counter Hook ─── */
function useCounter(end, duration = 2000, startCounting = false) {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);

    useEffect(() => {
        if (!startCounting) return;
        const numericEnd = parseInt(String(end).replace(/[^0-9]/g, ''), 10);
        if (isNaN(numericEnd) || numericEnd === 0) { setCount(0); return; }

        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * numericEnd));
            if (progress < 1) countRef.current = requestAnimationFrame(step);
        };
        countRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(countRef.current);
    }, [end, duration, startCounting]);

    return count;
}

/* ─── Intersection Observer Hook ─── */
function useInView(options = {}) {
    const ref = useRef(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsInView(true), 1500);
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                observer.disconnect();
                clearTimeout(timer);
            }
        }, { threshold: 0.05, ...options });

        if (ref.current) observer.observe(ref.current);
        return () => { observer.disconnect(); clearTimeout(timer); };
    }, []);

    return [ref, isInView];
}

/* ─── Scroll Animation Component ─── */
const FadeIn = ({ children, className = '', delay = 0, direction = 'up' }) => {
    const [ref, isInView] = useInView();
    const delayClass = delay ? `fc-fade-delay-${delay}` : '';
    const dirClass = `fc-fade-${direction}`;
    return (
        <div ref={ref} className={`fc-fade-in ${dirClass} ${delayClass} ${isInView ? 'fc-visible' : ''} ${className}`}>
            {children}
        </div>
    );
};

/* ─── Fallback sample products when API returns empty ─── */
const SAMPLE_PRODUCTS = [
    { id: 's1', name: 'Basmati Rice', fixed_price: 65, quantity_kg: 500, quality_grade: 'Grade A', selling_mode: 'fixed', primary_image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
    { id: 's2', name: 'Cardamom', fixed_price: 1850, quantity_kg: 50, quality_grade: 'Premium', selling_mode: 'bidding', primary_image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400' },
    { id: 's3', name: 'Black Pepper', fixed_price: 420, quantity_kg: 200, quality_grade: 'Grade A', selling_mode: 'fixed', primary_image: 'https://images.unsplash.com/photo-1599909533601-aa1c57bba14a?w=400' },
    { id: 's4', name: 'Chana Dal', fixed_price: 72, quantity_kg: 1000, quality_grade: 'Grade A', selling_mode: 'fixed', primary_image: 'https://images.unsplash.com/photo-1585996098015-2bdd613f0813?w=400' },
    { id: 's5', name: 'Green Gram', fixed_price: 95, quantity_kg: 350, quality_grade: 'Grade B', selling_mode: 'bidding', primary_image: 'https://images.unsplash.com/photo-1612257416648-ee7a6c533b4f?w=400' },
    { id: 's6', name: 'Masoor Dal', fixed_price: 82, quantity_kg: 800, quality_grade: 'Grade A', selling_mode: 'fixed', primary_image: 'https://images.unsplash.com/photo-1613758947307-f3b8f5d80711?w=400' },
];

/* ─── Testimonials Data ─── */
const TESTIMONIALS = [
    {
        quote: "Earlier I sold my crops through middlemen at the local mandi and never knew if I was getting a fair price. With FarmerConnect, I can see real market rates, list my produce directly, and now I earn 30% more than before.",
        name: "Ramesh Patel",
        role: "Wheat & Rice Farmer",
        location: "Gujarat",
        avatar: "/avatar_ramesh.png",
        income: "+30%",
        rating: 5,
    },
    {
        quote: "As a woman farmer, getting access to markets was always difficult. FarmerConnect changed everything — I list my organic produce, buyers come to me, and I get paid within 24 hours. It's truly empowering.",
        name: "Sunita Devi",
        role: "Organic Vegetable Farmer",
        location: "Maharashtra",
        avatar: "/avatar_sunita.png",
        income: "+45%",
        rating: 5,
    },
    {
        quote: "We used to spend weeks finding quality produce at fair prices. Now I browse verified farmers, place bids on seasonal crops, and get consistent quality. Our procurement cost dropped 20% since joining.",
        name: "Vikram Mehta",
        role: "Wholesale Buyer",
        location: "Delhi NCR",
        avatar: "/avatar_vikram.png",
        income: "-20% Cost",
        rating: 5,
    },
];

const Home = () => {
    const { isAuthenticated, isFarmer, isBuyer } = useAuth();
    const [products, setProducts] = useState([]);
    const [trustRef, trustInView] = useInView();
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const videoRef = useRef(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    const toggleVideoPlay = () => {
        if (videoRef.current) {
            if (isVideoPlaying) {
                videoRef.current.pause();
                setIsVideoPlaying(false);
            } else {
                videoRef.current.play();
                setIsVideoPlaying(true);
            }
        }
    };

    // Animated counters
    const farmers = useCounter(500, 2000, trustInView);
    const buyers = useCounter(200, 2000, trustInView);
    const trade = useCounter(2, 1500, trustInView);
    const hours = useCounter(24, 1500, trustInView);
    const states = useCounter(7, 1200, trustInView);

    // Fetch marketplace preview products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products?page=1&limit=6&sort=latest');
                const items = res.data?.data || res.data?.products || [];
                setProducts(items.length > 0 ? items : SAMPLE_PRODUCTS);
            } catch (err) {
                console.error('Failed to load preview products', err);
                setProducts(SAMPLE_PRODUCTS);
            }
        };
        fetchProducts();
    }, []);

    // Auto-rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* ═══════════════════════════════════════════
                1. HERO SECTION
               ═══════════════════════════════════════════ */}
            <section className="fc-hero" id="hero">
                {/* Animated background orbs */}
                <div className="fc-hero-orb fc-hero-orb-1"></div>
                <div className="fc-hero-orb fc-hero-orb-2"></div>
                <div className="fc-hero-orb fc-hero-orb-3"></div>
                <div className="fc-hero-grain"></div>

                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="fc-hero-content">
                            <div className="fc-hero-badge">
                                <span className="pulse-dot"></span>
                                India's #1 Agricultural B2B Trading Platform
                            </div>

                            <h1>
                                Direct Farm to<br />
                                <span className="highlight">Business Trading</span>
                            </h1>

                            <p className="fc-hero-subtitle">
                                Farmers get better prices. Buyers get transparent markets.
                                No middlemen. Fair trade for everyone.
                            </p>

                            <ul className="fc-hero-features">
                                <li><span className="check-icon"><FaCheck /></span>Real-time MSP & APMC market prices</li>
                                <li><span className="check-icon"><FaCheck /></span>Direct product marketplace</li>
                                <li><span className="check-icon"><FaCheck /></span>Live bidding for seasonal crops</li>
                                <li><span className="check-icon"><FaCheck /></span>5% only commission — 100% transparent</li>
                            </ul>

                            <div className="fc-hero-buttons">
                                {!isAuthenticated ? (
                                    <>
                                        <Link to="/register" className="fc-btn-primary">
                                            <FaLeaf /> Start Selling
                                        </Link>
                                        <Link to="/products" className="fc-btn-secondary">
                                            <FaSearch /> Browse Marketplace
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        to={isFarmer ? '/farmer/dashboard' : isBuyer ? '/buyer/dashboard' : '/admin/dashboard'}
                                        className="fc-btn-primary"
                                    >
                                        Go to Dashboard <FaArrowRight />
                                    </Link>
                                )}
                            </div>
                        </Col>

                        <Col lg={6} className="fc-hero-visual">
                            {/* Platform UI Stack — CSS-only mockup */}
                            <div className="fc-platform-stack">
                                <div className="fc-stack-card fc-stack-card-3">
                                    <div className="fc-stack-header">
                                        <div className="fc-stack-dots">
                                            <span></span><span></span><span></span>
                                        </div>
                                        <span className="fc-stack-title">Bidding Dashboard</span>
                                    </div>
                                    <div className="fc-stack-body">
                                        <div className="fc-mock-row">
                                            <div className="fc-mock-bar" style={{ width: '70%', background: 'linear-gradient(90deg, #FF9800, #FFB74D)' }}></div>
                                            <span className="fc-mock-label">₹1,850/kg</span>
                                        </div>
                                        <div className="fc-mock-row">
                                            <div className="fc-mock-bar" style={{ width: '55%', background: 'linear-gradient(90deg, #9C27B0, #CE93D8)' }}></div>
                                            <span className="fc-mock-label">₹1,720/kg</span>
                                        </div>
                                        <div className="fc-mock-row">
                                            <div className="fc-mock-bar" style={{ width: '40%', background: 'linear-gradient(90deg, #2196F3, #90CAF9)' }}></div>
                                            <span className="fc-mock-label">₹1,640/kg</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="fc-stack-card fc-stack-card-2">
                                    <div className="fc-stack-header">
                                        <div className="fc-stack-dots">
                                            <span></span><span></span><span></span>
                                        </div>
                                        <span className="fc-stack-title">Market Prices</span>
                                    </div>
                                    <div className="fc-stack-body">
                                        <div className="fc-mock-table">
                                            <div className="fc-mock-table-row header">
                                                <span>Crop</span><span>MSP</span><span>Market</span>
                                            </div>
                                            <div className="fc-mock-table-row">
                                                <span>Wheat</span><span>₹2,275</span><span className="up">₹2,410 ↑</span>
                                            </div>
                                            <div className="fc-mock-table-row">
                                                <span>Rice</span><span>₹2,183</span><span className="up">₹2,350 ↑</span>
                                            </div>
                                            <div className="fc-mock-table-row">
                                                <span>Soybean</span><span>₹4,600</span><span className="down">₹4,420 ↓</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="fc-stack-card fc-stack-card-1">
                                    <div className="fc-stack-header">
                                        <div className="fc-stack-dots">
                                            <span></span><span></span><span></span>
                                        </div>
                                        <span className="fc-stack-title">Marketplace</span>
                                    </div>
                                    <div className="fc-stack-body">
                                        <div className="fc-mock-products">
                                            <div className="fc-mock-product">
                                                <div className="fc-mock-img" style={{ background: '#C8E6C9' }}>🌾</div>
                                                <div className="fc-mock-info">
                                                    <strong>Basmati Rice</strong>
                                                    <span>₹65/kg • Grade A</span>
                                                </div>
                                            </div>
                                            <div className="fc-mock-product">
                                                <div className="fc-mock-img" style={{ background: '#FFECB3' }}>🫘</div>
                                                <div className="fc-mock-info">
                                                    <strong>Cardamom</strong>
                                                    <span>₹1,850/kg • Premium</span>
                                                </div>
                                            </div>
                                            <div className="fc-mock-product">
                                                <div className="fc-mock-img" style={{ background: '#FFCDD2' }}>🌶️</div>
                                                <div className="fc-mock-info">
                                                    <strong>Red Chilli</strong>
                                                    <span>₹180/kg • Premium</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating notification cards */}
                            <div className="fc-preview-card fc-preview-card-1">
                                <div className="card-icon green"><FaStore /></div>
                                <div className="card-text">
                                    <strong>Product Listed</strong>
                                    <small>Basmati Rice — ₹45/kg</small>
                                </div>
                            </div>
                            <div className="fc-preview-card fc-preview-card-2">
                                <div className="card-icon orange"><FaGavel /></div>
                                <div className="card-text">
                                    <strong>New Bid ₹1,850</strong>
                                    <small>Cardamom — Live Auction</small>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* ═══════════════════════════════════════════
                2. TRUST BAR — Animated Counters
               ═══════════════════════════════════════════ */}
            <section className="fc-trust" ref={trustRef}>
                <Container>
                    <div className="fc-trust-grid">
                        {[
                            { icon: '👨‍🌾', value: `${farmers}+`, label: 'Active Farmers' },
                            { icon: '🏢', value: `${buyers}+`, label: 'Verified Buyers' },
                            { icon: '💰', value: `₹${trade}Cr+`, label: 'Trade Volume' },
                            { icon: '⚡', value: `${hours} Hour`, label: 'Fast Payments' },
                            { icon: '📊', value: `${states} State`, label: 'Market Data' },
                        ].map((item, i) => (
                            <div className="fc-trust-item" key={i}>
                                <span className="fc-trust-icon">{item.icon}</span>
                                <span className="fc-trust-value">{item.value}</span>
                                <span className="fc-trust-label">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* ═══════════════════════════════════════════
                3. PROBLEM → SOLUTION
               ═══════════════════════════════════════════ */}
            <section className="fc-problem-solution">
                <Container>
                    {/* Problem */}
                    <FadeIn>
                        <Row className="align-items-center mb-5">
                            <Col lg={6} className="mb-4 mb-lg-0">
                                <span className="fc-section-label problem">The Problem</span>
                                <h2 className="fc-section-title fc-title-large">
                                    Why Farmers & Buyers<br />Both Lose Today
                                </h2>
                                <p className="fc-section-subtitle">
                                    The traditional agricultural supply chain is broken —
                                    middlemen control markets, prices are unfair, and there's
                                    no transparency for anyone.
                                </p>
                                <ul className="fc-problem-list">
                                    <li>
                                        <span className="icon"><FaTimes /></span>
                                        Farmers receive low prices because middlemen control markets
                                    </li>
                                    <li>
                                        <span className="icon"><FaTimes /></span>
                                        Buyers pay higher costs due to long supply chains
                                    </li>
                                    <li>
                                        <span className="icon"><FaTimes /></span>
                                        Lack of transparent market data makes fair trading difficult
                                    </li>
                                    <li>
                                        <span className="icon"><FaTimes /></span>
                                        Payments delayed for weeks through middlemen
                                    </li>
                                </ul>
                            </Col>
                            <Col lg={6} className="text-center">
                                <img
                                    src="/problem_illustration.png"
                                    alt="The problem with middlemen in agriculture"
                                    className="fc-ps-image"
                                />
                            </Col>
                        </Row>
                    </FadeIn>

                    {/* Arrow Divider */}
                    <div className="fc-divider">
                        <div className="fc-divider-arrow">
                            <FaArrowDown />
                        </div>
                    </div>

                    {/* Solution */}
                    <FadeIn>
                        <Row className="align-items-start mt-4">
                            <Col lg={6} className="order-lg-2 mb-4 mb-lg-0">
                                <span className="fc-section-label solution">The Solution</span>
                                <h2 className="fc-section-title fc-title-large">
                                    FarmerConnect<br />Fixes the Market
                                </h2>
                                <p className="fc-section-subtitle">
                                    We connect farmers directly with verified buyers through
                                    a transparent digital marketplace with real-time market intelligence.
                                </p>
                                <ul className="fc-solution-list">
                                    <li>
                                        <span className="icon"><FaCheck /></span>
                                        Direct farmer-to-business trading — zero middlemen
                                    </li>
                                    <li>
                                        <span className="icon"><FaCheck /></span>
                                        Live MSP and APMC market price insights
                                    </li>
                                    <li>
                                        <span className="icon"><FaCheck /></span>
                                        Transparent bidding system for fair pricing
                                    </li>
                                    <li>
                                        <span className="icon"><FaCheck /></span>
                                        Verified buyers and farmers with 24-hour payments
                                    </li>
                                </ul>
                            </Col>
                            <Col lg={6} className="order-lg-1 text-center">
                                <div className="fc-video-wrapper">
                                    <video
                                        ref={videoRef}
                                        src="/solution_video.mp4"
                                        playsInline
                                        onEnded={() => setIsVideoPlaying(false)}
                                        className="fc-ps-image"
                                        style={{ borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                                        title="FarmerConnect Solution Video"
                                    ></video>
                                    <button
                                        className={`fc-play-btn ${isVideoPlaying ? 'playing' : ''}`}
                                        onClick={toggleVideoPlay}
                                    >
                                        <span className="fc-play-icon">
                                            {isVideoPlaying ? <FaPause /> : <FaPlay />}
                                        </span>
                                        {isVideoPlaying ? 'Pause Video' : 'Start Your Journey'}
                                    </button>
                                </div>
                            </Col>
                        </Row>
                    </FadeIn>
                </Container>
            </section>

            {/* ═══════════════════════════════════════════
                4. PLATFORM FEATURES
               ═══════════════════════════════════════════ */}
            <section className="fc-features">
                <Container>
                    <div className="fc-features-header">
                        <FadeIn>
                            <span className="fc-section-label solution">Core Platform</span>
                            <h2 className="fc-section-title">Powerful Tools for Modern Agriculture</h2>
                            <p className="fc-section-subtitle" style={{ margin: '0 auto' }}>
                                Everything farmers and buyers need to trade smarter, faster, and fairer.
                            </p>
                        </FadeIn>
                    </div>

                    <Row className="g-4">
                        {[
                            {
                                icon: <FaChartLine />,
                                iconClass: 'market',
                                title: 'Real-Time Market Intelligence',
                                desc: 'View MSP and APMC prices across multiple states and mandis. Farmers know the right selling price. Buyers know the fair buying price.',
                                accent: '#1565C0'
                            },
                            {
                                icon: <FaStore />,
                                iconClass: 'marketplace',
                                title: 'Direct Product Marketplace',
                                desc: 'Farmers list their produce with price, grade and quantity. Buyers can browse and purchase directly from verified farmers.',
                                accent: '#2E7D32'
                            },
                            {
                                icon: <FaGavel />,
                                iconClass: 'bidding',
                                title: 'Seasonal Crop Bidding',
                                desc: 'During high demand seasons, buyers can place competitive bids. Farmers sell to the highest bidder to maximize their profit.',
                                accent: '#E65100'
                            }
                        ].map((feature, i) => (
                            <Col md={4} key={i}>
                                <FadeIn delay={i + 1}>
                                    <div className="fc-feature-card">
                                        <div className="fc-feature-glow" style={{ background: feature.accent }}></div>
                                        <div className={`fc-feature-icon ${feature.iconClass}`}>
                                            {feature.icon}
                                        </div>
                                        <h3>{feature.title}</h3>
                                        <p>{feature.desc}</p>
                                        <div className="fc-feature-link">
                                            Learn more <FaArrowRight />
                                        </div>
                                    </div>
                                </FadeIn>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ═══════════════════════════════════════════
                5. HOW IT WORKS
               ═══════════════════════════════════════════ */}
            <section className="fc-how-it-works">
                <Container>
                    <div className="fc-hiw-header">
                        <FadeIn>
                            <span className="fc-section-label solution">Getting Started</span>
                            <h2 className="fc-section-title">How It Works</h2>
                        </FadeIn>
                    </div>

                    <Row className="g-5">
                        {/* For Farmers — Journey Map */}
                        <Col lg={6}>
                            <FadeIn>
                                <div className="fc-journey-column">
                                    <div className="fc-journey-header farmer">
                                        <div className="fc-journey-icon-wrap farmer">
                                            <FaSeedling />
                                        </div>
                                        <h3>For Farmers</h3>
                                        <p>Your journey to better earnings</p>
                                    </div>
                                    <div className="fc-journey-path">
                                        {[
                                            { icon: <FaUserCheck />, title: 'Register & Get Verified', desc: 'Create your farmer profile with KYC verification', color: '#4CAF50' },
                                            { icon: <FaBoxOpen />, title: 'List Your Produce', desc: 'Add photos, grade, quantity & set your price', color: '#66BB6A' },
                                            { icon: <FaTags />, title: 'Set Price or Enable Bidding', desc: 'Choose fixed pricing or auction mode', color: '#43A047' },
                                            { icon: <FaClipboardList />, title: 'Receive Orders', desc: 'Get orders from verified business buyers', color: '#388E3C' },
                                            { icon: <FaMoneyBillWave />, title: 'Get Paid Quickly', desc: 'Receive payment within 24 hours', color: '#2E7D32' }
                                        ].map((step, i) => (
                                            <div className="fc-journey-step" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
                                                <div className="fc-journey-node">
                                                    <div className="fc-journey-num farmer" style={{ background: step.color }}>{i + 1}</div>
                                                    {i < 4 && <div className="fc-journey-connector farmer"></div>}
                                                </div>
                                                <div className="fc-journey-card">
                                                    <div className="fc-journey-card-icon" style={{ color: step.color }}>
                                                        {step.icon}
                                                    </div>
                                                    <div className="fc-journey-card-text">
                                                        <h4>{step.title}</h4>
                                                        <p>{step.desc}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="fc-journey-finish farmer">
                                            <FaLeaf /> Start earning 30% more
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        </Col>

                        {/* For Buyers — Journey Map */}
                        <Col lg={6}>
                            <FadeIn delay={1}>
                                <div className="fc-journey-column">
                                    <div className="fc-journey-header buyer">
                                        <div className="fc-journey-icon-wrap buyer">
                                            <FaShoppingCart />
                                        </div>
                                        <h3>For Buyers</h3>
                                        <p>Your path to quality sourcing</p>
                                    </div>
                                    <div className="fc-journey-path">
                                        {[
                                            { icon: <FaUserCheck />, title: 'Register Business', desc: 'Create your buyer profile with GSTIN', color: '#1E88E5' },
                                            { icon: <FaSearch />, title: 'Browse Marketplace', desc: 'Find quality produce from verified farms', color: '#1976D2' },
                                            { icon: <FaGavel />, title: 'Buy or Bid on Products', desc: 'Fixed price purchase or competitive bidding', color: '#1565C0' },
                                            { icon: <FaTruck />, title: 'Track Orders', desc: 'Real-time tracking & delivery updates', color: '#0D47A1' },
                                            { icon: <FaHandshake />, title: 'Build Partnerships', desc: 'Rate farmers & build long-term supply chains', color: '#0D47A1' }
                                        ].map((step, i) => (
                                            <div className="fc-journey-step" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
                                                <div className="fc-journey-node">
                                                    <div className="fc-journey-num buyer" style={{ background: step.color }}>{i + 1}</div>
                                                    {i < 4 && <div className="fc-journey-connector buyer"></div>}
                                                </div>
                                                <div className="fc-journey-card">
                                                    <div className="fc-journey-card-icon" style={{ color: step.color }}>
                                                        {step.icon}
                                                    </div>
                                                    <div className="fc-journey-card-text">
                                                        <h4>{step.title}</h4>
                                                        <p>{step.desc}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="fc-journey-finish buyer">
                                            <FaShoppingCart /> Save 20% on procurement
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* ═══════════════════════════════════════════
                5c. VALUE PROPOSITION GRAPHICS
               ═══════════════════════════════════════════ */}
            <section className="fc-vp-external">
                <Container>
                    <Row className="gy-5 align-items-center mb-5 pb-lg-4">
                        <Col lg={5} className="text-center text-lg-start">
                            <h3 className="fc-vp-title">Empowering the Farmer's Journey</h3>
                            <p className="fc-vp-desc">Watch your agricultural business grow from the first seed to successful harvest and beyond. Our transparent ecosystem guarantees fair prices and fast payments.</p>
                        </Col>
                        <Col lg={7} className="text-center">
                            <FadeIn delay={0.2}>
                                <img src="/farmer-journey.png" alt="Farmer Growth Journey" className="fc-vp-external-img" />
                            </FadeIn>
                        </Col>
                    </Row>

                    <Row className="gy-5 align-items-center">
                        <Col lg={7} className="order-2 order-lg-1 text-center">
                            <FadeIn delay={0.2}>
                                <img src="/buyer-journey.png" alt="Buyer Efficiency Tracking" className="fc-vp-external-img" />
                            </FadeIn>
                        </Col>
                        <Col lg={5} className="order-1 order-lg-2 text-center text-lg-start">
                            <h3 className="fc-vp-title">Optimizing Procurement</h3>
                            <p className="fc-vp-desc">Streamline your supply chain from initial registration to long-term partnerships. Track real-time market data and secure the exact quality you need.</p>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* ═══════════════════════════════════════════
                6. MARKETPLACE PREVIEW
               ═══════════════════════════════════════════ */}
            <section className="fc-marketplace-preview">
                <Container>
                    <div className="fc-mp-header">
                        <FadeIn>
                            <span className="fc-section-label solution">Live Marketplace</span>
                            <h2 className="fc-section-title">Fresh From the Farm</h2>
                            <p className="fc-section-subtitle" style={{ margin: '0 auto' }}>
                                Browse real produce listed by verified farmers across India.
                            </p>
                        </FadeIn>
                    </div>

                    <Row className="g-4 mb-4">
                        {products.slice(0, 6).map((product, i) => (
                            <Col md={4} sm={6} key={product.id || i}>
                                <FadeIn delay={Math.min(i + 1, 4)}>
                                    <Link to={String(product.id)?.startsWith('s') ? '/products' : `/products/${product.id}`} style={{ textDecoration: 'none' }}>
                                        <div className="fc-product-card-mini">
                                            <div className="fc-product-img-wrap">
                                                <img
                                                    src={
                                                        product.primary_image
                                                            ? (product.primary_image?.startsWith('http')
                                                                ? product.primary_image
                                                                : `${process.env.REACT_APP_UPLOAD_URL || 'http://localhost:5002'}${product.primary_image}`)
                                                            : 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'
                                                    }
                                                    alt={product.name}
                                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'; }}
                                                />
                                                <span className={`product-badge ${product.selling_mode === 'bidding' ? 'bidding' : 'fixed'}`}>
                                                    {product.selling_mode === 'bidding' ? '🔨 Bidding' : '💰 Fixed'}
                                                </span>
                                            </div>
                                            <div className="card-body">
                                                <div className="product-name">{product.name}</div>
                                                <div className="product-price">₹{product.fixed_price || product.base_price}/kg</div>
                                                <div className="product-meta">
                                                    {product.quantity_kg}kg available • {product.quality_grade || 'Grade A'}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </FadeIn>
                            </Col>
                        ))}
                    </Row>

                    <div className="text-center mt-4">
                        <FadeIn>
                            <Link to="/products" className="fc-explore-btn">
                                Explore Full Marketplace <FaArrowRight />
                            </Link>
                        </FadeIn>
                    </div>
                </Container>
            </section>

            {/* ═══════════════════════════════════════════
                7. TESTIMONIALS — Rotating Carousel
               ═══════════════════════════════════════════ */}
            <section className="fc-testimonial">
                <Container>
                    <div className="fc-testimonial-header">
                        <FadeIn>
                            <span className="fc-section-label solution">Success Stories</span>
                            <h2 className="fc-section-title">Trusted by Farmers & Buyers Across India</h2>
                        </FadeIn>
                    </div>

                    <FadeIn>
                        <div className="fc-testimonial-carousel">
                            {TESTIMONIALS.map((t, i) => (
                                <div
                                    className={`fc-testimonial-card ${i === activeTestimonial ? 'active' : ''}`}
                                    key={i}
                                >
                                    <div className="fc-quote-icon"><FaQuoteLeft /></div>
                                    <blockquote>{t.quote}</blockquote>
                                    <div className="fc-testimonial-author">
                                        <img src={t.avatar} alt={t.name} className="fc-author-avatar" />
                                        <div className="fc-author-info">
                                            <strong>{t.name}</strong>
                                            <span>{t.role}, {t.location}</span>
                                            <div className="fc-author-stars">
                                                {[...Array(t.rating)].map((_, j) => (
                                                    <FaStar key={j} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="fc-income-badge">
                                            <FaRocket />
                                            <span>{t.income}</span>
                                            <small>income</small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Dots indicator */}
                        <div className="fc-testimonial-dots">
                            {TESTIMONIALS.map((_, i) => (
                                <button
                                    key={i}
                                    className={`fc-dot ${i === activeTestimonial ? 'active' : ''}`}
                                    onClick={() => setActiveTestimonial(i)}
                                    aria-label={`View testimonial ${i + 1}`}
                                />
                            ))}
                        </div>
                    </FadeIn>
                </Container>
            </section>

            {/* ═══════════════════════════════════════════
                8. FINAL CTA
               ═══════════════════════════════════════════ */}
            <section className="fc-final-cta">
                <div className="fc-cta-orb fc-cta-orb-1"></div>
                <div className="fc-cta-orb fc-cta-orb-2"></div>
                <Container>
                    <FadeIn>
                        <div className="fc-cta-content">
                            <h2>Join India's Direct Farm<br />Trading Network</h2>
                            <p>
                                Be part of the revolution transforming agricultural trade.
                                Transparent pricing, verified partners, and faster payments for everyone.
                            </p>
                            <div className="fc-cta-buttons">
                                {!isAuthenticated ? (
                                    <>
                                        <Link to="/register" className="fc-btn-farmer">
                                            <FaLeaf /> Register as Farmer
                                        </Link>
                                        <Link to="/register" className="fc-btn-buyer">
                                            <FaShoppingCart /> Register as Buyer
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        to={isFarmer ? '/farmer/dashboard' : isBuyer ? '/buyer/dashboard' : '/admin/dashboard'}
                                        className="fc-btn-farmer"
                                    >
                                        Go to Dashboard <FaArrowRight />
                                    </Link>
                                )}
                            </div>
                            <div className="fc-cta-trust">
                                <span><FaShieldAlt /> Verified Platform</span>
                                <span><FaMoneyBillWave /> 24hr Payments</span>
                                <span><FaStar /> 4.8★ rated by farmers</span>
                            </div>
                        </div>
                    </FadeIn>
                </Container>
            </section>
        </>
    );
};

export default Home;
