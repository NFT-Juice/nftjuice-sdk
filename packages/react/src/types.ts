import type {ReactNode} from 'react';
import type {NFTJuiceSDK, CollectionInfo, NetworkName, NetworkConfig} from '@nftjuice/sdk';

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
}

export interface DepositNFTProps {
    collectionAddress: string;
    tokenId?: string;
    onSuccess?: (result: any) => void;
    onError?: (error: Error) => void;
    className?: string;
}

export interface WithdrawNFTProps {
    collectionAddress: string;
    tokenId?: string;
    onSuccess?: (result: any) => void;
    onError?: (error: Error) => void;
    className?: string;
}

export interface BalanceDisplayProps {
    userAddress?: string;
    collectionAddress?: string;
    showAllCollections?: boolean;
    className?: string;
}

export interface ExchangeLinksProps {
    collectionInfo: CollectionInfo;
    className?: string;
}

export interface NFTItem {
    tokenId: string;
    image?: string;
    name?: string;
    description?: string;
}