import styles from '../styles/NFTJuiceWidget.module.css';

import React, {useState, useEffect} from 'react';
import classNames from "classnames";
import type {UserBalances, CollectionBalance, UserNFT} from '@nftjuice/sdk';

import {NFTList} from './NFTList.js';
import {useNFTJuice} from '../context/NFTJuiceContext.js';
import type {BalanceDisplayProps} from '../types.js';

export function BalanceDisplay({
                                   userAddress,
                                   collectionAddress,
                                   showAllCollections = true,
                                   className = '',
                                   view = 'grid',
                               }: BalanceDisplayProps) {
    const {sdk, wallet} = useNFTJuice();
    const [balances, setBalances] = useState<UserBalances | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const addressToQuery = userAddress || wallet.address;

    useEffect(() => {
        const loadBalances = async () => {
            if (!sdk || !addressToQuery) return;

            if (!collectionAddress) {
                setBalances({address: addressToQuery, collections: []});
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                const userBalances = await sdk.getUserBalances(addressToQuery, [collectionAddress]);
                setBalances(userBalances);
            } catch (err: any) {
                setError(err.message || 'Failed to load balances');
            } finally {
                setIsLoading(false);
            }
        };

        loadBalances();
    }, [sdk, addressToQuery, collectionAddress]);

    if (!addressToQuery) {
        return (
            <div className={classNames(styles.container, className)}>
                <div className={styles.errorMessage}>No wallet address available</div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={classNames(styles.container, className)}>
                <div className={styles.loadingMessage}>Loading balances...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={classNames(styles.container, className)}>
                <div className={styles.errorMessage}>{error}</div>
            </div>
        );
    }

    if (!balances) {
        return null;
    }

    const collectionsToShow = showAllCollections
        ? balances.collections
        : balances.collections.filter(
            (c: CollectionBalance) => c.collectionAddress.toLowerCase() === collectionAddress?.toLowerCase()
        );

    if (collectionsToShow.length === 0) {
        return (
            <div className={classNames(styles.container, className)}>
                <h3 className={styles.sectionTitle}>Your NFTJuice Balances</h3>
                <div className={styles.emptyMessage}>
                    No balances found for the specified collection(s).
                </div>
            </div>
        );
    }

    return (
        <div className={classNames(styles.container, className)}>
            <h3 className={styles.sectionTitle}>Your NFTJuice Balances</h3>
            <div className={styles.sectionDescription}>
                Address: {addressToQuery.slice(0, 6)}...{addressToQuery.slice(-4)}
            </div>

            <div className={classNames(styles.collections, styles.mt)}>
                {collectionsToShow.map((collection) => (
                    <CollectionBalanceCard key={collection.collectionAddress} collection={collection} view={view}/>
                ))}
            </div>
        </div>
    );
}

function CollectionBalanceCard({collection, view = 'grid'}: { collection: CollectionBalance, view: 'grid' | 'list' }) {
    const {sdk} = useNFTJuice();
    const [vaultNFTs, setVaultNFTs] = useState<UserNFT[]>([]);
    const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);

    useEffect(() => {
        const loadVaultNFTs = async () => {
            if (!sdk || collection.bottleNFTs.length === 0) return;

            setIsLoadingNFTs(true);

            try {
                // Convert bottleNFTs to UserNFT format with metadata
                const vaultNFTsWithMetadata: UserNFT[] = [];

                for (const bottleNFT of collection.bottleNFTs) {
                    const metadata = await sdk.fetchNFTMetadata(bottleNFT.tokenUri || '');
                    vaultNFTsWithMetadata.push({
                        tokenId: bottleNFT.tokenId,
                        ...(bottleNFT.tokenUri && {tokenUri: bottleNFT.tokenUri}),
                        ...(metadata && {metadata}),
                        isInVault: true
                    });
                }

                setVaultNFTs(vaultNFTsWithMetadata);
            } catch (err) {
                console.error('Failed to load vault NFT metadata:', err);
            } finally {
                setIsLoadingNFTs(false);
            }
        };

        loadVaultNFTs();
    }, [sdk, collection.bottleNFTs]);

    return (
        <div className={styles.collectionCard}>
            <div className={classNames(styles.info, styles.collectionCardInfo)}>
                <h5 className={styles.sectionTitle}>
                    Collection: {collection.collectionAddress.slice(0, 6)}...{collection.collectionAddress.slice(-4)}
                </h5>

                <p><strong>Juice Balance:</strong> {parseFloat(collection.juiceBalance).toFixed(2)} Juice</p>
                <p><strong>NFTs in Vault:</strong> {collection.bottleNFTs.length} NFT(s)</p>
            </div>

            {collection.bottleNFTs.length > 0 && (
                <div>
                    <h5 className={styles.sectionTitle}>Your NFTs in Vault</h5>
                    <NFTList
                        nfts={vaultNFTs}
                        view={view}
                        layout="horizontal"
                        showStatus={false}
                        statusFilter="all"
                        loading={isLoadingNFTs}
                        emptyMessage="No NFT metadata available"
                    />
                </div>
            )}
        </div>
    );
}