import React, { useState } from 'react';
import Web3 from 'web3';
import { useAuth } from '../context/AuthContext';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const Login = () => {
  const { api, allowUserLogin, mediumAddress, emptyWallet } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [wallet, setWallet] = useState("")
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
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          setWallet(accounts[0]);
        } catch (err) {
          setError("Failed to connect wallet");
        }
      } else {
        setError("MetaMask not detected");
      }
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${api}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        allowUserLogin({ user: data.user });
        setSuccess('Login successful! Redirecting...');
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
    <div>
      <Nav />
      <div className='min-h-screen'>
    <div className="max-w-md mx-auto my-5 p-8 shadow">
      <h2 className="text-3xl font-bold mb-4">Login</h2>
      <hr />
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="border p-2 mb-3 w-full rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="border p-2 mb-3 w-full rounded"
        />
        <button type="submit" disabled={loading} className="bg-blue-500 text-white p-2 w-full">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    <div>
      <hr />
    <p className='my-2 text-sm'>Use Web3 Wallet to Login</p>
    <button onClick={connectWallet} type="button" className="bg-green-500 hover:bg-blue-700 text-white p-2 w-full">
      {wallet ? mediumAddress(wallet) : <><i className="fa fas far fab fa-globe-europe"></i> Connect Wallet</>}
    </button>
    </div>
    <hr />
          <p>Don't have an account
          <a className="mx-2" href="/register">Register Here</a>
          </p>
    </div>
    
    </div>
    <Footer />
    </div>
  );
};

export default Login;