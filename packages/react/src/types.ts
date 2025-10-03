import type {ReactNode} from 'react';
import type {UserNFT, NFTJuiceSDK, CollectionInfo, NetworkName, NetworkConfig} from '@nftjuice/sdk';

export interface WalletState {
    isConnected: boolean;
    address?: string;
    chainId?: number;
    provider?: any;
    signer?: any;
}

export interface NFTJuiceContextType {
    sdk: NFTJuiceSDK | undefined;
    wallet: WalletState;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    switchToNetwork: (network?: NetworkName) => Promise<void>;
}

export interface NFTJuiceProviderProps {
    children: ReactNode;
    network?: NetworkName | NetworkConfig;
}

export interface NFTJuiceWidgetProps {
    collectionAddress: string;
    className?: string;
    view?: 'grid' | 'list';
}

export interface DepositNFTProps {
    collectionAddress: string;
    tokenId?: string;
    onSuccess?: (result: any) => void;
    onError?: (error: Error) => void;
    className?: string;
    view?: 'grid' | 'list';
}

export interface WithdrawNFTProps {
    collectionAddress: string;
    tokenId?: string;
    onSuccess?: (result: any) => void;
    onError?: (error: Error) => void;
    className?: string;
    view?: 'grid' | 'list';
}

export interface BalanceDisplayProps {
    userAddress?: string;
    collectionAddress?: string;
    showAllCollections?: boolean;
    className?: string;
    view?: 'grid' | 'list';
}

export interface NFTListProps {
    nfts: UserNFT[];
    view?: 'grid' | 'list';
    layout?: 'default' | 'horizontal';
    showStatus?: boolean;
    statusFilter?: 'all' | 'locked' | 'unlocked';
    onSelect?: (nft: UserNFT) => void;
    selectedTokenId?: string;
    loading?: boolean;
    emptyMessage?: string;
    actionButton?: {
        text: string;
        onClick: (nft: UserNFT) => void;
        disabled?: (nft: UserNFT) => boolean;
        loading?: boolean | ((nft: UserNFT) => boolean);
        loadingText?: string;
    };
    className?: string;
}