import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ethers } from 'ethers';
import { getMetaMaskNetworkConfig, type NetworkConfig, type NetworkName } from '@nftjuice/sdk';
import type { WalletState } from '../types';

declare global {
    interface Window {
        ethereum?: any;
    }
}

@Injectable({
    providedIn: 'root'
})
export class WalletService {
    private walletSubject = new BehaviorSubject<WalletState>({
        isConnected: false
    });

    public wallet$: Observable<WalletState> = this.walletSubject.asObservable();

    constructor() {
        this.setupEventListeners();
        this.checkConnection();
    }

    get currentWallet(): WalletState {
        return this.walletSubject.value;
    }

    async connectWallet(): Promise<void> {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
        }

        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();

            this.walletSubject.next({
                isConnected: true,
                address,
                chainId: Number(network.chainId),
                provider,
                signer
            });
        } catch (error: any) {
            console.error('Failed to connect wallet:', error);
            throw new Error(error.message || 'Failed to connect wallet');
        }
    }

    disconnectWallet(): void {
        this.walletSubject.next({
            isConnected: false
        });
    }

    async switchToNetwork(network: NetworkName | NetworkConfig = 'hoodi'): Promise<void> {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        const networkConfig = getMetaMaskNetworkConfig(network);

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: networkConfig.chainId }]
            });
        } catch (switchError: any) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            ...networkConfig,
                            chainId: networkConfig.chainId
                        }]
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
    }

    private setupEventListeners(): void {
        if (!window.ethereum) return;

        window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length === 0) {
                this.disconnectWallet();
            } else if (this.currentWallet.isConnected && accounts[0] !== this.currentWallet.address) {
                this.connectWallet();
            }
        });

        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        });
    }

    private async checkConnection(): Promise<void> {
        if (!window.ethereum) return;

        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await this.connectWallet();
            }
        } catch (error) {
            console.error('Failed to check wallet connection:', error);
        }
    }
}
