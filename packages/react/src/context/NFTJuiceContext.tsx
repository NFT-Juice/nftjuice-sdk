import React, {createContext, useContext, useEffect, useState} from 'react';
import {NFTJuiceSDK} from '@nftjuice/sdk';

import {useWallet} from '../hooks/useWallet.js';
import type {NFTJuiceContextType, NFTJuiceProviderProps} from '../types.js';

const NFTJuiceContext = createContext<NFTJuiceContextType | null>(null);

export function NFTJuiceProvider({children, network = 'mainnet'}: NFTJuiceProviderProps) {
    const [sdk, setSdk] = useState<NFTJuiceSDK>();
    const {wallet, connectWallet, disconnectWallet, switchToNetwork} = useWallet();

    useEffect(() => {
        if (wallet.isConnected && wallet.signer) {
            const sdkInstance = new NFTJuiceSDK({
                network,
                provider: wallet.provider,
                signer: wallet.signer,
            });
            setSdk(sdkInstance);
        } else {
            setSdk(undefined);
        }
    }, [network, wallet.isConnected, wallet.signer]);

    const contextValue: NFTJuiceContextType = {
        sdk,
        wallet,
        connectWallet,
        disconnectWallet,
        switchToNetwork,
    };

    return (
        <NFTJuiceContext.Provider value={contextValue}>
            {children}
        </NFTJuiceContext.Provider>
    );
}

export function useNFTJuice(): NFTJuiceContextType {
    const context = useContext(NFTJuiceContext);
    if (!context) {
        throw new Error('useNFTJuice must be used within an NFTJuiceProvider');
    }
    return context;
}