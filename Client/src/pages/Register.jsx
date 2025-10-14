import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Assuming AuthContext.js is in contexts
import Web3 from 'web3'; // Assuming Web3.js is installed

const Register = () => {
  const { api, allowUserLogin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    profile: '',
    email: '',
    password: '',
    phone: '',
    walletAddress: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        setFormData({ ...formData, walletAddress: accounts[0] });
      } catch (err) {
        setError('Failed to connect wallet');
      }
    } else {
      setError('MetaMask not detected');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${api}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Use allowUserLogin to set auth state
        allowUserLogin({ user: data.user });
        setSuccess('Registration successful! Redirecting...');
        // Redirect to dashboard or home
        setTimeout(() => window.location.href = '/dashboard', 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="border p-2 mb-2 w-full"
        />
        <input
          type="text"
          name="profile"
          placeholder="Profile (optional)"
          value={formData.profile}
          onChange={handleChange}
          className="border p-2 mb-2 w-full"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="border p-2 mb-2 w-full"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="border p-2 mb-2 w-full"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="border p-2 mb-2 w-full"
        />
        <div className="mb-2">
          <button type="button" onClick={connectWallet} className="bg-blue-500 text-white p-2 mr-2">
            Connect Wallet
          </button>
          <input
            type="text"
            name="walletAddress"
            placeholder="Wallet Address"
            value={formData.walletAddress}
            readOnly
            className="border p-2 w-full"
          />
        </div>
        <button type="submit" disabled={loading} className="bg-green-500 text-white p-2 w-full">
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;