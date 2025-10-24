// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; // ADD THIS

contract RealEstateNFT is ERC721, Ownable, ReentrancyGuard { // ADD ReentrancyGuard
    uint256 public _tokenIdCounter;

    struct Property {
        string title;
        string location;
        uint256 price;
        address owner;
        bool isListed;
    }

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
        registeredAddresses.push(msg.sender);
        uint256 newUserID = userIdCounter;
        users[newUserID] = User({
            name: "Real eState Admin",
            email: "realstatenft@admin.com",
            phone: "03123456789",
            password: "Admin@123",
            walletAddress: msg.sender
        });
        userIdCounter++;
    }

    function registerUser(
        string memory name,
        string memory email,
        string memory phone,
        string memory password,
        address walletAddress
    ) public returns (User memory) {
        for (uint256 i = 0; i < registeredAddresses.length; i++) {
            if (registeredAddresses[i] == walletAddress) {
                revert("Wallet address already registered");
            }
        }
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

    function loginUser(address walletAddress) public view returns (bool) {
        for (uint256 i = 0; i < registeredAddresses.length; i++) {
            if (registeredAddresses[i] == walletAddress) {
                return true;
            }
        }
        return false;
    }

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

    function getAllUsers() public view returns (User[] memory) {
        User[] memory allUsers = new User[](registeredAddresses.length);
        for (uint256 i = 0; i < registeredAddresses.length; i++) {
            allUsers[i] = users[i + 1];
        }
        return allUsers;
    }

    function getUserCount() public view returns (uint256) {
        return registeredAddresses.length;
    }

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

    function buyProperty(uint256 tokenId) public payable nonReentrant {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        require(properties[tokenId].isListed, "Property is not listed for sale");
        require(msg.value == properties[tokenId].price, "Please send the exact asking price");
        
        address seller = ownerOf(tokenId);
        require(msg.sender != seller, "Cannot buy your own property"); // ADD THIS CHECK

        // Transfer ownership first
        _transfer(seller, msg.sender, tokenId);

        // Send payment to seller
        (bool sent, ) = payable(seller).call{value: msg.value}("");
        require(sent, "Failed to send Ether to seller");

        // Update state after successful transfer
        properties[tokenId].isListed = false;
        properties[tokenId].owner = msg.sender;

        // FIX: Correct parameter order (buyer, seller, not seller, buyer)
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