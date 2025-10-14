import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
    role: localStorage.getItem("role") || null,
    loading: localStorage.getItem("loading") || false,
  });
  
  const emptyWallet = "0x0000000000000000000000000000000000000000";

  const api = "http://localhost:5000/api";

  const allowUserLogin = (credentials) => {
    setAuth({
      token: "user-token",
      user: {
        name: credentials.user.name,
        email: credentials.user.email,
        phone: credentials.user.phone,
        wallet: credentials.user.walletAddress,
      },
      role: "user",
      loading: false,
    });
    // Save to localstorage
    localStorage.setItem("token", "user-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: credentials.user.name,
        email: credentials.user.email,
        phone: credentials.user.phone,
        wallet: credentials.user.walletAddress,
      })
    );
    localStorage.setItem("role", "user");
    localStorage.setItem("loading", "false");
    return true;
  };

  const smallAddress = (address) => {
    return address.length > 10
      ? address.substr(0, 5) + "..." + address.substr(-5)
      : address;
  };

  const mediumAddress = (address) => {
    return address.substr(0, 8) + "..." + address.substr(-8);
  };

  // Check if someone is already logged in
  useEffect(() => {
    if (localStorage.getItem("role") === "user") {
      // Check and set user
      setAuth({
        token: "user",
        user: JSON.parse(localStorage.getItem("user")),
        role: "user",
        loading: false,
      });
    } else {
      // Logout if no one exists on local storage
      logout();
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("loading");
    setAuth({ token: null, user: null, role: null, loading: false });
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        api,
        auth,
        emptyWallet,
        setAuth,
        copyText,
        smallAddress,
        mediumAddress,
        allowUserLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
