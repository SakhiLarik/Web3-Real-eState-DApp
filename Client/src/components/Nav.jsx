import React from "react";

function Nav() {
  return (
    <nav className="bg-blue-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">NFT Real Estate</h1>
        <div>
          <a
            href="/"
            className="px-6 text-white py-2.5 rounded hover:bg-blue-500 mx-2"
          >
            Home
          </a>
          <a
            href="/properties"
            className="px-6 text-white py-2.5 rounded hover:bg-blue-500 mx-2"
          >
            Properties
          </a>
          <a
            href="dashboard.html"
            className="px-6 text-white py-2.5 rounded hover:bg-blue-500 mx-2"
          >
            Sellers
          </a>
          <button className="bg-blue-500 px-6 mx-2 py-2 rounded hover:bg-blue-600">
            {" "}
            Login <i className="fa fas far fab fa-sign-in"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
