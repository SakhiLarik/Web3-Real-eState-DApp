import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const SellerDetails = () => {
  const { walletAddress } = useParams();
  const [properties, setProperties] = useState([]);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { api } = useAuth(); // Assuming useAuth is available from context

  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        const res = await axios.get(`${api}/property/user/${walletAddress}`);
        const listedProps = res.data.owned.filter(prop => prop.isListed);
        setProperties(listedProps);

        const sellerRes = await axios.get(`${api}/users/sellers`);
        const seller = sellerRes.data.sellers.find(s => s.walletAddress.toLowerCase() === walletAddress.toLowerCase());
        setSellerInfo(seller);
      } catch (err) {
        setError('Failed to fetch seller details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSellerDetails();
  }, [api, walletAddress]);

  if (!sellerInfo) {
    navigate('/sellers');
    return null;
  }

  return (
    <div>
      <Nav />
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto my-5 p-8 shadow">
          <h1 className="text-3xl font-bold mb-4">Seller: {sellerInfo.name}</h1>
          <hr />
          {error && <p className="text-red-500">{error}</p>}
          {loading ? (
            <p>Loading...</p>
          ) : properties.length === 0 ? (
            <p>No listed properties found for this seller.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {properties.map(prop => (
                <div key={prop.tokenId} className="border p-4 rounded shadow">
                  {prop.image && (
                    <img
                      src={`/uploads/property/${prop.image}`}
                      alt={prop.title}
                      className="w-full h-48 object-cover mb-2 rounded"
                    />
                  )}
                  <h3 className="text-xl font-semibold">{prop.title}</h3>
                  <p className="text-gray-600">Location: {prop.location}</p>
                  <p className="text-gray-600">Price: {prop.price} ETH</p>
                  <button
                    onClick={() => navigate(`/property/${prop.tokenId}`)}
                    className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SellerDetails;