import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Web3 from 'web3';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../../config'; // Assuming config.js with ABI and contract address
import { useNavigate } from 'react-router-dom';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import axios from 'axios';

const Dashboard = () => {
  const { api, auth, mediumAddress } = useAuth();
  const navigate = useNavigate();
  const [ownedProperties, setOwnedProperties] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [listingForm, setListingForm] = useState({
    title: '',
    location: '',
    price: '',
    description: '',
    image: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  // Initialize Web3 and contract
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = new Web3(window.ethereum || 'http://127.0.0.1:7545');
        await window.ethereum?.request({ method: 'eth_requestAccounts' });
        const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        setWeb3(web3Instance);
        setContract(contractInstance);
      } catch (err) {
        setError('Failed to initialize Web3');
      }
    };
    initWeb3();
  }, []);

  // Fetch owned properties
  useEffect(() => {
    const fetchOwnedProperties = async () => {
      if (!web3 || !contract || !auth.user?.wallet) return;
      try {
        const tokenCount = await contract.methods.getTokenCounter().call();
        const properties = [];
        for (let i = 1; i <= tokenCount; i++) {
          const owner = await contract.methods.ownerOf(i).call();
          if (owner.toLowerCase() === auth.user.wallet.toLowerCase()) {
            const details = await contract.methods.getPropertyDetails(i).call();
            // Fetch image from MongoDB
            const imageRes = await axios.get(`${api}/property/image/${i}`);
            properties.push({
              tokenId: i,
              title: details[0],
              location: details[1],
              price: web3.utils.fromWei(details[2], 'ether'),
              isListed: details[4],
              image: imageRes.data.image || '',
            });
          }
        }
        setOwnedProperties(properties);
      } catch (err) {
        setError('Failed to fetch properties');
      }
    };
    fetchOwnedProperties();
  }, [web3, contract, auth.user?.wallet, api]);

  // Fetch transaction history
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (!web3 || !contract || !auth.user?.wallet) return;
      try {
        const events = await contract.getPastEvents('PropertySold', {
          filter: { buyer: auth.user.wallet, seller: auth.user.wallet },
          fromBlock: 0,
        });
        const history = events.map(event => ({
          tokenId: event.returnValues.tokenId,
          buyer: event.returnValues.buyer,
          seller: event.returnValues.seller,
          price: web3.utils.fromWei(event.returnValues.price, 'ether'),
          transactionHash: event.transactionHash,
        }));
        setTransactionHistory(history);
      } catch (err) {
        setError('Failed to fetch transaction history');
      }
    };
    fetchTransactionHistory();
  }, [web3, contract, auth.user?.wallet]);

  // Handle listing request form
  const handleListingChange = (e) => {
    if (e.target.name === 'image') {
      setListingForm({ ...listingForm, image: e.target.files[0] });
    } else {
      setListingForm({ ...listingForm, [e.target.name]: e.target.value });
    }
  };

  const handleListingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', listingForm.title);
    formData.append('location', listingForm.location);
    formData.append('price', listingForm.price);
    formData.append('description', listingForm.description);
    formData.append('image', listingForm.image);
    formData.append('userAddress', auth.user.wallet);

    try {
      const response = await axios.post(`${api}/property/request`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status === 201) {
        setSuccess('Listing request submitted! Awaiting admin approval.');
        setListingForm({ title: '', location: '', price: '', description: '', image: null });
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // List property for sale
  const listForSale = async (tokenId, price) => {
    try {
      const weiPrice = web3.utils.toWei(price.toString(), 'ether');
      await contract.methods.listPropertyForSale(tokenId, weiPrice).send({ from: auth.user.wallet });
      setSuccess(`Property #${tokenId} listed for sale!`);
      setOwnedProperties(prev =>
        prev.map(prop =>
          prop.tokenId === tokenId ? { ...prop, isListed: true, price } : prop
        )
      );
    } catch (err) {
      setError('Failed to list property');
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

          {/* User Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Your Profile</h2>
            <p><strong>Name:</strong> {auth.user.name}</p>
            <p><strong>Email:</strong> {auth.user.email}</p>
            <p><strong>Phone:</strong> {auth.user.phone}</p>
            <p><strong>Wallet:</strong> {mediumAddress(auth.user.wallet)}</p>
          </div>

          {/* Owned Properties */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Your Properties</h2>
            {ownedProperties.length === 0 ? (
              <p>No properties owned yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ownedProperties.map(prop => (
                  <div key={prop.tokenId} className="border p-4 rounded shadow">
                    {prop.image && (
                      <img
                        src={`/uploads/property/${prop.image}`}
                        alt={prop.title}
                        className="w-full h-48 object-cover mb-2 rounded"
                      />
                    )}
                    <p><strong>Token ID:</strong> {prop.tokenId}</p>
                    <p><strong>Title:</strong> {prop.title}</p>
                    <p><strong>Location:</strong> {prop.location}</p>
                    <p><strong>Price:</strong> {prop.price} ETH</p>
                    <p><strong>Status:</strong> {prop.isListed ? 'Listed' : 'Not Listed'}</p>
                    {!prop.isListed && (
                      <div className="mt-2">
                        <input
                          type="number"
                          placeholder="Sale Price (ETH)"
                          onChange={(e) => (prop.tempPrice = e.target.value)}
                          className="border p-2 mr-2 rounded"
                        />
                        <button
                          onClick={() => listForSale(prop.tokenId, prop.tempPrice)}
                          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
                        >
                          List for Sale
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => navigate(`/property/${prop.tokenId}`)}
                      className="mt-2 bg-gray-500 text-white p-2 rounded hover:bg-gray-700"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Transaction History</h2>
            {transactionHistory.length === 0 ? (
              <p>No transactions yet.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Token ID</th>
                    <th className="border p-2">Role</th>
                    <th className="border p-2">Price (ETH)</th>
                    <th className="border p-2">Transaction Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionHistory.map((tx, index) => (
                    <tr key={index} className="border">
                      <td className="border p-2">{tx.tokenId}</td>
                      <td className="border p-2">
                        {tx.buyer.toLowerCase() === auth.user.wallet.toLowerCase() ? 'Buyer' : 'Seller'}
                      </td>
                      <td className="border p-2">{tx.price}</td>
                      <td className="border p-2">{mediumAddress(tx.transactionHash)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Listing Request Form */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">Request Property Listing</h2>
            <form onSubmit={handleListingSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Property Title"
                value={listingForm.title}
                onChange={handleListingChange}
                required
                className="border p-2 mb-3 w-full rounded"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={listingForm.location}
                onChange={handleListingChange}
                required
                className="border p-2 mb-3 w-full rounded"
              />
              <input
                type="number"
                name="price"
                placeholder="Price (ETH)"
                value={listingForm.price}
                onChange={handleListingChange}
                required
                className="border p-2 mb-3 w-full rounded"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={listingForm.description}
                onChange={handleListingChange}
                className="border p-2 mb-3 w-full rounded"
              />
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleListingChange}
                required
                className="border p-2 mb-3 w-full"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-700"
              >
                {loading ? 'Submitting...' : 'Submit Listing Request'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;