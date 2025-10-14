import React from "react";

function Nav() {
  return (
    <nav className="bg-blue-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">NFT Real Estate</h1>
        <div>
          <a
            href="/"
            className="px-6 text-white py-2.5 rounded hover:bg-blue-500 "
          >
            Home
          </a>
          <a
            href="/properties"
            className="px-6 text-white py-2.5 rounded hover:bg-blue-500 "
          >
            Properties
          </a>
          <a
            href="dashboard.html"
            className="px-6 text-white py-2.5 rounded hover:bg-blue-500 "
          >
            Sellers
          </a>
           <a
            href="/register"
            className="px-6 text-white py-2.5 rounded hover:bg-blue-500 "
          >
            Register
          </a>
          <a href="/login" className="px-6 text-white py-2.5 rounded hover:bg-blue-500 ">
            Login 
          </a>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
