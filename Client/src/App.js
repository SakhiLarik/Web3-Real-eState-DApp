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
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
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
      </Routes>
    </Router>
  );
};

export default App;
