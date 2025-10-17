import { Component, Input, Output, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { UserNFT } from '@nftjuice/sdk';
import { NFTJuiceService } from '../../services/nft-juice.service';
import { WalletService } from '../../services/wallet.service';
import { NftListComponent } from '../nft-list/nft-list.component';
import type { ViewMode } from '../../types';

@Component({
    selector: 'nftjuice-deposit-nft',
    standalone: true,
    imports: [CommonModule, NftListComponent],
    templateUrl: './deposit-nft.component.html',
    styleUrls: ['../../styles/nft-juice.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class DepositNftComponent implements OnInit {
    @Input() collectionAddress!: string;
    @Input() tokenId?: string;
    @Input() view: ViewMode = 'grid';
    @Input() className = '';

    @Output() success = new EventEmitter<any>();
    @Output() error = new EventEmitter<Error>();

    userNFTs: UserNFT[] = [];
    selectedNFT: UserNFT | null = null;
    isLoadingNFTs = false;
    depositingTokenId: string | null = null;
    errorMessage = '';

    constructor(
        private nftJuiceService: NFTJuiceService,
        private walletService: WalletService
    ) {}

    ngOnInit(): void {
        this.loadUserNFTs();
    }

    async loadUserNFTs(): Promise<void> {
        const sdk = this.nftJuiceService.currentSdk;
        const wallet = this.walletService.currentWallet;

        if (!sdk || !wallet.address) return;

        this.isLoadingNFTs = true;
        this.errorMessage = '';

        try {
            this.userNFTs = await sdk.getUserNFTs(wallet.address, this.collectionAddress);

            if (this.tokenId) {
                const providedNFT = this.userNFTs.find(nft => nft.tokenId === this.tokenId);
                if (providedNFT) {
                    this.selectedNFT = providedNFT;
                }
            }
        } catch (err: any) {
            this.errorMessage = 'Failed to load your NFTs';
            console.error('Failed to load user NFTs:', err);
        } finally {
            this.isLoadingNFTs = false;
        }
    }

    async handleDepositNFT(nft: UserNFT): Promise<void> {
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

        if (nft.isInVault) {
            this.errorMessage = 'This NFT is already in the vault';
            return;
        }

        this.depositingTokenId = nft.tokenId;
        this.errorMessage = '';

        try {
            const result = await sdk.depositNFT(this.collectionAddress, nft.tokenId);
            this.success.emit(result);

            if (wallet.address) {
                this.userNFTs = await sdk.getUserNFTs(wallet.address, this.collectionAddress);
            }
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to deposit NFT';
            this.errorMessage = errorMsg;
            this.error.emit(err);
        } finally {
            this.depositingTokenId = null;
        }
    }

    get isConnected(): boolean {
        return this.walletService.currentWallet.isConnected;
    }

    isActionDisabled = (nft: UserNFT): boolean => {
        return nft.isInVault || this.depositingTokenId !== null;
    };

    isActionLoading = (nft: UserNFT): boolean => {
        return this.depositingTokenId === nft.tokenId;
    };
}
