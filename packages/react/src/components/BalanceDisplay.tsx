import styles from '../styles/NFTJuiceWidget.module.css';

import React, {useState, useEffect} from 'react';
import classNames from "classnames";

import {useNFTJuice} from '../context/NFTJuiceContext.js';
import type {BalanceDisplayProps} from '../types.js';
import type {UserBalances, CollectionBalance} from '@nftjuice/sdk';

export function BalanceDisplay({
                                   userAddress,
                                   collectionAddress,
                                   showAllCollections = true,
                                   className = '',
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
                    <CollectionBalanceCard key={collection.collectionAddress} collection={collection}/>
                ))}
            </div>
        </div>
    );
}

function CollectionBalanceCard({collection}: { collection: any }) {
    return (
        <div className={styles.collectionCard}>
            <table>
                <thead>
                <tr>
                    <th>Collection</th>
                    <th>Juice Tokens</th>
                    <th>Bottle NFT Count</th>
                    <th>Your Bottle NFTs</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{collection.collectionAddress.slice(0, 6)}...{collection.collectionAddress.slice(-4)}</td>
                    <td>{parseFloat(collection.juiceBalance).toFixed(2)} Juice</td>
                    <td>{collection.bottleNFTs.length} NFT(s)</td>
                    <td>
                        {collection.bottleNFTs.length > 0 ? (
                            <div className={styles.bottleNfts}>
                                {collection.bottleNFTs.map((nft: any) => (
                                    <div key={nft.tokenId}>
                                        #{nft.tokenId}
                                        {nft.tokenUri && (
                                            <>
                                                {' '}
                                                <a className={styles.link} href={nft.tokenUri} target="_blank"
                                                   rel="noopener noreferrer">
                                                    View Metadata
                                                </a>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : '-'}
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    );
}