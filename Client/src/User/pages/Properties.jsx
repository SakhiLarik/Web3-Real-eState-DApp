import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Web3 from 'web3';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../../config';
import { useNavigate } from 'react-router-dom';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import axios from 'axios';
import AuthCheck from '../../components/AuthCheck';

const Properties = () => {
  const { api, auth, mediumAddress } = useAuth();
  const navigate = useNavigate();
  const [ownedProperties, setOwnedProperties] = useState([]);
  const [requestedProperties, setRequestedProperties] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
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
          if (owner.toLowerCase() === auth.user?.wallet.toLowerCase()) {
            const details = await contract.methods.getPropertyDetails(i).call();
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
        setError('Failed to fetch owned properties');
      }
    };
    fetchOwnedProperties();
  }, [web3, contract, auth.user?.wallet, api]);

  // Fetch requested properties
  useEffect(() => {
    const fetchRequestedProperties = async () => {
      try {
        const res = await axios.get(`${api}/property/requests/${auth.user?.wallet}`);
        setRequestedProperties(res.data.requests.map(req => ({
          ...req,
          price: req.price.toString(),
        })));
      } catch (err) {
        setError('Failed to fetch requested properties');
      }
    };
    fetchRequestedProperties();
  }, [api, auth.user?.wallet]);

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
    formData.append('userAddress', auth.user?.wallet);

    try {
      const response = await axios.post(`${api}/property/request`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setSuccess('Listing request submitted! Awaiting admin approval.');
        setListingForm({ title: '', location: '', price: '', description: '', image: null });
        setShowPopup(false);
        // Refresh requested properties
        const res = await axios.get(`${api}/property/requests/${auth.user?.wallet}`);
        setRequestedProperties(res.data.requests);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // List for sale
  const listForSale = async (tokenId, price) => {
    try {
      const weiPrice = web3.utils.toWei(price.toString(), 'ether');
      await contract.methods.listPropertyForSale(tokenId, weiPrice).send({ from: auth.user?.wallet });
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
      <AuthCheck />
      <Nav />
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto my-5 p-8 shadow">
          <h1 className="text-3xl font-bold mb-4">Your Properties</h1>
          <hr />
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}

          {/* Owned Properties */}
          <div className="mb-8">
            <h2 className="text-2xl text-secondary font-semibold mb-2">Owned Properties</h2>
            {ownedProperties.length === 0 ? (
              <p>No owned properties.</p>
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

<hr />
          {/* Requested Properties */}
          <div className="mb-8">
            <div className='flex justify-between my-4 items-center'>
            <h2 className="text-2xl text-secondary font-semibold mb-2">Requested Properties</h2>
            <button
              onClick={() => setShowPopup(true)}
              className="bg-green-500 px-4 text-white p-1 rounded hover:bg-green-700"
            >
              Request New Property
            </button>
            </div>
            {requestedProperties.length === 0 ? (
              <p>No requests made.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requestedProperties.map((req, index) => (
                  <div key={index} className="border p-4 rounded shadow">
                    {req.image && (
                      <img
                        src={`/uploads/property/${req.image}`}
                        alt={req.title}
                        className="w-full h-48 object-cover mb-2 rounded"
                      />
                    )}
                    <p><strong>Title:</strong> {req.title}</p>
                    <p><strong>Location:</strong> {req.location}</p>
                    <p><strong>Price:</strong> {req.price} ETH</p>
                    <p><strong>Status:</strong> {req.status}</p>
                    {req.tokenId && (
                      <p><strong>Token ID:</strong> {req.tokenId}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Popup for New Request */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-5 rounded shadow max-w-xl w-full">
              <h2 className="text-2xl font-semibold mb-4">Request New Property</h2>
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
                  required
                  rows={5}
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
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPopup(false)}
                    className="bg-gray-500 text-white p-2 px-4 mr-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white p-2 px-4 rounded hover:bg-blue-800"
                  >
                    {loading ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Properties;