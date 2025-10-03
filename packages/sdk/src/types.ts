import {ethers} from 'ethers';

export interface CollectionInfo {
    collectionAddress: string;
    bottleContract: string;
    juiceContract: string;
    operatorFee: number;
    ownerFee: number;
    operatorAddress: string;
    ownerAddress: string;
    isAllowed: boolean;
    uniswapPoolUrl?: string;
}

export interface UserBalances {
    address: string;
    collections: CollectionBalance[];
}

export interface CollectionBalance {
    collectionAddress: string;
    bottleNFTs: NFTBalance[];
    juiceBalance: string;
    juiceContract: string;
    bottleContract: string;
}

export interface NFTBalance {
    tokenId: string;
    tokenUri?: string;
    metadata?: NFTMetadata;
}

export interface NFTMetadata {
    name?: string;
    description?: string;
    image?: string;
    attributes?: NFTAttribute[];
}

export interface NFTAttribute {
    trait_type: string;
    value: string | number;
}

export interface UserNFT {
    tokenId: string;
    tokenUri?: string;
    metadata?: NFTMetadata;
    isInVault: boolean;
}

export interface DepositResult {
    transactionHash: string;
    bottleTokenId: string;
    juiceReceived: string;
    gasUsed: string;
}

export interface WithdrawResult {
    transactionHash: string;
    nftTokenId: string;
    juiceBurned: string;
    gasUsed: string;
}

export interface AllowNFTResult {
    transactionHash: string;
    bottleContract: string;
    juiceContract: string;
    gasUsed: string;
}

export interface DisallowNFTResult {
    transactionHash: string;
    gasUsed: string;
}

export interface UpdateFeeConfigResult {
    transactionHash: string;
    gasUsed: string;
}

export interface NetworkConfig {
    chainId: number;
    chainName: string;
    rpcUrl: string;
    blockExplorerUrl: string;
    vaultContract: string;
}

export interface TransactionOptions {
    gasLimit?: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
}

export interface SDKOptions {
    network: NetworkName | NetworkConfig;
    provider?: ethers.Provider;
    signer?: ethers.Signer;
}

export type NetworkName = 'mainnet' | 'hoodi';

export const NETWORK_CONFIGS: Record<NetworkName, NetworkConfig> = {
    'mainnet': {
        chainId: 1,
        chainName: 'Ethereum Mainnet',
        rpcUrl: 'https://eth.llamarpc.com',
        blockExplorerUrl: 'https://etherscan.io',
        vaultContract: '0x0000000000000000000000000000000000000000', // TODO: Deploy to mainnet
    },
    'hoodi': {
        chainId: 560048,
        chainName: 'Ethereum Hoodi',
        rpcUrl: 'https://rpc.hoodi.ethpandaops.io',
        blockExplorerUrl: 'https://light-hoodi.beaconcha.in',
        vaultContract: '0xd09aE1374b054342749d7C775181C91dAeD4CaA6',
    }
};

export interface MetaMaskNetworkConfig {
    chainId: string;
    chainName: string;
    rpcUrls: string[];
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    blockExplorerUrls: string[];
}

export function getMetaMaskNetworkConfig(network: NetworkName | NetworkConfig): MetaMaskNetworkConfig {
    const config = typeof network === 'string' ? NETWORK_CONFIGS[network] : network;

    return {
        chainId: `0x${config.chainId.toString(16)}`,
        chainName: config.chainName,
        rpcUrls: [config.rpcUrl],
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        blockExplorerUrls: [config.blockExplorerUrl],
    };
}