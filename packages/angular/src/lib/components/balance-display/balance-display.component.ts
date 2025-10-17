import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { UserBalances, CollectionBalance, UserNFT } from '@nftjuice/sdk';
import { NFTJuiceService } from '../../services/nft-juice.service';
import { WalletService } from '../../services/wallet.service';
import { NftListComponent } from '../nft-list/nft-list.component';
import type { ViewMode } from '../../types';

@Component({
    selector: 'nftjuice-balance-display',
    standalone: true,
    imports: [CommonModule, NftListComponent],
    templateUrl: './balance-display.component.html',
    styleUrls: ['../../styles/nft-juice.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class BalanceDisplayComponent implements OnInit {
    @Input() userAddress?: string;
    @Input() collectionAddress?: string;
    @Input() showAllCollections = true;
    @Input() view: ViewMode = 'grid';
    @Input() className = '';

    balances: UserBalances | null = null;
    isLoading = false;
    errorMessage = '';
    vaultNFTsMap: Map<string, UserNFT[]> = new Map();
    loadingNFTsMap: Map<string, boolean> = new Map();

    constructor(
        private nftJuiceService: NFTJuiceService,
        private walletService: WalletService
    ) {}

    ngOnInit(): void {
        this.loadBalances();
    }

    async loadBalances(): Promise<void> {
        const sdk = this.nftJuiceService.currentSdk;
        const addressToQuery = this.userAddress || this.walletService.currentWallet.address;

        if (!sdk || !addressToQuery) return;

        if (!this.collectionAddress) {
            this.balances = { address: addressToQuery, collections: [] };
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        try {
            this.balances = await sdk.getUserBalances(addressToQuery, [this.collectionAddress]);

            // Load metadata for all collections
            if (this.balances) {
                for (const collection of this.balances.collections) {
                    await this.loadVaultNFTsForCollection(collection);
                }
            }
        } catch (err: any) {
            this.errorMessage = err.message || 'Failed to load balances';
        } finally {
            this.isLoading = false;
        }
    }

    async loadVaultNFTsForCollection(collection: CollectionBalance): Promise<void> {
        const sdk = this.nftJuiceService.currentSdk;
        if (!sdk || collection.bottleNFTs.length === 0) return;

        this.loadingNFTsMap.set(collection.collectionAddress, true);

        try {
            const vaultNFTsWithMetadata: UserNFT[] = [];

            for (const bottleNFT of collection.bottleNFTs) {
                const metadata = await sdk.fetchNFTMetadata(bottleNFT.tokenUri || '');
                vaultNFTsWithMetadata.push({
                    tokenId: bottleNFT.tokenId,
                    ...(bottleNFT.tokenUri && { tokenUri: bottleNFT.tokenUri }),
                    ...(metadata && { metadata }),
                    isInVault: true
                });
            }

            this.vaultNFTsMap.set(collection.collectionAddress, vaultNFTsWithMetadata);
        } catch (err) {
            console.error('Failed to load vault NFT metadata:', err);
        } finally {
            this.loadingNFTsMap.set(collection.collectionAddress, false);
        }
    }

    get addressToQuery(): string | undefined {
        return this.userAddress || this.walletService.currentWallet.address;
    }

    get collectionsToShow(): CollectionBalance[] {
        if (!this.balances) return [];

        return this.showAllCollections
            ? this.balances.collections
            : this.balances.collections.filter(
                (c: CollectionBalance) => c.collectionAddress.toLowerCase() === this.collectionAddress?.toLowerCase()
            );
    }

    getVaultNFTs(collection: CollectionBalance): UserNFT[] {
        return this.vaultNFTsMap.get(collection.collectionAddress) || [];
    }

    isLoadingNFTs(collection: CollectionBalance): boolean {
        return this.loadingNFTsMap.get(collection.collectionAddress) || false;
    }

    formatAddress(address: string): string {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    formatBalance(balance: string): string {
        return parseFloat(balance).toFixed(2);
    }
}
