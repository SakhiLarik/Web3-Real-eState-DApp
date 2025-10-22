import React from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

function Home() {
  return (
    <div>
      <Nav />
      <section className="bg-blue-800 text-white text-center py-24">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold my-4">
            Welcome to the Future of Real Estate
          </h2>
          <p className="text-lg my-10">
            Buy, sell, and manage tokenized real estate on the blockchain with
            our NFT Marketplace.
          </p>
          <br />
          <a
            href="/all_properties/"
            className="bg-blue-500 mx-3 text-white px-6 py-3 rounded hover:bg-blue-600"
          >
            Explore Properties
          </a>
          <a
            href="/sellers/"
            className="bg-blue-500 mx-3 text-white px-6 py-3 rounded hover:bg-blue-600"
          >
            Explore Sellers
          </a>
        </div>
      </section>

      <section className="container mx-auto my-5 py-12">
        <h3 className="text-3xl font-bold text-center mb-8">Why Choose Us?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded shadow">
            <h4 className="text-xl font-semibold mb-2">
              Decentralized Ownership
            </h4>
            <p>Securely own and transfer property NFTs on the blockchain.</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h4 className="text-xl font-semibold mb-2">
              Transparent Transactions
            </h4>
            <p>
              All deals are recorded on-chain for maximum trust and security.
            </p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h4 className="text-xl font-semibold mb-2">Tokenized & NFT</h4>
            <p>
              Listing, Selling, and Purchasing through blockchain Tokens & NFT.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Home;
