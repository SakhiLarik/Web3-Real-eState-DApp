import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import axios from 'axios';

const AllProperties = () => {
  const { api, mediumAddress } = useAuth();
  const navigate = useNavigate();
  const [listedProperties, setListedProperties] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all listed properties
  useEffect(() => {
    const fetchListedProperties = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${api}/property/listed`);
        setListedProperties(res.data.listed);
      } catch (err) {
        setError('Failed to fetch listed properties');
      } finally {
        setLoading(false);
      }
    };
    fetchListedProperties();
  }, [api]);

  return (
    <div>
      <Nav />
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto my-5 p-8 shadow">
          <h1 className="text-3xl font-bold mb-4">All Listed Properties</h1>
          <hr />
          {error && <p className="text-red-500">{error}</p>}
          {loading ? (
            <p>Loading...</p>
          ) : listedProperties.length === 0 ? (
            <p>No properties listed for sale.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {listedProperties.map(prop => (
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
                  <p><strong>Owner:</strong> {mediumAddress(prop.owner)}</p>
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

export default AllProperties;