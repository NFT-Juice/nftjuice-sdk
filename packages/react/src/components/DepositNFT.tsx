import styles from '../styles/NFTJuiceWidget.module.css';

import React, {useState, useCallback, useEffect} from 'react';
import classNames from "classnames";
import type {UserNFT} from '@nftjuice/sdk';

import {NFTList} from './NFTList.js';
import {useNFTJuice} from '../context/NFTJuiceContext.js';
import type {DepositNFTProps} from '../types.js';

export function DepositNFT({
                               collectionAddress,
                               tokenId: providedTokenId,
                               onSuccess,
                               onError,
                               className = '',
                               view = 'grid',
                           }: DepositNFTProps) {
    const {sdk, wallet} = useNFTJuice();
    const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);
    const [selectedNFT, setSelectedNFT] = useState<UserNFT | null>(null);
    const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
    const [depositingTokenId, setDepositingTokenId] = useState<string | null>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const loadUserNFTs = async () => {
            if (!sdk || !wallet.address) return;

            setIsLoadingNFTs(true);
            setError('');

            try {
                const nfts = await sdk.getUserNFTs(wallet.address, collectionAddress);
                setUserNFTs(nfts);

                if (providedTokenId) {
                    const providedNFT = nfts.find(nft => nft.tokenId === providedTokenId);
                    if (providedNFT) {
                        setSelectedNFT(providedNFT);
                    }
                }
            } catch (err: any) {
                setError('Failed to load your NFTs');
                console.error('Failed to load user NFTs:', err);
            } finally {
                setIsLoadingNFTs(false);
            }
        };

        loadUserNFTs();
    }, [sdk, wallet.address, collectionAddress, providedTokenId]);

    const handleDepositNFT = useCallback(async (nft: UserNFT) => {
        if (!sdk) {
            setError('SDK not initialized');
            return;
        }

        if (!wallet.isConnected) {
            setError('Please connect your wallet first');
            return;
        }

        if (nft.isInVault) {
            setError('This NFT is already in the vault');
            return;
        }

        setDepositingTokenId(nft.tokenId);
        setError('');

        try {
            const result = await sdk.depositNFT(collectionAddress, nft.tokenId);
            onSuccess?.(result);

            // Refresh NFT list
            if (wallet.address) {
                const updatedNFTs = await sdk.getUserNFTs(wallet.address, collectionAddress);
                setUserNFTs(updatedNFTs);
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to deposit NFT';
            setError(errorMessage);
            onError?.(err);
        } finally {
            setDepositingTokenId(null);
        }
    }, [sdk, wallet.isConnected, wallet.address, collectionAddress, onSuccess, onError]);

    if (!wallet.isConnected) {
        return (
            <div className={classNames(styles.deposit, className)}>
                <div className={styles.errorMessage}>Please connect your wallet to deposit NFTs</div>
            </div>
        );
    }

    return (
        <div className={classNames(styles.container, className)}>
            <h3 className={styles.sectionTitle}>Deposit NFT</h3>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.mt}>
                <NFTList
                    nfts={userNFTs}
                    view={view}
                    statusFilter="unlocked"
                    onSelect={setSelectedNFT}
                    {...(selectedNFT?.tokenId && {selectedTokenId: selectedNFT.tokenId})}
                    loading={isLoadingNFTs}
                    emptyMessage="No available NFTs to deposit"
                    actionButton={{
                        text: 'Deposit',
                        onClick: handleDepositNFT,
                        disabled: (nft) => nft.isInVault || depositingTokenId !== null,
                        loading: (nft) => depositingTokenId === nft.tokenId,
                        loadingText: 'Depositing...'
                    }}
                />
            </div>

            <div className={classNames(styles.info, styles.mt)}>
                <p>
                    Depositing your NFT will:
                </p>
                <ul>
                    <li>Transfer your NFT to the vault</li>
                    <li>Mint you a Bottle NFT as a receipt</li>
                    <li>Receive 100 Juice tokens (minus fees)</li>
                </ul>
            </div>
        </div>
    );
}