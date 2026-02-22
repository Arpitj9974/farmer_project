import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Loader from './components/common/Loader';
import PrivateRoute from './components/auth/PrivateRoute';
import AgriAssistant from './components/ai/AgriAssistant';

// Pages
import Home from './components/pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import MarketPrices from './components/common/MarketPrices';

// Farmer
import FarmerDashboard from './components/farmer/Dashboard';
import AddProduct from './components/farmer/AddProduct';
import MyProducts from './components/farmer/MyProducts';
import EditProduct from './components/farmer/EditProduct';
import ViewBids from './components/farmer/ViewBids';
import FarmerOrders from './components/farmer/FarmerOrders';
import FarmerProfile from './components/farmer/Profile';
import FarmerAnalytics from './components/farmer/Analytics';

// Buyer
import BuyerDashboard from './components/buyer/Dashboard';
import BrowseProducts from './components/buyer/BrowseProducts';
import ProductDetail from './components/buyer/ProductDetail';
import MyBids from './components/buyer/MyBids';
import BuyerOrders from './components/buyer/BuyerOrders';
import Payment from './components/buyer/Payment';

// Admin
import AdminDashboard from './components/admin/Dashboard';
import VerifyUsers from './components/admin/VerifyUsers';
import ManageProducts from './components/admin/ManageProducts';
import Analytics from './components/admin/Analytics';

function App() {
    const { loading } = useAuth();

    if (loading) return <Loader />;

    return (
        <>
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 200px)' }}>
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/products" element={<BrowseProducts />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/market-prices" element={<PrivateRoute><MarketPrices /></PrivateRoute>} />

                    {/* Farmer */}
                    <Route path="/farmer/dashboard" element={<PrivateRoute roles={['farmer']}><FarmerDashboard /></PrivateRoute>} />
                    <Route path="/farmer/add-product" element={<PrivateRoute roles={['farmer']}><AddProduct /></PrivateRoute>} />
                    <Route path="/farmer/edit-product/:id" element={<PrivateRoute roles={['farmer']}><EditProduct /></PrivateRoute>} />
                    <Route path="/farmer/products" element={<PrivateRoute roles={['farmer']}><MyProducts /></PrivateRoute>} />
                    <Route path="/farmer/products/:id/bids" element={<PrivateRoute roles={['farmer']}><ViewBids /></PrivateRoute>} />
                    <Route path="/farmer/orders" element={<PrivateRoute roles={['farmer']}><FarmerOrders /></PrivateRoute>} />
                    <Route path="/farmer/profile" element={<PrivateRoute roles={['farmer']}><FarmerProfile /></PrivateRoute>} />
                    <Route path="/farmer/analytics" element={<PrivateRoute roles={['farmer']}><FarmerAnalytics /></PrivateRoute>} />

                    {/* Buyer */}
                    <Route path="/buyer/dashboard" element={<PrivateRoute roles={['buyer']}><BuyerDashboard /></PrivateRoute>} />
                    <Route path="/buyer/bids" element={<PrivateRoute roles={['buyer']}><MyBids /></PrivateRoute>} />
                    <Route path="/buyer/orders" element={<PrivateRoute roles={['buyer']}><BuyerOrders /></PrivateRoute>} />
                    <Route path="/buyer/orders/:id/payment" element={<PrivateRoute roles={['buyer']}><Payment /></PrivateRoute>} />

                    {/* Admin */}
                    <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
                    <Route path="/admin/verify-users" element={<PrivateRoute roles={['admin']}><VerifyUsers /></PrivateRoute>} />
                    <Route path="/admin/products" element={<PrivateRoute roles={['admin']}><ManageProducts /></PrivateRoute>} />
                    <Route path="/admin/analytics" element={<PrivateRoute roles={['admin']}><Analytics /></PrivateRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
            <Footer />
            {useAuth().user && <AgriAssistant />}
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
}

export default App;
