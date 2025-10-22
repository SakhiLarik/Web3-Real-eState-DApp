import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './User/pages/Dashboard';
import Properties from './User/pages/Properties';
import History from './User/pages/History';
import AdminLogin from './Admin/pages/AdminLogin';
import AdminDashboard from './Admin/pages/AdminDashboard';
import PropertyRequests from './Admin/pages/PropertyRequests';
import AllProperties from './pages/AllProperties';
import Sellers from './pages/Sellers';
import SellerDetails from './pages/SellerDetails';
const App = () => {
  return (
    <Router>
      <Routes>
        {/* User Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/properties" element={<Properties />} />
        {/* Admin Routes */}
        <Route path="/admin/" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/properties_requests" element={<PropertyRequests />} />
        {/* Home Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/all_properties" element={<AllProperties />} />
        <Route path="/sellers" element={<Sellers />} />
        <Route path="/seller/:walletAddress" element={<SellerDetails />} />

      </Routes>
    </Router>
  );
};

export default App;
