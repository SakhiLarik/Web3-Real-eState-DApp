import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const Sellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { api } = useAuth(); // Assuming useAuth is available from context

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await axios.get(`${api}/users/sellers`);
        setSellers(res.data.sellers);
      } catch (err) {
        setError('Failed to fetch sellers: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, [api]);

  return (
    <div>
      <Nav />
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto my-5 p-8 shadow">
          <h1 className="text-3xl font-bold mb-4">All Sellers</h1>
          <hr />
          {error && <p className="text-red-500">{error}</p>}
          {loading ? (
            <p>Loading...</p>
          ) : sellers.length === 0 ? (
            <p>No sellers found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {sellers.map(seller => (
                <div
                  key={seller.walletAddress}
                  className="border p-4 rounded shadow hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/seller/${seller.walletAddress}`)}
                >
                  {seller.photo && (
                    <img
                      src={`/uploads/user/${seller.photo}`}
                      alt={seller.name}
                      className="w-full h-48 object-cover mb-2 rounded"
                    />
                  )}
                  <h3 className="text-xl font-semibold">{seller.name}</h3>
                  <p className="text-gray-600">Email: {seller.email}</p>
                  <p className="text-gray-600">Wallet: {seller.walletAddress.slice(0, 6)}...{seller.walletAddress.slice(-4)}</p>
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

export default Sellers;