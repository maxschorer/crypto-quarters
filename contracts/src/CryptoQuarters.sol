// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CryptoQuarters
 * @notice 500,000 NFT collection inspired by the US 50 State Quarters program
 * @dev 50 states × 10,000 serials = 500,000 unique quarters
 */
contract CryptoQuarters is ERC721A, ERC2981, Ownable {
    using Strings for uint256;

    // =============================================================
    //                           CONSTANTS
    // =============================================================
    
    uint256 public constant MAX_SUPPLY = 500_000;
    uint256 public constant MAX_PER_WALLET = 50;

    // =============================================================
    //                            STORAGE
    // =============================================================
    
    /// @notice Current max mintable token ID (for phased reveal)
    uint256 public maxMintable;
    
    /// @notice Price to mint (in wei). Starts at 0.
    uint256 public mintPrice;
    
    /// @notice Number of free mints before price kicks in
    uint256 public freeMintCap;
    
    /// @notice Base URI for token metadata
    string private _baseTokenURI;
    
    /// @notice Whether minting is paused
    bool public mintPaused;

    // =============================================================
    //                            ERRORS
    // =============================================================
    
    error MintPaused();
    error ExceedsMaxMintable();
    error ExceedsMaxSupply();
    error ExceedsWalletLimit();
    error InsufficientPayment();
    error WithdrawFailed();
    error ZeroQuantity();

    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor(
        string memory name_,
        string memory symbol_,
        address royaltyReceiver,
        uint96 royaltyBps
    ) ERC721A(name_, symbol_) Ownable(msg.sender) {
        _setDefaultRoyalty(royaltyReceiver, royaltyBps);
    }

    // =============================================================
    //                        MINT FUNCTIONS
    // =============================================================
    
    /**
     * @notice Mint quarters
     * @param quantity Number of quarters to mint (max: 50 - current balance)
     */
    function mint(uint256 quantity) external payable {
        if (mintPaused) revert MintPaused();
        if (quantity == 0) revert ZeroQuantity();
        
        uint256 currentSupply = _totalMinted();
        
        if (currentSupply + quantity > maxMintable) revert ExceedsMaxMintable();
        if (currentSupply + quantity > MAX_SUPPLY) revert ExceedsMaxSupply();
        
        uint256 walletBalance = _numberMinted(msg.sender);
        if (walletBalance + quantity > MAX_PER_WALLET) revert ExceedsWalletLimit();
        
        // Calculate payment required
        uint256 cost = _calculateCost(currentSupply, quantity);
        if (msg.value < cost) revert InsufficientPayment();
        
        _mint(msg.sender, quantity);
        
        // Refund excess payment
        if (msg.value > cost) {
            (bool success, ) = msg.sender.call{value: msg.value - cost}("");
            require(success);
        }
    }
    
    /**
     * @notice Calculate mint cost accounting for free mint cap
     */
    function _calculateCost(uint256 currentSupply, uint256 quantity) internal view returns (uint256) {
        if (mintPrice == 0) return 0;
        
        // All free
        if (currentSupply + quantity <= freeMintCap) return 0;
        
        // All paid
        if (currentSupply >= freeMintCap) return quantity * mintPrice;
        
        // Partially free
        uint256 freeRemaining = freeMintCap - currentSupply;
        uint256 paidQuantity = quantity - freeRemaining;
        return paidQuantity * mintPrice;
    }
    
    /**
     * @notice Get cost for minting a quantity (view function for frontend)
     */
    function getMintCost(uint256 quantity) external view returns (uint256) {
        return _calculateCost(_totalMinted(), quantity);
    }
    
    /**
     * @notice Get number of tokens minted by an address
     */
    function numberMinted(address owner) external view returns (uint256) {
        return _numberMinted(owner);
    }
    
    /**
     * @notice Get remaining mintable quantity for a wallet
     */
    function remainingMintable(address wallet) external view returns (uint256) {
        uint256 minted = _numberMinted(wallet);
        if (minted >= MAX_PER_WALLET) return 0;
        
        uint256 walletRemaining = MAX_PER_WALLET - minted;
        uint256 supplyRemaining = maxMintable - _totalMinted();
        
        return walletRemaining < supplyRemaining ? walletRemaining : supplyRemaining;
    }

    // =============================================================
    //                       OWNER FUNCTIONS
    // =============================================================
    
    /**
     * @notice Set the max mintable supply (for phased reveal)
     */
    function setMaxMintable(uint256 _maxMintable) external onlyOwner {
        require(_maxMintable <= MAX_SUPPLY, "Exceeds max supply");
        maxMintable = _maxMintable;
    }
    
    /**
     * @notice Set the mint price (in wei)
     */
    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        mintPrice = _mintPrice;
    }
    
    /**
     * @notice Set the free mint cap
     */
    function setFreeMintCap(uint256 _freeMintCap) external onlyOwner {
        freeMintCap = _freeMintCap;
    }
    
    /**
     * @notice Set the base URI for metadata
     */
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @notice Pause/unpause minting
     */
    function setMintPaused(bool paused) external onlyOwner {
        mintPaused = paused;
    }
    
    /**
     * @notice Update royalty info
     */
    function setRoyalty(address receiver, uint96 bps) external onlyOwner {
        _setDefaultRoyalty(receiver, bps);
    }
    
    /**
     * @notice Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        if (!success) revert WithdrawFailed();
    }

    // =============================================================
    //                          METADATA
    // =============================================================
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
            : "";
    }

    // =============================================================
    //                       ERC165 SUPPORT
    // =============================================================
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721A, ERC2981)
        returns (bool)
    {
        return ERC721A.supportsInterface(interfaceId) 
            || ERC2981.supportsInterface(interfaceId);
    }
}
