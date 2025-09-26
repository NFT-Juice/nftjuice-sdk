import styles from '../styles/NFTJuiceWidget.module.css';

import React, {useState, useEffect, useMemo} from 'react';
import classNames from 'classnames';
import {NETWORK_CONFIGS} from '@nftjuice/sdk'
import type {CollectionInfo} from '@nftjuice/sdk';

import {DepositNFT} from './DepositNFT.js';
import {useNFTJuice} from '../context/NFTJuiceContext.js';
import {WithdrawNFT} from './WithdrawNFT.js';
import {BalanceDisplay} from './BalanceDisplay.js';
import type {NFTJuiceWidgetProps} from '../types.js';


export function NFTJuiceWidget({
                                   collectionAddress,
                                   className = '',
                               }: NFTJuiceWidgetProps) {
    const {sdk, wallet, connectWallet, switchToNetwork} = useNFTJuice();
    const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'balances' | 'exchange'>('deposit');
    const [collectionInfo, setCollectionInfo] = useState<CollectionInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const loadCollectionInfo = async () => {
            if (!sdk) return;

            setIsLoading(true);
            setError('');

            try {
                const info = await sdk.getCollectionInfo(collectionAddress);
                setCollectionInfo(info);

                if (!info.isAllowed) {
                    setError('This collection is not whitelisted in the NFTJuice system.');
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load collection information');
            } finally {
                setIsLoading(false);
            }
        };

        loadCollectionInfo();
    }, [sdk, collectionAddress]);

    const handleTransactionSuccess = (result: any) => {
        console.log('Transaction successful:', result);
        // Could add toast notifications here
    };

    const handleTransactionError = (error: Error) => {
        console.error('Transaction failed:', error);
        // Could add toast notifications here
    };

    const isWrongNetwork = wallet.isConnected && sdk && wallet.chainId !== sdk.currentNetworkConfig.chainId;

    const networkNameToSwitch = useMemo(() => {
        if (sdk && wallet.isConnected && wallet.chainId) {
            const network = Object.values(NETWORK_CONFIGS).find(c => {
                return c.chainId === sdk.currentNetworkConfig.chainId
            })
            return network?.chainName || sdk.currentNetworkConfig.chainName || 'correct network';
        }
        return sdk?.currentNetworkConfig?.chainName || 'correct network'
    }, [sdk, wallet.chainId, NETWORK_CONFIGS])

    return (
        <div className={classNames(styles.widget, className)}>
            <div className={styles.header}>
                <h2 className={styles.headerTitle}>NFTJuice</h2>
                <div className={styles.collectionInfo}>
                    Collection: {collectionAddress.slice(0, 6)}...{collectionAddress.slice(-4)}
                </div>
            </div>

            {!wallet.isConnected ? (
                <div className={styles.connectSection}>
                    <div className={styles.message}>
                        <h3 className={styles.sectionTitle}>Connect Your Wallet</h3>
                        <p className={styles.sectionDescription}>Connect your wallet to start using NFTJuice with this
                            collection.</p>
                    </div>
                    <button
                        onClick={connectWallet}
                        className={styles.button}
                    >
                        Connect Wallet
                    </button>
                </div>
            ) : isWrongNetwork ? (
                <div className={styles.networkSection}>
                    <div className={styles.message}>
                        <h3 className={styles.sectionTitle}>Wrong Network</h3>
                        <p className={styles.sectionDescription}>Please switch
                            to <strong>{networkNameToSwitch}</strong> to use this widget.</p>
                    </div>
                    <button
                        onClick={() => switchToNetwork('hoodi')}
                        className={styles.button}
                    >
                        Switch to {networkNameToSwitch}
                    </button>
                </div>
            ) : isLoading ? (
                <div className={styles.loadingSection}>
                    <div className={styles.loadingMessage}>Loading collection information...</div>
                </div>
            ) : error ? (
                <div className={styles.errorSection}>
                    <div className={styles.errorMessage}>{error}</div>
                </div>
            ) : collectionInfo && collectionInfo.isAllowed ? (
                <>
                    <div className={styles.tabs}>
                        <button
                            className={classNames(styles.tab, activeTab === 'deposit' && styles.active)}
                            onClick={() => setActiveTab('deposit')}
                        >
                            Deposit
                        </button>
                        <button
                            className={classNames(styles.tab, activeTab === 'withdraw' && styles.active)}
                            onClick={() => setActiveTab('withdraw')}
                        >
                            Withdraw
                        </button>
                        <button
                            className={classNames(styles.tab, activeTab === 'balances' && styles.active)}
                            onClick={() => setActiveTab('balances')}
                        >
                            Balances
                        </button>
                    </div>

                    <div className={styles.content}>
                        {activeTab === 'deposit' && (
                            <DepositNFT
                                collectionAddress={collectionAddress}
                                onSuccess={handleTransactionSuccess}
                                onError={handleTransactionError}
                            />
                        )}

                        {activeTab === 'withdraw' && (
                            <WithdrawNFT
                                collectionAddress={collectionAddress}
                                onSuccess={handleTransactionSuccess}
                                onError={handleTransactionError}
                            />
                        )}

                        {activeTab === 'balances' && (
                            <BalanceDisplay
                                collectionAddress={collectionAddress}
                                showAllCollections={false}
                            />
                        )}
                    </div>
                </>
            ) : (
                <div className={styles.errorSection}>
                    <div className={styles.errorMessage}>
                        This collection is not available in the NFTJuice system.
                    </div>
                </div>
            )}
        </div>
    );
}