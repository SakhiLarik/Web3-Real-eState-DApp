import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import axios from "axios";
import Web3 from "web3";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../config";

const AllProperties = () => {
  const { auth, api, mediumAddress } = useAuth();
  const navigate = useNavigate();
  const [listedProperties, setListedProperties] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  const buyProperty = async (tokenId) => {
    if (!auth.user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Get the ACTUAL price from the contract
      const property = await contract.methods.properties(tokenId).call();

      // console.log("Property price from contract:", property.price);
      // console.log("Property price in ETH:", web3.utils.fromWei(property.price, "ether"));
      const weiPrice = web3.utils.toWei(property.price.toString(), "ether");

      // Use the exact price from the contract
      const receipt = await contract.methods.buyProperty(tokenId).send({
        from: auth.user.wallet,
        value: weiPrice, // Use the EXACT price from contract (in Wei)
        gas: 500000,
      });

      console.log("Transaction receipt:", receipt);
      setSuccess(`Property #${tokenId} purchased successfully!`);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to buy property: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all listed properties
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = new Web3(
          window.ethereum || "http://127.0.0.1:7545"
        );
        await window.ethereum?.request({ method: "eth_requestAccounts" });
        const contractInstance = new web3Instance.eth.Contract(
          CONTRACT_ABI,
          CONTRACT_ADDRESS
        );
        setWeb3(web3Instance);
        setContract(contractInstance);
      } catch (err) {
        setError("Failed to initialize Web3");
      }
    };
    initWeb3();

    const fetchListedProperties = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${api}/property/listed`);
        setListedProperties(res.data.listed);
      } catch (err) {
        setError("Failed to fetch listed properties");
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
          {success && <p className="text-green-500">{success}</p>}
          {loading ? (
            <p>Loading...</p>
          ) : listedProperties.length === 0 ? (
            <p>No properties listed for sale.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {listedProperties.map((prop) => (
                <div key={prop.tokenId} className="border p-4 rounded shadow">
                  {prop.image && (
                    <img
                      src={`/uploads/property/${prop.image}`}
                      alt={prop.title}
                      className="w-full h-48 object-cover mb-2 rounded"
                    />
                  )}
                  <p>
                    <strong>Token ID:</strong> {prop.tokenId}
                  </p>
                  <p>
                    <strong>Title:</strong> {prop.title}
                  </p>
                  <p>
                    <strong>Location:</strong> {prop.location}
                  </p>
                  <p>
                    <strong>Price:</strong> {prop.price} ETH
                  </p>
                  <p>
                    <strong>Owner:</strong> {mediumAddress(prop.owner)}
                  </p>
                  {auth.user &&
                    auth.user.wallet.toLowerCase() !==
                      prop.owner.toLowerCase() && (
                      <button
                        onClick={() => buyProperty(prop.tokenId)}
                        disabled={loading}
                        className="mt-2 px-4 bg-green-500 text-white p-2 rounded hover:bg-green-700"
                      >
                        {loading ? "Buying..." : "Buy Now"}
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

export default AllProperties;
