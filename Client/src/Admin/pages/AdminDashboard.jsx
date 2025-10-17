import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Web3 from 'web3';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../../config';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import axios from 'axios';
import AdminNav from '../components/AdminNav';

const AdminDashboard = () => {
  const { auth, api } = useAuth();
  const navigate = useNavigate();
  const [totalMinted, setTotalMinted] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  // Initialize Web3 and contract
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = new Web3(window.ethereum || 'http://127.0.0.1:7545');
        const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        setWeb3(web3Instance);
        setContract(contractInstance);
      } catch (err) {
        setError('Failed to initialize Web3');
      }
    };
    initWeb3();
  }, []);

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!web3 || !contract || !auth.user?.wallet) return;
      try {
        // Total minted
        const minted = await contract.methods.getTokenCounter().call();
        setTotalMinted(Number(minted));

        // Total users
        const users = await contract.methods.getUserCount().call();
        setTotalUsers(Number(users));

        // Total pending requests
        const res = await axios.get(`${api}/admin/property/requests/${auth.user.wallet}`);
        setTotalRequests(res.data.requests.length);
      } catch (err) {
        setError('Failed to fetch statistics'+err.message);
      }
    };
    fetchStats();
  }, [web3, contract, auth.user?.wallet, api]);

  if (auth.role !== 'admin') {
    navigate('/login');
    return null;
  }

  return (
    <div>
      <AdminNav />
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto my-5 p-8 shadow">
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
          <hr />
          {error && <p className="text-red-500">{error}</p>}

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border p-4 rounded shadow text-center">
              <h3 className="text-xl font-semibold">Total Minted Properties</h3>
              <p className="text-3xl">{totalMinted}</p>
            </div>
            <div className="border p-4 rounded shadow text-center">
              <h3 className="text-xl font-semibold">Pending Requests</h3>
              <p className="text-3xl">{totalRequests}</p>
            </div>
            <div className="border p-4 rounded shadow text-center">
              <h3 className="text-xl font-semibold">Total Users</h3>
              <p className="text-3xl">{totalUsers}</p>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <button
              onClick={() => navigate('/admin/properties_requests')}
              className="bg-blue-500 text-white p-2 px-4 rounded hover:bg-blue-700"
            >
              Manage Property Requests
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;