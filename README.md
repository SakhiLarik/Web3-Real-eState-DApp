# Web3 Real Estate DApp

A blockchain-based Real Estate Decentralized Application (DApp) developed as an FYP to revolutionize property transactions by bringing transparency, efficiency, and security to the real estate industry using Ethereum smart contracts.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Smart Contract Deployment](#smart-contract-deployment)
  - [Running the App](#running-the-app)
- [Usage](#usage)
  - [User Roles](#user-roles)
  - [Key Functionalities](#key-functionalities)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [Team Members](#team-members)
- [License](#license)

---

## Project Overview

Web3 Real Estate DApp is designed to enable property buyers, sellers, and agents to interact securely without intermediaries. Utilizing Ethereum smart contracts, it ensures all transactions (listing, buying, verification) are transparent, tamper-proof, and trustless.

## Features

- Property listing and management on-chain
- Secure and transparent property purchase via smart contract
- Ownership transfer with blockchain records
- User wallet integrations (MetaMask/Web3 wallets)
- Property and ownership history
- Role-based access: Buyer, Seller, Agent
- Admin moderation and verification
- Event log and activity tracking
- Responsive and intuitive React-based frontend

## Architecture

1. **Frontend (React.js):** User-facing DApp interface for interacting with blockchain.
2. **Smart Contracts (Solidity):** Handles all property logic, ownership transfer, permissions, and funds.
3. **Web3 Integration:** Connects frontend to Ethereum blockchain (via ethers.js/web3.js).
4. **Storage (IPFS/Off-chain):** For non-sensitive metadata (e.g., property images).

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MetaMask or compatible Ethereum wallet
- Hardhat or Truffle (for development, testing, and deployment)
- Ganache (optional: for local blockchain testing)

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/SakhiLarik/Web3-Real-eState-DApp.git
    cd Web3-Real-eState-DApp
    ```

2. **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Smart Contract Deployment

1. **Compile contracts:**
    ```bash
    npx hardhat compile
    ```

2. **Deploy contracts to local/testnet:**
    ```bash
    npx hardhat run scripts/deploy.js --network localhost
    # or specify a test network
    ```

3. **Configure contract address in the frontend:**
   - Update the ABI and contract address in the frontend's service/config files.

### Running the App

1. **Start the React frontend:**
    ```bash
    npm start
    ```

2. **Access via:** [http://localhost:3000](http://localhost:3000)

---

## Usage

### User Roles

- **Buyer:** View properties, make offers, confirm purchases.
- **Seller:** List properties, accept/reject offers, transfer ownership.
- **Agent/Admin:** Verify listings, mediate disputes, approve property details.

### Key Functionalities

- **Wallet Connect:** Connect/disconnect Ethereum wallet (MetaMask, WalletConnect, etc.).
- **Property Listing:** Create, edit, and remove property listings.
- **Purchase Flow:** Initiate and confirm buying process; smart contract escrow.
- **Ownership Transfer:** Automated upon transaction completion.
- **History:** View property's ownership and transaction history.

---

## Tech Stack

- **Frontend:** React.js, web3.js/ethers.js, Bootstrap/Material-UI
- **Smart Contracts:** Solidity, Hardhat/Truffle
- **Blockchain:** Ethereum (local, testnet, mainnet)
- **Storage:** IPFS (for files), Ethereum blockchain (for core data)


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
