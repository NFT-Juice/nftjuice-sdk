export const NFTJuiceVaultABI = [
    "function allowNFT(address _nftCollection, address _collectionOwner, uint256 _collectionOwnerFees, address _operator, uint256 _operatorFees) external",
    "function disallowNFT(address _nftCollection) external",
    "function updateFeeConfig(address _nftCollection, address _collectionOwner, uint256 _collectionOwnerFees, address _operator, uint256 _operatorFees) external",
    "function allowedCollections(address collection) external view returns (bool)",
    "function pairs(address collection) external view returns (address bottle, address juice)",
    "function bottleToCollection(address bottle) external view returns (address)",
    "function feeConfigs(address collection) external view returns (address collectionOwner, uint256 collectionOwnerFees, address operator, uint256 operatorFees)",
    "function onERC721Received(address operator, address from, uint256 tokenId, bytes data) external returns (bytes4)",
    "function owner() external view returns (address)",
    "event PairCreated(address indexed collection, address bottle, address juice)",
    "event NFTDeposited(address indexed collection, uint256 indexed tokenId)",
    "event NFTWithdrawn(address indexed collection, uint256 indexed tokenId)",
    "event NFTAllowed(address indexed collection)",
    "event NFTDisallowed(address indexed collection)",
    "event FeeConfigUpdated(address indexed collection, address collectionOwner, uint256 collectionOwnerFees, address operator, uint256 operatorFees)"
];

export const BottleNFTABI = [
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function tokenURI(uint256 tokenId) external view returns (string)",
    "function balanceOf(address owner) external view returns (uint256)",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function approve(address to, uint256 tokenId) external",
    "function getApproved(uint256 tokenId) external view returns (address)",
    "function setApprovalForAll(address operator, bool approved) external",
    "function isApprovedForAll(address owner, address operator) external view returns (bool)",
    "function transferFrom(address from, address to, uint256 tokenId) external",
    "function safeTransferFrom(address from, address to, uint256 tokenId) external",
    "function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) external",
    "function safeMint(address to, uint256 tokenId) external",
    "function burn(uint256 tokenId) external",
    "function parentNFT() external view returns (address)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
    "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
];

export const JuiceTokenABI = [
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
    "function mint(address to, uint256 amount) external",
    "function burn(address from, uint256 amount) external",
    "function burn(uint256 amount) external",
    "function burnFrom(address account, uint256 amount) external",
    "function parentNFT() external view returns (address)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

export const ERC721ABI = [
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function tokenURI(uint256 tokenId) external view returns (string)",
    "function balanceOf(address owner) external view returns (uint256)",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function approve(address to, uint256 tokenId) external",
    "function getApproved(uint256 tokenId) external view returns (address)",
    "function setApprovalForAll(address operator, bool approved) external",
    "function isApprovedForAll(address owner, address operator) external view returns (bool)",
    "function transferFrom(address from, address to, uint256 tokenId) external",
    "function safeTransferFrom(address from, address to, uint256 tokenId) external",
    "function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) external",
    "function totalSupply() external view returns (uint256)",
    "function tokenByIndex(uint256 index) external view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
    "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
];