import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import axios from "axios";
import AdminNav from "../components/AdminNav";

const PropertyRequests = () => {
  const { api, auth, mediumAddress, copyText } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(
          `${api}/admin/property/requests/${auth.user.wallet}`
        );
        if (res.data.success) {
          setRequests(res.data.requests);
        } else {
          setError(res.data.message);
        }
      } catch (err) {
        setError("Failed to fetch requests" + err.message);
      }
    };
    fetchRequests();
  }, [api, auth.user?.wallet]);

  const approveRequest = async (requestId) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await axios.post(
        `${api}/admin/property/approve/${requestId}`,
        {
          wallet: auth.user.wallet,
        }
      );
      if (response.status === 200) {
        setSuccess(
          `Request ${requestId} approved and minted! Token ID: ${response.data.tokenId}`
        );
        // Refresh requests
        const res = await axios.get(
          `${api}/admin/property/requests/${auth.user.wallet}`
        );
        setRequests(res.data.requests);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Approval failed"+err.message);
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (requestId) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await axios.post(
        `${api}/admin/property/reject/${requestId}`,
        { wallet: auth.user.wallet },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        setSuccess(`Request ${requestId} rejected`);
        // Refresh requests
        const res = await axios.get(
          `${api}/admin/property/requests/${auth.user.wallet}`
        );
        setRequests(res.data.requests);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.message || "Rejection failed");
    } finally {
      setLoading(false);
    }
  };

  if (auth.role !== "admin") {
    navigate("/login");
    return null;
  }

  return (
    <div>
      <AdminNav />
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto my-5 p-8 shadow">
          <h1 className="text-3xl font-bold mb-4">Property Mint Requests</h1>
          <hr />
          {error && <p className="text-rose-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}

          {requests.length === 0 ? (
            <p>No pending requests.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((req) => (
                <div key={req._id} className="border p-4 rounded shadow">
                  {req.image && (
                    <img
                      src={`/uploads/property/${req.image}`}
                      alt={req.title}
                      className="w-full h-48 object-cover mb-2 rounded"
                    />
                  )}
                  <p>
                    <strong>Title:</strong> {req.title}
                  </p>
                  <p>
                    <strong>Location:</strong> {req.location}
                  </p>
                  <p>
                    <strong>Price:</strong> {req.price} ETH
                  </p>
                  <p>
                    <strong>Description:</strong> {req.description}
                  </p>
                  <p>
                    <strong>User:</strong> {mediumAddress(req.userAddress)}{" "}
                    <i
                      className="fa fas far fab fa-copy text-blue-600 cursor-pointer"
                      onClick={() => copyText(req.userAddress)}
                    ></i>
                  </p>
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => approveRequest(req._id)}
                      disabled={loading}
                      className="bg-green-500 px-4 text-white p-2 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectRequest(req._id)}
                      disabled={loading}
                      className="bg-rose-500 px-4 text-white p-2 rounded hover:bg-rose-700"
                    >
                      Reject
                    </button>
                  </div>
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

export default PropertyRequests;
