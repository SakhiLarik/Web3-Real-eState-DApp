import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Web3 from 'web3';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../../config';
import { useNavigate } from 'react-router-dom';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

const History = () => {
  const { auth, mediumAddress } = useAuth();
  const navigate = useNavigate();
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [error, setError] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  // Initialize Web3 and contract
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = new Web3('http://127.0.0.1:7545');
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

  // Fetch transaction history
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (!web3 || !contract || !auth.user?.wallet) return;
      try {
        const events = await contract.getPastEvents('allEvents', {
          fromBlock: 0,
        });
        const userEvents = events.filter(event => 
          (event.returnValues.buyer && event.returnValues.buyer.toLowerCase() === auth.user.wallet.toLowerCase()) ||
          (event.returnValues.seller && event.returnValues.seller.toLowerCase() === auth.user.wallet.toLowerCase()) ||
          (event.returnValues.owner && event.returnValues.owner.toLowerCase() === auth.user.wallet.toLowerCase())
        );
        const history = userEvents.map(event => ({
          eventName: event.event,
          tokenId: event.returnValues.tokenId,
          price: event.returnValues.price ? web3.utils.fromWei(event.returnValues.price, 'ether') : 'N/A',
          from: event.returnValues.seller || event.returnValues.from || 'N/A',
          to: event.returnValues.buyer || event.returnValues.to || 'N/A',
          transactionHash: event.transactionHash,
        }));
        setTransactionHistory(history);
      } catch (err) {
        setError('Failed to fetch transaction history');
      }
    };
    fetchTransactionHistory();
  }, [web3, contract, auth.user?.wallet]);

  if (!auth.user) {
    navigate('/login');
    return null;
  }

  return (
    <div>
      <Nav />
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto my-5 p-8 shadow">
          <h1 className="text-3xl font-bold mb-4">Transaction History</h1>
          <hr />
          {error && <p className="text-red-500">{error}</p>}

          {transactionHistory.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Event</th>
                  <th className="border p-2">Token ID</th>
                  <th className="border p-2">Price (ETH)</th>
                  <th className="border p-2">From</th>
                  <th className="border p-2">To</th>
                  <th className="border p-2">Transaction Hash</th>
                </tr>
              </thead>
              <tbody>
                {transactionHistory.map((tx, index) => (
                  <tr key={index} className="border">
                    <td className="border p-2">{tx.eventName}</td>
                    <td className="border p-2">{tx.tokenId}</td>
                    <td className="border p-2">{tx.price}</td>
                    <td className="border p-2">{mediumAddress(tx.from)}</td>
                    <td className="border p-2">{mediumAddress(tx.to)}</td>
                    <td className="border p-2">{mediumAddress(tx.transactionHash)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default History;