import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../config";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Web3 from "web3";
import { useAuth } from "../context/AuthContext";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { api, allowUserLogin, smallAddress } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [wallet, setWallet] = useState("");
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
        const walletAddress = accounts[0];
        setWallet(walletAddress);
        const res = await axios.post(`${api}/loginUserWeb3`, {walletAddress:walletAddress} ,{
          headers:{
            "Content-Type":"application/json",
          },
        });
        const user = res.data.user;
        if (user && walletAddress.toLowerCase() === user.walletAddress.toLowerCase()) {
          allowUserLogin({ user });
          setSuccess("Login successful! Redirecting...");
          navigate("/dashboard");
        } else {
          setError("Sorry your account is not registerd!");
        }
      } catch (err) {
        setError("Failed to login with wallet, try again");
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
      const response = await axios.post(
        `${api}/loginUser`,
        JSON.stringify(formData),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.data;

      if (data.success) {
        allowUserLogin({ user: data.user });
        setSuccess("Login successful! Redirecting...");
        navigate("/dashboard");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Network error" + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (error) {
      setSuccess("");
    }
    if (success) {
      setError("");
    }
  }, [setError, setSuccess, error, success]);
  return (
    <div>
      <Nav />
      <div className="min-h-screen">
        <div className="max-w-md mx-auto my-5 p-8 shadow">
          <h2 className="text-3xl font-bold mb-4">Login</h2>
          <hr />
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border p-2 mb-3 w-full rounded"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="border p-2 mb-3 w-full rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white p-2 w-full"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div>
            <hr />
            <p className="my-2 text-sm">Use Web3 Wallet to Login</p>
            <button
              onClick={connectWallet}
              type="button"
              className="bg-green-500 hover:bg-blue-700 text-white p-2 w-full"
            >
              {!wallet && (
                <>
                  <i className="fa fas far fab fa-globe-europe"></i> Connect
                  Wallet{" "}
                </>
              )}
              {wallet && (
                <>
                  <i className="fa fas far fab fa-globe-europe"></i>{" "}
                  {smallAddress(wallet)} Login
                </>
              )}
            </button>
          </div>
          <hr />
          <p>
            Don't have an account
            <a className="mx-2" href="/register">
              Register Here
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
