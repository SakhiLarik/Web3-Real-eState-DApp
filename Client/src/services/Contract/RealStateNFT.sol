// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateNFT is ERC721, Ownable {
    uint256 public _tokenIdCounter;

    // Struct to store property details on-chain
    struct Property {
        string title; // e.g., "Modern Apartment"
        string location; // e.g., "Downtown, New York"
        uint256 price; // Price in wei
        address owner; // Current owner of the property
        bool isListed; // Is the property listed for sale?
    }

    // Mapping from token ID to property details
    mapping(uint256 => Property) public properties;

    struct User {
        string name;
        string email;
        string phone;
        string password;
        address walletAddress;
    }

    mapping(uint256 => User) public users;

    uint256 public userIdCounter = 1;

    address[] public registeredAddresses;

    // Events for marketplace actions
    event PropertyMinted(
        uint256 indexed tokenId,
        address owner,
        string title,
        string location,
        uint256 price
    );
    event PropertyListed(
        uint256 indexed tokenId,
        uint256 price,
        address seller
    );
    event PropertySold(
        uint256 indexed tokenId,
        address buyer,
        address seller,
        uint256 price
    );

    constructor() ERC721("RealEstateNFT", "RENFT") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }

    // Register user
    function registerUser(
        string memory name,
        string memory email,
        string memory phone,
        string memory password,
        address walletAddress
    ) public returns (User memory) {
        registeredAddresses.push(walletAddress);
        uint256 newUserID = userIdCounter;
        users[newUserID] = User({
            name: name,
            email: email,
            phone: phone,
            password: password,
            walletAddress: walletAddress
        });
        userIdCounter++;
        return users[newUserID];
    }

    // Get user details
    function getUserDetails(address walletAddress)
        public
        view
        returns (User memory)
    {
        for (uint256 i = 0; i < registeredAddresses.length; i++) {
            if (registeredAddresses[i] == walletAddress) {
                return users[i + 1];
            }
        }
        revert("User not found");
    }

    // Get all registered users
    function getAllUsers() public view returns (User[] memory) {
        User[] memory allUsers = new User[](registeredAddresses.length);
        for (uint256 i = 0; i < registeredAddresses.length; i++) {
            allUsers[i] = users[i + 1];
        }
        return allUsers;
    }

    // Get user count
    function getUserCount() public view returns (uint256) {
        return registeredAddresses.length;
    }

    // Update user wallet address
    function updateUserWalletAddress(uint256 userID, address newWalletAddress)
        public
    {
        if (userID >= 1 && userID < userIdCounter) {
            users[userID].walletAddress = newWalletAddress;
            return;
        }
        revert("User not found");
    }

    function mintProperty(
        address to,
        string memory title,
        string memory location,
        uint256 price
    ) public onlyOwner returns (uint256) {
        require(to != address(0), "Invalid recipient address");
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(to, newTokenId);
        properties[newTokenId] = Property({
            title: title,
            location: location,
            price: price,
            owner: to,
            isListed: false
        });

        emit PropertyMinted(newTokenId, to, title, location, price);
        return newTokenId;
    }

    function listPropertyForSale(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Caller is not the owner");
        require(price > 0, "Price must be greater than zero");

        properties[tokenId].price = price;
        properties[tokenId].isListed = true;
        emit PropertyListed(tokenId, price, msg.sender);
    }

    function buyProperty(uint256 tokenId) public payable {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        require(
            properties[tokenId].isListed,
            "Property is not listed for sale"
        );
        require(
            msg.value == properties[tokenId].price,
            "Please send the exact asking price"
        );

        address seller = ownerOf(tokenId);
        properties[tokenId].isListed = false;
        properties[tokenId].owner = msg.sender;

        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(msg.value);

        emit PropertySold(tokenId, msg.sender, seller, msg.value);
    }

    function getPropertyDetails(uint256 tokenId)
        public
        view
        returns (
            string memory,
            string memory,
            uint256,
            address,
            bool
        )
    {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        Property memory prop = properties[tokenId];
        return (
            prop.title,
            prop.location,
            prop.price,
            prop.owner,
            prop.isListed
        );
    }

    function getTokenCounter() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
