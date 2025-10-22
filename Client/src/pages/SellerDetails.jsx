import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Web3 from 'web3';
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config'
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const SellerDetails = () => {
  const { walletAddress } = useParams();
  const [properties, setProperties] = useState([]);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { auth, api, mediumAddress } = useAuth();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

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


    const fetchSellerDetails = async () => {
      try {
        const res = await axios.get(
          `${api}/properties/userAcount/${walletAddress}`
        );
        const listedProps = res.data.owned.filter((prop) => prop.isListed);
        setProperties(listedProps);

        const sellerRes = await axios.get(`${api}/users/sellers`);
        const seller = sellerRes.data.sellers.find(
          (s) => s.walletAddress.toLowerCase() === walletAddress.toLowerCase()
        );
        setSellerInfo(seller);
        console.log("SELLER INFO====================================");
        console.log(sellerInfo);
        console.log("====================================");
      } catch (err) {
        setError("Failed to fetch seller details: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSellerDetails();
  }, []);

   const buyProperty = async (tokenId, price) => {
    if (!auth.user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const accounts = await web3.eth.getAccounts();
      const weiPrice = web3.utils.toWei(price.toString(), 'ether');

      await contract.methods.buyProperty(tokenId)
        .send({ from: accounts[0], value: weiPrice, gas: 3000000 });

      // Refresh properties after purchase
      const res = await axios.get(`${api}/property/user/${walletAddress}`);
      const listedProps = res.data.owned.filter(prop => prop.isListed);
      setProperties(listedProps);
      setSuccess(`Property #${tokenId} purchased successfully!`);
    } catch (err) {
      setError('Failed to buy property: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!sellerInfo) {
    // navigate("/sellers");
    return (
        <div>
            <Nav />
            <div className="min-h-screen my-5 text-center text-3xl">
                Loading...
            </div>
            <Footer />
        </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto my-5 p-8 shadow">
          <h1 className="text-3xl font-bold">Seller: {sellerInfo.name}</h1>
          <h4 className="text-sm text-secondary">Email: {sellerInfo.email}</h4>
          <h4 className="text-sm text-secondary">Wallet: {mediumAddress(sellerInfo.walletAddress)}</h4>
          <hr />
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          {loading ? (
            <p>Loading...</p>
          ) : properties.length === 0 ? (
            <p>No listed properties found for this seller.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {properties.map((prop) => (
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
                  {auth.user && auth.user.wallet.toLowerCase() !== prop.owner.toLowerCase() && (
                    <button
                      onClick={() => buyProperty(prop.tokenId, prop.price)}
                      disabled={loading}
                      className="mt-2 px-4 bg-green-500 text-white p-2 rounded hover:bg-green-700"
                    >
                      {loading ? 'Buying...' : 'Buy Now'}
                    </button>
                  )}
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
