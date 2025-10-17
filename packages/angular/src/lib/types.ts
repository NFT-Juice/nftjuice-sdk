export type {
    UserNFT,
    NFTBalance,
    NFTMetadata,
    NFTJuiceSDK,
    NFTAttribute,
    UserBalances,
    NetworkConfig,
    NetworkName,
    DepositResult,
    WithdrawResult,
    AllowNFTResult,
    CollectionInfo,
    CollectionBalance,
    TransactionOptions,
} from '@nftjuice/sdk';

export interface WalletState {
    isConnected: boolean;
    address?: string;
    chainId?: number;
    provider?: any;
    signer?: any;
}

export type ViewMode = 'grid' | 'list';
export type LayoutMode = 'default' | 'horizontal';
export type StatusFilter = 'all' | 'locked' | 'unlocked';
