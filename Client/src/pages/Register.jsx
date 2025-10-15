import React, { useState } from "react";
import { useAuth } from "../context/AuthContext"; // Assuming AuthContext.js is in contexts
import Web3 from "web3"; // Assuming Web3.js is installed
import axios from "axios";
import Nav from "../components/Nav";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const Register = () => {
  const { api, allowUserLogin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    walletAddress: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setFormData({ ...formData, walletAddress: accounts[0] });
      } catch (err) {
        setError("Failed to connect wallet");
      }
    } else {
      setError("MetaMask not detected");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${api}/registerUser`,  JSON.stringify(formData), {
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.data;

      if (data.success) {
        // Use allowUserLogin to set auth state
        allowUserLogin({ user: data.user });
        setSuccess("Registration successful! Redirecting...");
        // Redirect to dashboard or home
        setTimeout(() => navigate("/dashboard"),2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Nav />
      <div className=" min-h-screen">
        <div className="max-w-xl my-5 shadow mx-auto p-8">
          <h1 className="text-3xl font-bold mb-4">Register</h1>
          <hr />
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="border p-2 mb-3 w-full rounded my-2"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border p-2 mb-3 w-full rounded my-2"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="border p-2 mb-3 w-full rounded my-2"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="border p-2 mb-3 w-full rounded my-2"
            />
            <div className="mb-3 flex">
               <input
                type="text"
                name="walletAddress"
                placeholder="Wallet Address (Connect wallet to see)"
                value={formData.walletAddress}
                readOnly
                className="border p-2 w-9/12"
              />
              <button
                type="button"
                onClick={connectWallet}
                className="bg-green-500 hover:bg-blue-700 text-white p-2"
              >
                Connect Wallet
              </button>
             
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-700 text-white p-2 w-full hover:bg-blue-900"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <hr />
          <p>Already have an account
          <a className="mx-2" href="/login">Login Here</a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
