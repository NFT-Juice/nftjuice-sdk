import {ethers} from 'ethers';
import {useState, useCallback, useEffect} from 'react';

import type {WalletState} from '../types.js';
import {getMetaMaskNetworkConfig, type NetworkConfig, type NetworkName} from '@nftjuice/sdk';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export function useWallet() {
    const [wallet, setWallet] = useState<WalletState>({
        isConnected: false,
    });

    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
        }

        try {
            await window.ethereum.request({method: 'eth_requestAccounts'});

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();

            setWallet({
                isConnected: true,
                address,
                chainId: Number(network.chainId),
                provider,
                signer,
            });
        } catch (error: any) {
            console.error('Failed to connect wallet:', error);
            throw new Error(error.message || 'Failed to connect wallet');
        }
    }, []);

    const disconnectWallet = useCallback(() => {
        setWallet({
            isConnected: false,
        });
    }, []);

    const switchToNetwork = useCallback(async (network: NetworkName | NetworkConfig = 'hoodi') => {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        const networkConfig = getMetaMaskNetworkConfig(network);

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{chainId: networkConfig.chainId}],
            });
        } catch (switchError: any) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            ...networkConfig,
                            chainId: networkConfig.chainId
                        }],
                    });
                } catch (addError) {
                    console.error(`Failed to add ${networkConfig.chainName} to MetaMask:`, addError);
                    throw new Error(`Failed to add ${networkConfig.chainName} to MetaMask`);
                }
            } else {
                console.error(`Failed to switch to ${networkConfig.chainName}:`, switchError);
                throw new Error(`Failed to switch to ${networkConfig.chainName}`);
            }
        }
    }, []);

    useEffect(() => {
        if (!window.ethereum) return;

        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else if (wallet.isConnected && accounts[0] !== wallet.address) {
                // Account changed, reconnect
                connectWallet();
            }
        };

        const handleChainChanged = () => {
            window.location.reload();
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            if (window.ethereum.removeListener) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, [wallet.isConnected, wallet.address, connectWallet, disconnectWallet]);

    useEffect(() => {
        const checkConnection = async () => {
            if (!window.ethereum) return;

            try {
                const accounts = await window.ethereum.request({method: 'eth_accounts'});
                if (accounts.length > 0) {
                    await connectWallet();
                }
            } catch (error) {
                console.error('Failed to check wallet connection:', error);
            }
        };

        checkConnection();
    }, [connectWallet]);

    return {
        wallet,
        connectWallet,
        disconnectWallet,
        switchToNetwork,
    };
}