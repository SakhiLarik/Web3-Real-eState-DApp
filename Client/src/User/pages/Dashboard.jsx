import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Web3 from 'web3';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../../config';
import { useNavigate } from 'react-router-dom';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import axios from 'axios';

const Dashboard = () => {
  const { api, auth, mediumAddress } = useAuth();
  const navigate = useNavigate();
  const [ownedCount, setOwnedCount] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [profileImage, setProfileImage] = useState(auth.user.profile || '');
  const [profileFile, setProfileFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  // Initialize Web3 and contract
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = new Web3('http://127.0.0.1:7545');
        const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        setWeb3(web3Instance);
        setContract(contractInstance);
      } catch (err) {
        setError('Failed to initialize Web3');
      }
    };
    initWeb3();
  }, []);

  // Fetch quantitative info
  useEffect(() => {
    const fetchStats = async () => {
      if (!web3 || !contract || !auth.user.wallet) return;
      try {
        // Owned count
        const tokenCount = await contract.methods.getTokenCounter().call();
        let owned = 0;
        for (let i = 1; i <= tokenCount; i++) {
          const owner = await contract.methods.ownerOf(i).call();
          if (owner.toLowerCase() === auth.user.wallet.toLowerCase()) owned++;
        }
        setOwnedCount(owned);

        // Sold count from events
        const soldEvents = await contract.getPastEvents('PropertySold', {
          filter: { seller: auth.user.wallet },
          fromBlock: 0,
        });
        setSoldCount(soldEvents.length);

        // Request count from MongoDB
        const res = await axios.get(`${api}/property/requests/${auth.user.wallet}`);
        setRequestCount(res.data.requests.length);
      } catch (err) {
        setError('Failed to fetch stats' + err);
      }
    };
    fetchStats();
  }, [web3, contract, auth.user?.wallet, api]);

  // Handle profile upload
  const handleProfileChange = (e) => {
    setProfileFile(e.target.files[0]);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('profile', profileFile);
    formData.append('user', auth.user.wallet || 'default'); // Assuming phone as identifier; adjust as needed

    try {
      const response = await axios.post(`${api}/upload/profile/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setProfileImage(response.data.filename);
        setSuccess('Profile picture updated!');
        // Update auth state if needed
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (!auth.user) {
    navigate('/login');
    return null;
  }

  return (
    <div>
      <Nav />
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto my-5 p-8 shadow">
          <h1 className="text-3xl font-bold mb-4">User Dashboard</h1>
          <hr />
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}

          {/* Quantitative Info */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border p-4 rounded shadow text-center">
              <h3 className="text-xl font-semibold">Properties Owned</h3>
              <p className="text-3xl">{ownedCount}</p>
            </div>
            <div className="border p-4 rounded shadow text-center">
              <h3 className="text-xl font-semibold">Properties Sold</h3>
              <p className="text-3xl">{soldCount}</p>
            </div>
            <div className="border p-4 rounded shadow text-center">
              <h3 className="text-xl font-semibold">Mint Requests Made</h3>
              <p className="text-3xl">{requestCount}</p>
            </div>
          </div>

          {/* Profile Settings */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Profile Settings</h2>
            <div className="flex items-center mb-4">
              {profileImage && (
                <img
                  src={`/uploads/user/${profileImage}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mr-4"
                />
              )}
              <form onSubmit={handleProfileSubmit}>
                <input
                  type="file"
                  name="user_image"
                  accept="image/*"
                  onChange={handleProfileChange}
                  required
                  className="border p-2 mb-3"
                />
                <button
                  type="submit"
                  disabled={loading || !profileFile}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
                >
                  {loading ? 'Uploading...' : 'Update Profile Picture'}
                </button>
              </form>
            </div>
          </div>

          {/* Links to Other Pages */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Other Settings</h2>
            <button
              onClick={() => navigate('/user/history')}
              className="bg-gray-500 text-white p-2 mr-4 rounded hover:bg-gray-700"
            >
              View History
            </button>
            <button
              onClick={() => navigate('/user/properties')}
              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-700"
            >
              View Properties
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;