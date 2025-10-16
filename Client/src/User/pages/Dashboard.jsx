import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import Web3 from "web3";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../../config";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import axios from "axios";

const Dashboard = () => {
  const { api, auth, mediumAddress, copyText } = useAuth();
  const wallet = auth.user?auth.user.wallet:"";
  const navigate = useNavigate();
  const [ownedCount, setOwnedCount] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0)
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  // Initialize Web3 and contract
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = new Web3("http://127.0.0.1:7545");
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
  }, []);

  // Fetch quantitative info
  useEffect(() => {
    const fetchStats = async () => {
      if (!web3 || !contract || !wallet) return;
      try {
        // Owned count
        const tokenCount = await contract.methods.getTokenCounter().call();
        let owned = 0;
        for (let i = 1; i <= tokenCount; i++) {
          const owner = await contract.methods.ownerOf(i).call();
          if (owner.toLowerCase() === wallet.toLowerCase()) owned++;
        }
        setOwnedCount(owned);

        // Sold count from events
        const soldEvents = await contract.getPastEvents("PropertySold", {
          filter: { seller: wallet },
          fromBlock: 0,
        });
        setSoldCount(soldEvents.length);

        // Request count from MongoDB
        if(auth){
          const res = await axios.get(
            `${api}/property/requests/${wallet}`
          );
          setRequestCount(res.data.requests.length);
        }
      } catch (err) {
        setError("Failed to fetch stats" + err);
      }
    };
    fetchStats();
  }, [web3, contract, wallet, api]);

  const handleCopy = (text) => {
    copyText(text);
  };
  return (
    <div>
      <Nav />
      <div className="min-h-screen">
        <hr />

        <div className="max-w-4xl mx-auto my-5 p-8 shadow">
          {/* Profile Settings */}
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <div className="mb-8">
            <h2 className="text-2xl  font-semibold">
              Welcome, {auth.user&&auth.user.name}
            </h2>
            <div className="flex items-center">
              <div className="m-3">
                <p>
                  <strong>Email:</strong> {auth.user&&auth.user.email}
                </p>
                <p>
                  <strong>Phone:</strong> {auth.user&&auth.user.phone}
                </p>
                <p>
                  <strong>Wallet:</strong> {mediumAddress(wallet)}{" "}
                  <i
                    className="fas far fab fa-copy cursor-pointer"
                    onClick={handleCopy(wallet)}
                  ></i>
                </p>
              </div>
            </div>
          </div>
          {/* Property Statistics */}
          <hr />
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
