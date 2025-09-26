import styles from '../styles/NFTJuiceWidget.module.css';

import React, {useState, useCallback, useEffect} from 'react';
import classNames from "classnames";

import {useNFTJuice} from '../context/NFTJuiceContext.js';
import type {WithdrawNFTProps} from '../types.js';

export function WithdrawNFT({
                                collectionAddress,
                                tokenId: providedTokenId,
                                onSuccess,
                                onError,
                                className = '',
                            }: WithdrawNFTProps) {
    const {sdk, wallet} = useNFTJuice();
    const [tokenId, setTokenId] = useState(providedTokenId || '');
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [juiceBalance, setJuiceBalance] = useState<string>('0');
    const [collectionInfo, setCollectionInfo] = useState<any>(null);

    useEffect(() => {
        const loadBalance = async () => {
            if (!sdk || !wallet.address) return;
            setIsReady(false);
            try {
                const info = await sdk.getCollectionInfo(collectionAddress);
                setCollectionInfo(info);

                if (info.isAllowed) {
                    const balances = await sdk.getUserBalances(wallet.address, [collectionAddress]);
                    const collection = balances.collections.find(
                        (c: any) => c.collectionAddress.toLowerCase() === collectionAddress.toLowerCase()
                    );
                    if (collection) {
                        setJuiceBalance(collection.juiceBalance);
                    }
                }
            } catch (err) {
                console.error('Failed to load collection info:', err);
            } finally {
                setIsReady(true);
            }
        };

        loadBalance();
    }, [sdk, wallet.address, collectionAddress]);

    const handleWithdraw = useCallback(async () => {
        if (!sdk) {
            setError('SDK not initialized');
            return;
        }

        if (!wallet.isConnected) {
            setError('Please connect your wallet first');
            return;
        }

        if (!tokenId.trim()) {
            setError('Please enter a token ID');
            return;
        }

        if (parseFloat(juiceBalance) < 100) {
            setError('Insufficient Juice tokens. You need 100 Juice tokens to withdraw an NFT.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await sdk.withdrawNFT(collectionAddress, tokenId.trim());
            onSuccess?.(result);
            setTokenId('');

            if (wallet.address) {
                const balances = await sdk.getUserBalances(wallet.address, [collectionAddress]);
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
            setIsLoading(false);
        }
    }, [sdk, wallet.isConnected, wallet.address, tokenId, collectionAddress, juiceBalance, onSuccess, onError]);

    if (!wallet.isConnected) {
        return (
            <div className={classNames(styles.container, className)}>
                <div className={styles.errorMessage}>Please connect your wallet to withdraw NFTs</div>
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
            <div className={styles.form}>
                <div className={styles.info}>
                    <div className="balance-item">
                        <p>
                            Your Juice
                            Balance: <strong>{isReady ? `${parseFloat(juiceBalance).toFixed(2)} Juice` : 'Loading...'}</strong>
                        </p>
                    </div>
                    <div className={classNames(styles.warning, styles.mt)}>
                        ⚠️ Required: 100 Juice tokens
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="withdrawTokenId">Token ID:</label>
                    <input
                        id="withdrawTokenId"
                        type="text"
                        value={tokenId}
                        onChange={(e) => setTokenId(e.target.value)}
                        placeholder="Enter NFT Token ID to withdraw"
                        disabled={isLoading || !!providedTokenId}
                    />
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <button
                    onClick={handleWithdraw}
                    disabled={isLoading || !tokenId.trim() || !hasEnoughJuice}
                    className={classNames(styles.button, isLoading && styles.loading)}
                >
                    {isLoading ? 'Withdrawing...' : 'Withdraw NFT'}
                </button>

                <div className={styles.info}>
                    <p>
                        Withdrawing your NFT will:
                    </p>
                    <ul>
                        <li>Burn 100 Juice tokens from your balance</li>
                        <li>Transfer your Bottle NFT to the vault</li>
                        <li>Return your original NFT to your wallet</li>
                    </ul>
                    {isReady && !hasEnoughJuice && (
                        <div className={classNames(styles.warning, styles.mt)}>
                            ⚠️ You need to acquire more Juice tokens to withdraw.
                            You can buy them on Uniswap or deposit more NFTs.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}