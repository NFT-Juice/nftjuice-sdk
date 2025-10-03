import styles from '../styles/NFTJuiceWidget.module.css';

import React, {useState, useCallback, useEffect} from 'react';
import classNames from "classnames";
import type {UserNFT} from '@nftjuice/sdk';

import {NFTList} from './NFTList.js';
import {useNFTJuice} from '../context/NFTJuiceContext.js';
import type {WithdrawNFTProps} from '../types.js';

export function WithdrawNFT({
                                collectionAddress,
                                tokenId: providedTokenId,
                                onSuccess,
                                onError,
                                className = '',
                                view = 'grid',
                            }: WithdrawNFTProps) {
    const {sdk, wallet} = useNFTJuice();
    const [vaultNFTs, setVaultNFTs] = useState<UserNFT[]>([]);
    const [selectedNFT, setSelectedNFT] = useState<UserNFT | null>(null);
    const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
    const [withdrawingTokenId, setWithdrawingTokenId] = useState<string | null>(null);
    const [error, setError] = useState<string>('');
    const [juiceBalance, setJuiceBalance] = useState<string>('0');
    const [collectionInfo, setCollectionInfo] = useState<any>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!sdk || !wallet.address) return;

            setIsLoadingNFTs(true);
            setError('');

            try {
                const info = await sdk.getCollectionInfo(collectionAddress);
                setCollectionInfo(info);

                if (info.isAllowed) {
                    // Load juice balance
                    const balances = await sdk.getUserBalances(wallet.address, [collectionAddress]);
                    const collection = balances.collections.find(
                        (c: any) => c.collectionAddress.toLowerCase() === collectionAddress.toLowerCase()
                    );
                    if (collection) {
                        setJuiceBalance(collection.juiceBalance);
                    }

                    // Load vault NFTs
                    const nfts = await sdk.getVaultNFTs(wallet.address, collectionAddress);
                    setVaultNFTs(nfts);

                    if (providedTokenId) {
                        const providedNFT = nfts.find(nft => nft.tokenId === providedTokenId);
                        if (providedNFT) {
                            setSelectedNFT(providedNFT);
                        }
                    }
                }
            } catch (err: any) {
                setError('Failed to load vault NFTs');
                console.error('Failed to load vault NFTs:', err);
            } finally {
                setIsLoadingNFTs(false);
            }
        };

        loadData();
    }, [sdk, wallet.address, collectionAddress, providedTokenId]);

    const handleWithdrawNFT = useCallback(async (nft: UserNFT) => {
        if (!sdk) {
            setError('SDK not initialized');
            return;
        }

        if (!wallet.isConnected) {
            setError('Please connect your wallet first');
            return;
        }

        if (parseFloat(juiceBalance) < 100) {
            setError('Insufficient Juice tokens. You need 100 Juice tokens to withdraw an NFT.');
            return;
        }

        setWithdrawingTokenId(nft.tokenId);
        setError('');

        try {
            const result = await sdk.withdrawNFT(collectionAddress, nft.tokenId);
            onSuccess?.(result);

            // Refresh data
            if (wallet.address) {
                const [updatedNFTs, balances] = await Promise.all([
                    sdk.getVaultNFTs(wallet.address, collectionAddress),
                    sdk.getUserBalances(wallet.address, [collectionAddress])
                ]);

                setVaultNFTs(updatedNFTs);

                const collection = balances.collections.find(
                    (c: any) => c.collectionAddress.toLowerCase() === collectionAddress.toLowerCase()
                );
                if (collection) {
                    setJuiceBalance(collection.juiceBalance);
                }
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to withdraw NFT';
            setError(errorMessage);
            onError?.(err);
        } finally {
            setWithdrawingTokenId(null);
        }
    }, [sdk, wallet.isConnected, wallet.address, collectionAddress, juiceBalance, onSuccess, onError]);

    if (!wallet.isConnected) {
        return (
            <div className={classNames(styles.container, className)}>
                <div className={styles.errorMessage}>Please connect your wallet to withdraw NFTs</div>
            </div>
        );
    }

    if (isLoadingNFTs || collectionInfo === null) {
        return (
            <div className={classNames(styles.container, className)}>
                <div className={styles.loadingMessage}>Loading collection info...</div>
            </div>
        );
    }

    if (!collectionInfo?.isAllowed) {
        return (
            <div className={classNames(styles.container, className)}>
                <div className={styles.errorMessage}>This collection is not whitelisted</div>
            </div>
        );
    }

    const hasEnoughJuice = parseFloat(juiceBalance) >= 100;

    return (
        <div className={classNames(styles.container, className)}>
            <h3 className={styles.sectionTitle}>Withdraw NFT</h3>

            <div className={styles.info}>
                <div className="balance-item">
                    <p>
                        Your Juice Balance: <strong>{`${parseFloat(juiceBalance).toFixed(2)} Juice`}</strong>
                    </p>
                </div>
                <div className={classNames(styles.warning, styles.mt)}>
                    ⚠️ Required: 100 Juice tokens
                </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.mt}>
                <NFTList
                    nfts={vaultNFTs}
                    view={view}
                    statusFilter="locked"
                    onSelect={setSelectedNFT}
                    {...(selectedNFT?.tokenId && {selectedTokenId: selectedNFT.tokenId})}
                    loading={isLoadingNFTs}
                    emptyMessage="No NFTs in vault to withdraw"
                    actionButton={{
                        text: 'Withdraw',
                        onClick: handleWithdrawNFT,
                        disabled: (nft) => !hasEnoughJuice || withdrawingTokenId !== null,
                        loading: (nft) => withdrawingTokenId === nft.tokenId,
                        loadingText: 'Withdrawing...'
                    }}
                />
            </div>

            <div className={classNames(styles.info, styles.mt)}>
                <p>
                    Withdrawing your NFT will:
                </p>
                <ul>
                    <li>Burn 100 Juice tokens from your balance</li>
                    <li>Transfer your Bottle NFT to the vault</li>
                    <li>Return your original NFT to your wallet</li>
                </ul>
                {!hasEnoughJuice && (
                    <div className={classNames(styles.warning, styles.mt)}>
                        ⚠️ You need to acquire more Juice tokens to withdraw.
                        You can buy them on Uniswap or deposit more NFTs.
                    </div>
                )}
            </div>
        </div>
    );
}