import React, {useMemo} from 'react';
import classNames from 'classnames';
import styles from '../styles/NFTJuiceWidget.module.css';
import type {NFTListProps} from '../types.js';
import type {UserNFT} from '@nftjuice/sdk';

const NFT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTMyIiBoZWlnaHQ9IjUzMiIgdmlld0JveD0iMCAwIDUzMiA1MzIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQo8cGF0aCBkPSJNMjkyIDI2LjU1ODFMNDYwLjM2MyAxMjMuNzYyQzQ3Ni40NTIgMTMzLjA1MSA0ODYuMzYzIDE1MC4yMTggNDg2LjM2MyAxNjguNzk2VjM2My4yMDRDNDg2LjM2MyAzODEuNzgyIDQ3Ni40NTIgMzk4Ljk0OSA0NjAuMzYzIDQwOC4yMzhMMjkyIDUwNS40NDJDMjc1LjkxMSA1MTQuNzMxIDI1Ni4wODkgNTE0LjczMSAyNDAgNTA1LjQ0Mkw3MS42MzcyIDQwOC4yMzhDNTUuNTQ4NCAzOTguOTQ5IDQ1LjYzNzIgMzgxLjc4MiA0NS42MzcyIDM2My4yMDRWMTY4Ljc5NkM0NS42MzcyIDE1MC4yMTggNTUuNTQ4NCAxMzMuMDUxIDcxLjYzNzIgMTIzLjc2MkwyNDAgMjYuNTU4MUMyNTYuMDg5IDE3LjI2OTIgMjc1LjkxMSAxNy4yNjkyIDI5MiAyNi41NTgxWiIgc3Ryb2tlPSIjOTZBMEFCIiBzdHJva2Utd2lkdGg9IjIwIi8+DQo8cGF0aCBkPSJNMTAyLjU5MiAzNzJDOTYuMTk3MyAzNzIgOTMgMzY5LjgwMiA5MyAzNjUuNDA2VjE2Ny41OTRDOTMgMTYzLjE5OCA5Ni4xOTczIDE2MSAxMDIuNTkyIDE2MUgxMDguNjVDMTExLjE3NCAxNjEgMTEzLjE5NCAxNjEuNSAxMTQuNzA4IDE2Mi40OTlDMTE2LjIyMyAxNjMuMjk4IDExNy40ODUgMTY0Ljc5NiAxMTguNDk0IDE2Ni45OTRMMTc3LjA1NiAzMDAuOTY3QzE3OS40MTIgMzA2LjE2MiAxODEuNTk5IDMxMi40NTYgMTgzLjYxOSAzMTkuODQ5TDE4NC44ODEgMzE5LjI1QzE4My41MzQgMzEyLjI1NyAxODIuODYxIDMwNS42NjMgMTgyLjg2MSAyOTkuNDY5VjE2Ny41OTRDMTgyLjg2MSAxNjMuMTk4IDE4Ni4wNTkgMTYxIDE5Mi40NTMgMTYxSDE5NS40ODJDMjAxLjg3NyAxNjEgMjA1LjA3NCAxNjMuMTk4IDIwNS4wNzQgMTY3LjU5NFYzNjUuNDA2QzIwNS4wNzQgMzY5LjgwMiAyMDEuODc3IDM3MiAxOTUuNDgyIDM3MkgxOTAuMTgyQzE4NS40NyAzNzIgMTgyLjQ0MSAzNzAuNTAxIDE4MS4wOTQgMzY3LjUwNEwxMjEuMDE5IDIyOS4wMzZDMTE4LjY2MyAyMjMuODQgMTE2LjQ3NSAyMTcuNTQ2IDExNC40NTYgMjEwLjE1M0wxMTMuMTk0IDIxMC43NTNDMTE0LjU0IDIxNy43NDYgMTE1LjIxMyAyMjQuMzQgMTE1LjIxMyAyMzAuNTM0VjM2NS40MDZDMTE1LjIxMyAzNjkuODAyIDExMi4wMTYgMzcyIDEwNS42MjEgMzcySDEwMi41OTJaIiBmaWxsPSIjOTZBMEFCIi8+DQo8cGF0aCBkPSJNMjUyLjc0MiAzNzJDMjQ2LjM0OCAzNzIgMjQzLjE1IDM2OS44MDIgMjQzLjE1IDM2NS40MDZWMTcwLjU5MUMyNDMuMTUgMTY3LjM5NCAyNDMuNjU1IDE2NS4wOTYgMjQ0LjY2NSAxNjMuNjk3QzI0NS44NDMgMTYyLjI5OSAyNDcuNjEgMTYxLjU5OSAyNDkuOTY2IDE2MS41OTlIMzE1LjU5NUMzMTguNzkyIDE2MS41OTkgMzIwLjM5MSAxNjQuNTk3IDMyMC4zOTEgMTcwLjU5MVYxNzUuMzg2QzMyMC4zOTEgMTgxLjM4MSAzMTguNzkyIDE4NC4zNzggMzE1LjU5NSAxODQuMzc4SDI2NS44NjhWMjU4LjcwN0gzMTEuMzAzQzMxNC41MDEgMjU4LjcwNyAzMTYuMDk5IDI2MS43MDUgMzE2LjA5OSAyNjcuNjk5VjI3Mi40OTRDMzE2LjA5OSAyNzguNDg5IDMxNC41MDEgMjgxLjQ4NiAzMTEuMzAzIDI4MS40ODZIMjY1Ljg2OFYzNjUuNDA2QzI2NS44NjggMzY5LjgwMiAyNjIuNjcxIDM3MiAyNTYuMjc2IDM3MkgyNTIuNzQyWiIgZmlsbD0iIzk2QTBBQiIvPg0KPHBhdGggZD0iTTM4NS45ODIgMzcyQzM3OS41ODggMzcyIDM3Ni4zOSAzNjkuODAyIDM3Ni4zOSAzNjUuNDA2VjE4NC4zNzhIMzQwLjA0MkMzMzYuODQ1IDE4NC4zNzggMzM1LjI0NiAxODEuMzgxIDMzNS4yNDYgMTc1LjM4NlYxNzAuNTkxQzMzNS4yNDYgMTY0LjU5NyAzMzYuODQ1IDE2MS41OTkgMzQwLjA0MiAxNjEuNTk5SDQzNC45NTJDNDM2LjgwMyAxNjEuNTk5IDQzOC4wNjUgMTYyLjI5OSA0MzguNzM4IDE2My42OTdDNDM5LjU3OSAxNjUuMDk2IDQ0MCAxNjcuMzk0IDQ0MCAxNzAuNTkxVjE3NS4zODZDNDQwIDE3OC41ODMgNDM5LjU3OSAxODAuODgxIDQzOC43MzggMTgyLjI4QzQzOC4wNjUgMTgzLjY3OSA0MzYuODAzIDE4NC4zNzggNDM0Ljk1MiAxODQuMzc4SDM5OS4xMDhWMzY1LjQwNkMzOTkuMTA4IDM2OS44MDIgMzk1LjkxMSAzNzIgMzg5LjUxNiAzNzJIMzg1Ljk4MloiIGZpbGw9IiM5NkEwQUIiLz4NCjwvc3ZnPg0K';

export function NFTList({
                            nfts,
                            view = 'grid',
                            layout = 'default',
                            showStatus = false,
                            statusFilter = 'all',
                            onSelect,
                            selectedTokenId,
                            loading = false,
                            emptyMessage = 'No NFTs found',
                            actionButton,
                            className = ''
                        }: NFTListProps) {
    const filteredNFTs = useMemo(() => {
        if (statusFilter === 'all') return nfts;
        if (statusFilter === 'locked') return nfts.filter(nft => nft.isInVault);
        if (statusFilter === 'unlocked') return nfts.filter(nft => !nft.isInVault);
        return nfts;
    }, [nfts, statusFilter]);

    const getImageUrl = (nft: UserNFT): string => {
        if (nft.metadata?.image) {
            if (nft.metadata.image.startsWith('ipfs://')) {
                return `https://ipfs.io/ipfs/${nft.metadata.image.replace('ipfs://', '')}`;
            }
            return nft.metadata.image;
        }
        return NFT_PLACEHOLDER;
    };

    const renderNFTCard = (nft: UserNFT) => {
        const isSelected = selectedTokenId === nft.tokenId;
        const isActionDisabled = actionButton?.disabled?.(nft) || false;
        const isActionLoading = typeof actionButton?.loading === 'function'
            ? actionButton.loading(nft)
            : (actionButton?.loading || false);

        return (
            <div
                key={nft.tokenId}
                className={classNames(
                    styles.nftCard,
                    isSelected && styles.selected,
                    !!onSelect && styles.clickable,
                    nft.isInVault && styles.locked,
                    !nft.isInVault && styles.unlocked,
                    view === 'list' ? styles.listView : styles.gridView,
                    layout === 'horizontal' && styles.horizontalNftCard
                )}
                onClick={() => onSelect?.(nft)}
            >
                <div className={styles.imageContainer}>
                    <img
                        src={getImageUrl(nft)}
                        alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
                        className={styles.nftImage}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Prevent infinite recursion by checking if we're already showing the placeholder
                            if (!target.src.startsWith('data:image/svg+xml')) {
                                target.src = NFT_PLACEHOLDER;
                            }
                        }}
                    />
                    {showStatus && (
                        <div className={classNames(
                            styles.statusBadge,
                            nft.isInVault && styles.locked,
                            !nft.isInVault && styles.unlocked
                        )}>
                            {nft.isInVault ? 'Locked' : 'Unlocked'}
                        </div>
                    )}
                </div>

                <div className={styles.nftInfo}>
                    <h4 className={styles.nftName}>
                        {nft.metadata?.name || `#${nft.tokenId}`}
                    </h4>
                    <p className={styles.tokenId}>Token ID: {nft.tokenId}</p>
                    {nft.metadata?.description && (
                        <p className={styles.description}>
                            {nft.metadata.description.length > 100
                                ? `${nft.metadata.description.substring(0, 100)}...`
                                : nft.metadata.description
                            }
                        </p>
                    )}
                </div>

                {actionButton && (
                    <div className={styles.actionButtonContainer}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                actionButton.onClick(nft);
                            }}
                            disabled={isActionDisabled || isActionLoading}
                            className={classNames(
                                styles.actionButton,
                                isActionDisabled && styles.disabled,
                                isActionLoading && styles.loading
                            )}
                        >
                            {isActionLoading ? actionButton.loadingText || 'Loading...' : actionButton.text}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className={classNames(styles.nftListContainer, className)}>
                <div className={styles.nftListLoading}>
                    <div className={styles.nftListSpinner}></div>
                    <p>Loading NFTs...</p>
                </div>
            </div>
        );
    }

    if (filteredNFTs.length === 0) {
        return (
            <div className={classNames(styles.nftListContainer, className)}>
                <div className={styles.nftListEmpty}>
                    <p>{emptyMessage}</p>
                </div>
            </div>
        );
    }

    // For horizontal layout
    if (layout === 'horizontal') {
        return (
            <div className={classNames(styles.nftListContainer, className)}>
                <div className={styles.horizontalScrollContainer}>
                    <div className={styles.horizontalNftGrid}>
                        {filteredNFTs.map(renderNFTCard)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={classNames(styles.nftListContainer, className)}>
            <div className={classNames(
                styles.nftGrid,
                view === 'list' && styles.listLayout,
                view === 'grid' && styles.gridLayout
            )}>
                {filteredNFTs.map(renderNFTCard)}
            </div>
        </div>
    );
}