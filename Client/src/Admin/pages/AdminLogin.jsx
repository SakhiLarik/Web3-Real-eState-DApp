import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Web3 from 'web3';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../../config';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import AdminNav from '../components/AdminNav';

const AdminLogin = () => {
  const { api, allowAdminLogin, mediumAddress } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    setLoading(true);
    setError('');
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        const walletAddress = accounts[0];
        setWallet(walletAddress);

        // Check if wallet is contract owner
        const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        const owner = await contract.methods.owner().call();
        if (walletAddress.toLowerCase() !== owner.toLowerCase()) {
          throw new Error('Not the admin wallet');
        }

        // Set auth state as admin
        allowAdminLogin({
          user: {
            name: "Real eState NFT Admin",
            walletAddress,
          }
        });

        navigate('/admin/dashboard');
      } catch (err) {
        setError(err.message || 'Failed to connect or verify wallet');
      }
    } else {
      setError('MetaMask not detected');
    }
    setLoading(false);
  };

  return (
    <div>
      <AdminNav />
      <div className="min-h-screen">
        <div className="max-w-md mx-auto my-5 p-8 shadow">
          <h2 className="text-3xl font-bold mb-4">Admin Login</h2>
          <hr />
          {error && <p className="text-red-500">{error}</p>}
          <div className="mb-4">
            <button
              onClick={connectWallet}
              disabled={loading}
              className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-700"
            >
              {loading ? 'Connecting...' : 'Connect Admin Wallet'}
            </button>
            {wallet && <p className="mt-2 text-center">Connected: {mediumAddress(wallet)}</p>}
          </div>
          <hr />
          <p className="text-sm">Only the contract owner can log in as admin.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLogin;