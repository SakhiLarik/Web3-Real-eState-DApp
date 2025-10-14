const { Web3 } = require("web3");
const User = require("../models/User");
const Property = require("../models/Properity");
const Images = require("../models/Images");
const abi = require("../../Contract/ReakStateNFT.json");
require("dotenv").config();

const express = require("express");
const multer = require("multer");

const web3 = new Web3(process.env.GANACHE_URL || "http://127.0.0.1:7545");
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(abi, contractAddress);

const router = express.Router();
// Upload Files Storage
const storageUser = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/user/"); // Specify the destination folder
    cb(null, "../client/public/uploads/user/"); // Specify the destination folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadUser = multer({ storage: storageUser });

// Upload Docs Files Storage
const StorageDocs = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/document/"); // Specify the destination folder
    cb(null, "../client/public/uploads/document/"); // Specify the destination folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadDocs = multer({ storage: StorageDocs });

// Upload Files => Anyone
router.post(
  "/upload/profile/",
  uploadUser.single("user_image"),
  async (req, res) => {
    const file = req.file;
    const cnic = req.body.user_cnic;
    if (!req.file) {
      return res
        .status(500)
        .json({ success: false, message: "No file provided." });
    } else {
      let update = await User.updateOne(
        { cnic: cnic },
        { $set: { photo: req.file.filename } }
      );
      if (update) {
        res.status(200).json({ success: true, filename: req.file.filename });
      } else {
        res
          .status(200)
          .json({ success: false, message: "Update failed! try again" });
      }
    }
  }
);

router.post("/registerUser", async (req, res) => {
  try {
    const { name, profile, email, password, phone, walletAddress } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name,
      profile: profile || "", // Optional
      email,
      password: hashedPassword,
      phone,
      walletAddress,
    });

    await newUser.save();

    // Return user data without password
    const userData = {
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      walletAddress: newUser.walletAddress,
    };

    res
      .status(201)
      .json({ message: "User registered successfully", user: userData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/loginUser", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Return user data without password
    const userData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      walletAddress: user.walletAddress,
    };

    res.status(200).json({ message: "Login successful", user: userData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.use(express.json());

router.get("/", (req, res) => {
  res.send("API is running");
});

module.exports = router;
