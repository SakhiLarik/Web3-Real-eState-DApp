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

  // Check if web3 and contract are initialized
  if (!web3 || !contract) {
    setError("Web3 not initialized. Please refresh the page.");
    return;
  }

  setLoading(true);
  setError("");
  setSuccess(""); // Clear previous success messages
  
  try {
    // Verify MetaMask connection
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    // Request accounts to ensure connection is active
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (accounts.length === 0 || accounts[0].toLowerCase() !== auth.user.wallet.toLowerCase()) {
      throw new Error("Please connect the correct MetaMask account");
    }

    console.log("Fetching property details for token:", tokenId);
    
    // Get property details from contract
    const property = await contract.methods.properties(tokenId).call();
    
    console.log("Property details:", {
      price: property.price,
      priceInEth: web3.utils.fromWei(property.price, "ether"),
      isListed: property.isListed,
      owner: property.owner
    });

    // Verify property is listed
    if (!property.isListed) {
      throw new Error("Property is not listed for sale");
    }

    // Check if trying to buy own property
    const currentOwner = await contract.methods.ownerOf(tokenId).call();
    if (currentOwner.toLowerCase() === auth.user.wallet.toLowerCase()) {
      throw new Error("You cannot buy your own property");
    }

    console.log("Sending transaction...");
    
    // Send the transaction
    const receipt = await contract.methods.buyProperty(tokenId).send({
      from: auth.user.wallet,
      value: property.price,
      gas: 500000,
    });

    console.log("Transaction successful:", receipt);
    setSuccess(`Property #${tokenId} purchased successfully!`);
    
    // Refresh the property list after successful purchase
    fetchListedProperties();
    
  } catch (err) {
    console.error("Full error:", err);
    
    // Better error messages
    let errorMessage = err.message;
    
    if (err.message.includes("User denied")) {
      errorMessage = "Transaction was rejected";
    } else if (err.message.includes("insufficient funds")) {
      errorMessage = "Insufficient funds in your wallet";
    } else if (err.message.includes("connection")) {
      errorMessage = "Lost connection to MetaMask. Please refresh and try again.";
    }
    
    setError("Failed to buy property: " + errorMessage);
  } finally {
    setLoading(false);
  }
};

// Separate function to fetch properties
const fetchListedProperties = async () => {
  setLoading(true);
  try {
    const res = await axios.get(`${api}/property/listed`);
    setListedProperties(res.data.listed);
  } catch (err) {
    console.error("Error fetching properties:", err);
    setError("Failed to fetch listed properties");
  } finally {
    setLoading(false);
  }
};

// Initialize Web3 once when component mounts
useEffect(() => {
  const initWeb3 = async () => {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        setError("Please install MetaMask to use this feature");
        return;
      }

      console.log("Initializing Web3...");
      
      // Create Web3 instance
      const web3Instance = new Web3(window.ethereum);
      
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });
      
      console.log("Connected accounts:", accounts);
      
      // Get network info
      const chainId = await web3Instance.eth.getChainId();
      console.log("Connected to chain ID:", chainId);
      
      // Initialize contract
      const contractInstance = new web3Instance.eth.Contract(
        CONTRACT_ABI,
        CONTRACT_ADDRESS
      );
      
      console.log("Contract initialized at:", CONTRACT_ADDRESS);
      
      setWeb3(web3Instance);
      setContract(contractInstance);
      
    } catch (err) {
      console.error("Web3 initialization error:", err);
      setError("Failed to initialize Web3: " + err.message);
    }
  };

  initWeb3();
  fetchListedProperties();
  
  // Listen for account changes
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      console.log("Account changed:", accounts);
      if (accounts.length === 0) {
        setError("Please connect to MetaMask");
      } else {
        // Optionally reload the page or update state
        window.location.reload();
      }
    });

    window.ethereum.on('chainChanged', () => {
      console.log("Chain changed, reloading...");
      window.location.reload();
    });
  }

  // Cleanup listeners on unmount
  return () => {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  };
}, [api]); // Only re-run if api changes

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
