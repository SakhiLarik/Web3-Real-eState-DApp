const { Web3 } = require("web3");
const User = require("../models/User");
const Property = require("../models/Properity");
const Images = require("../models/Images");
const abi = require("../../Contract/RealStateNFT.json");
require("dotenv").config();

const express = require("express");
const multer = require("multer");

const web3 = new Web3(process.env.GANACHE_URL || "http://127.0.0.1:7545");
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(abi, contractAddress);

// Admin account for signing transactions (from Ganache)
// const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY; // Add to .env
// const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
// web3.eth.accounts.wallet.add(adminPrivateKey);


const router = express.Router();
// Upload Files Storage
const storageUser = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "./uploads/user/"); // Specify the destination folder
    cb(null, "../client/public/uploads/user/"); // Specify the destination folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const storageProperty = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "./uploads/property/"); // Specify the destination folder
    cb(null, "../client/public/uploads/property/"); // Specify the destination folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadUser = multer({ storage: storageUser });
const uploadProperty = multer({ storage: storageProperty });

// Upload Files => Anyone
router.post(
  "/upload/profile/",
  uploadUser.single("profile"),
  async (req, res) => {
    const file = req.file;
    const wallet = req.body.user;
    if (!req.file) {
      return res
        .status(200)
        .json({ success: false, message: "No file provided." });
    }
    try {
      let update = await User.updateOne(
        { walletAddress: wallet },
        { $set: { profile: req.file.filename } }
      );
      if (update) {
        res.status(200).json({ success: true, filename: req.file.filename });
      } else {
        res
          .status(200)
          .json({ success: false, message: "Update failed! try again" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  }
);

router.post("/registerUser", async (req, res) => {
  try {
    const { name, email, password, phone, walletAddress } = req.body;
    const trx = { from: walletAddress, gas: 3000000 };

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({success: true, message: "User already exists" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      walletAddress,
    });

    await user.save();
    // Save to Blockchain
    if (user) {
      const blockchainUser = await contract.methods
        .registerUser(name, email, phone, password, walletAddress)
        .send(trx);
        res
          .status(200)
          .json({ success: true, message: "User registered successfully", user });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

router.post("/loginUser", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && user.password == password) {
      res
        .status(200)
        .json({ success: true, message: "Login successful", user });
    } else {
      return res.status(200).json({success: true, message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({success: false, message: "Server error", error });
  }
});

router.post("/loginUserWeb3", async (req, res) => {
  const { walletAddress } = req.body;
  try {
    const blockchainUser = await contract.methods
      .getUserDetails(walletAddress)
      .call();
    if (blockchainUser) {
      const user = await User.findOne({ walletAddress });
      if (user) {
        res
          .status(200)
          .json({ success: true, message: "Login successful", user });
      } else {
        res.status(200).json({
          sucess: false,
          message: "Login failed! can't validate your data",
        });
      }
    } else {
      res.status(200).json({
        sucess: false,
        message: "Login failed! this wallet address is not registered",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({success: false, message: "Wallet not registered on blockchain" });
  }
});

// Get Property Image
router.get("/property/image/:tokenId", async (req, res) => {
  try {
    const property = await Property.findOne({ tokenId: req.params.tokenId });
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json({ image: property.image });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Get User Details
router.get("/user/:wallet", async (req, res) => {
  try {
    const requests = await User.find({ walletAddress: req.params.wallet });
    res.status(200).json({success:true, user:requests });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


// Get User Property Requests
router.get("/property/requests/:userAddress", async (req, res) => {
  try {
    const requests = await Property.find({ userAddress: req.params.userAddress });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(200).json({success:false, message: "Server error", error });
  }
});


// Create Property Mint Request (User)
router.post(
  "/property/request",
  uploadProperty.single("image"),
  async (req, res) => {
    try {
      const { title, location, price, description, userAddress } = req.body;
      const image = req.file?.filename;

      if (!title || !location || !price || !userAddress || !description || !image) {
        return res.status(200).json({ success:false, message: "Missing required fields" });
      }

      const request = new Property({
        userAddress,
        title,
        location,
        price: parseFloat(price),
        description: description,
        image,
        isListed: false
      });

      await request.save();

      res.status(201).json({ message: "Mint request created", requestId: request._id });
    } catch (error) {
      res.status(200).json({ success: false, message: "Server error"+ error });
    }
  }
);

// Get User's Requested and Owned Properties (for Properties page)
router.get("/property/user/:userAddress", async (req, res) => {
  try {
    const userAddress = req.params.userAddress;

    // Requested properties from MongoDB
    const requested = await Property.find({ userAddress });

    // Owned properties from blockchain (simplified; in production, cache or optimize)
    const tokenCount = await contract.methods.getTokenCounter().call();
    const owned = [];
    for (let i = 1; i <= tokenCount; i++) {
      try {
        const owner = await contract.methods.ownerOf(i).call();
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          const details = await contract.methods.getPropertyDetails(i).call();
          const mongoProp = await Property.findOne({ tokenId: i });
          owned.push({
            tokenId: i,
            title: details[0],
            location: details[1],
            price: web3.utils.fromWei(details[2], 'ether'),
            owner: details[3],
            isListed: details[4],
            image: mongoProp?.image || '',
            status: 'owned', // Added for distinction
          });
        }
      } catch {} // Skip invalid tokens
    }

    res.status(200).json({ requested, owned });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Get All Pending Mint Requests (Admin only)
router.get("/admin/property/requests", async (req, res) => {
  try {
    const wallet = req.query.wallet; // Assume passed as query; use auth in production
    if (!wallet) {
      return res.status(400).json({ message: "Wallet address required" });
    }

    const owner = await contract.methods.owner().call();
    if (wallet.toLowerCase() !== owner.toLowerCase()) {
      return res.status(403).json({ message: "Unauthorized - Not admin" });
    }

    const requests = await Property.find({ status: 'pending' }).populate('userAddress', 'name email'); // Optional populate if needed

    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


router.use(express.json());

router.get("/", (req, res) => {
  res.send("API is running");
});

module.exports = router;
