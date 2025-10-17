import { Component, Input, Output, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { UserNFT } from '@nftjuice/sdk';
import { NFTJuiceService } from '../../services/nft-juice.service';
import { WalletService } from '../../services/wallet.service';
import { NftListComponent } from '../nft-list/nft-list.component';
import type { ViewMode } from '../../types';

@Component({
    selector: 'nftjuice-withdraw-nft',
    standalone: true,
    imports: [CommonModule, NftListComponent],
    templateUrl: './withdraw-nft.component.html',
    styleUrls: ['../../styles/nft-juice.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class WithdrawNftComponent implements OnInit {
    @Input() collectionAddress!: string;
    @Input() tokenId?: string;
    @Input() view: ViewMode = 'grid';
    @Input() className = '';

    @Output() success = new EventEmitter<any>();
    @Output() error = new EventEmitter<Error>();

    vaultNFTs: UserNFT[] = [];
    selectedNFT: UserNFT | null = null;
    isLoadingNFTs = false;
    withdrawingTokenId: string | null = null;
    errorMessage = '';
    juiceBalance = '0';
    collectionInfo: any = null;

    constructor(
        private nftJuiceService: NFTJuiceService,
        private walletService: WalletService
    ) {}

    ngOnInit(): void {
        this.loadData();
    }

    async loadData(): Promise<void> {
        const sdk = this.nftJuiceService.currentSdk;
        const wallet = this.walletService.currentWallet;

        if (!sdk || !wallet.address) return;

        this.isLoadingNFTs = true;
        this.errorMessage = '';

        try {
            this.collectionInfo = await sdk.getCollectionInfo(this.collectionAddress);

            if (this.collectionInfo.isAllowed) {
                const balances = await sdk.getUserBalances(wallet.address, [this.collectionAddress]);
                const collection = balances.collections.find(
                    (c: any) => c.collectionAddress.toLowerCase() === this.collectionAddress.toLowerCase()
                );
                if (collection) {
                    this.juiceBalance = collection.juiceBalance;
                }

                this.vaultNFTs = await sdk.getVaultNFTs(wallet.address, this.collectionAddress);

                if (this.tokenId) {
                    const providedNFT = this.vaultNFTs.find(nft => nft.tokenId === this.tokenId);
                    if (providedNFT) {
                        this.selectedNFT = providedNFT;
                    }
                }
            }
        } catch (err: any) {
            this.errorMessage = 'Failed to load vault NFTs';
            console.error('Failed to load vault NFTs:', err);
        } finally {
            this.isLoadingNFTs = false;
        }
    }

    async handleWithdrawNFT(nft: UserNFT): Promise<void> {
        const sdk = this.nftJuiceService.currentSdk;
        const wallet = this.walletService.currentWallet;

        if (!sdk) {
            this.errorMessage = 'SDK not initialized';
            return;
        }

        if (!wallet.isConnected) {
            this.errorMessage = 'Please connect your wallet first';
            return;
        }

        if (parseFloat(this.juiceBalance) < 100) {
            this.errorMessage = 'Insufficient Juice tokens. You need 100 Juice tokens to withdraw an NFT.';
            return;
        }

        this.withdrawingTokenId = nft.tokenId;
        this.errorMessage = '';

        try {
            const result = await sdk.withdrawNFT(this.collectionAddress, nft.tokenId);
            this.success.emit(result);

            if (wallet.address) {
                const [updatedNFTs, balances] = await Promise.all([
                    sdk.getVaultNFTs(wallet.address, this.collectionAddress),
                    sdk.getUserBalances(wallet.address, [this.collectionAddress])
                ]);

                this.vaultNFTs = updatedNFTs;

                const collection = balances.collections.find(
                    (c: any) => c.collectionAddress.toLowerCase() === this.collectionAddress.toLowerCase()
                );
                if (collection) {
                    this.juiceBalance = collection.juiceBalance;
                }
            }
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to withdraw NFT';
            this.errorMessage = errorMsg;
            this.error.emit(err);
        } finally {
            this.withdrawingTokenId = null;
        }
    }

    get isConnected(): boolean {
        return this.walletService.currentWallet.isConnected;
    }

    get hasEnoughJuice(): boolean {
        return parseFloat(this.juiceBalance) >= 100;
    }

    get formattedJuiceBalance(): string {
        return `${parseFloat(this.juiceBalance).toFixed(2)} Juice`;
    }

    isActionDisabled = (nft: UserNFT): boolean => {
        return !this.hasEnoughJuice || this.withdrawingTokenId !== null;
    };

    isActionLoading = (nft: UserNFT): boolean => {
        return this.withdrawingTokenId === nft.tokenId;
    };
}
