import styles from '../styles/NFTJuiceWidget.module.css';

import React, {useState, useCallback} from 'react';
import classNames from "classnames";

import {useNFTJuice} from '../context/NFTJuiceContext.js';
import type {DepositNFTProps} from '../types.js';

export function DepositNFT({
                               collectionAddress,
                               tokenId: providedTokenId,
                               onSuccess,
                               onError,
                               className = '',
                           }: DepositNFTProps) {
    const {sdk, wallet} = useNFTJuice();
    const [tokenId, setTokenId] = useState(providedTokenId || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleDeposit = useCallback(async () => {
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

        setIsLoading(true);
        setError('');

        try {
            const result = await sdk.depositNFT(collectionAddress, tokenId.trim());
            onSuccess?.(result);
            setTokenId('');
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to deposit NFT';
            setError(errorMessage);
            onError?.(err);
        } finally {
            setIsLoading(false);
        }
    }, [sdk, wallet.isConnected, tokenId, collectionAddress, onSuccess, onError]);

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
            <div className={styles.form}>
                <div className={styles.inputGroup}>
                    <label htmlFor="tokenId" className={styles.l}>Token ID:</label>
                    <input
                        id="tokenId"
                        type="text"
                        value={tokenId}
                        onChange={(e) => setTokenId(e.target.value)}
                        placeholder="Enter NFT Token ID"
                        disabled={isLoading || !!providedTokenId}
                    />
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <button
                    onClick={handleDeposit}
                    disabled={isLoading || !tokenId.trim()}
                    className={classNames(styles.button, isLoading && styles.loading)}
                >
                    {isLoading ? 'Depositing...' : 'Deposit NFT'}
                </button>

                <div className={styles.info}>
                    <p>
                        Depositing your NFT will:
                    </p>
                    <ul>
                        <li>Transfer your NFT to the vault</li>
                        <li>Mint you a Bottle NFT as a receipt</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}