import React from 'react'

function Home() {
  return (
    <div>
  <nav className="bg-blue-900 text-white p-4">
    <div className="container mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold">NFT Real Estate</h1>
      <div>
        <a href="index.html" className="px-4 hover:text-blue-300">Home</a>
        <a href="listings.html" className="px-4 hover:text-blue-300">Properties</a>
        <a href="dashboard.html" className="px-4 hover:text-blue-300">Dashboard</a>
        <button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">Connect Wallet</button>
      </div>
    </div>
  </nav>
  <section className="bg-blue-800 text-white text-center py-20">
    <div className="container mx-auto">
      <h2 className="text-4xl font-bold mb-4">Welcome to the Future of Real Estate</h2>
      <p className="text-lg mb-6">Buy, sell, and manage tokenized real estate on the blockchain with our NFT Marketplace.</p>
      <a href="listings.html" className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600">Explore Properties</a>
    </div>
  </section>

  <section className="container mx-auto py-12">
    <h3 className="text-3xl font-bold text-center mb-8">Why Choose Us?</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-white p-6 rounded shadow">
        <h4 className="text-xl font-semibold mb-2">Decentralized Ownership</h4>
        <p>Securely own and transfer property NFTs on the blockchain.</p>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <h4 className="text-xl font-semibold mb-2">Fractional Investment</h4>
        <p>Invest in real estate by purchasing fractions of high-value properties.</p>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <h4 className="text-xl font-semibold mb-2">Transparent Transactions</h4>
        <p>All deals are recorded on-chain for maximum trust and security.</p>
      </div>
    </div>
  </section>

  <footer className="bg-blue-900 text-white text-center py-4">
    <p>© 2025 Real Estate NFT Marketplace. All rights reserved.</p>
  </footer>

    </div>
  )
}

export default Home