import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NETWORK_CONFIGS, type CollectionInfo } from '@nftjuice/sdk';
import { NFTJuiceService } from '../../services/nft-juice.service';
import { WalletService } from '../../services/wallet.service';
import { DepositNftComponent } from '../deposit-nft/deposit-nft.component';
import { WithdrawNftComponent } from '../withdraw-nft/withdraw-nft.component';
import { BalanceDisplayComponent } from '../balance-display/balance-display.component';
import type { ViewMode } from '../../types';

type TabType = 'deposit' | 'withdraw' | 'balances';

@Component({
    selector: 'nftjuice-widget',
    standalone: true,
    imports: [CommonModule, DepositNftComponent, WithdrawNftComponent, BalanceDisplayComponent],
    templateUrl: './nft-juice-widget.component.html',
    styleUrls: ['../../styles/nft-juice.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class NftJuiceWidgetComponent implements OnInit, OnDestroy {
    @Input() collectionAddress!: string;
    @Input() view: ViewMode = 'grid';
    @Input() className = '';

    activeTab: TabType = 'deposit';
    collectionInfo: CollectionInfo | null = null;
    isLoading = false;
    errorMessage = '';

    private sdkSubscription?: Subscription;

    constructor(
        public nftJuiceService: NFTJuiceService,
        public walletService: WalletService
    ) {}

    ngOnInit(): void {
        // Subscribe to SDK changes and load collection info when SDK is available
        this.sdkSubscription = this.nftJuiceService.sdk$.subscribe(sdk => {
            if (sdk) {
                this.loadCollectionInfo();
            }
        });
    }

    ngOnDestroy(): void {
        this.sdkSubscription?.unsubscribe();
    }

    async loadCollectionInfo(): Promise<void> {
        const sdk = this.nftJuiceService.currentSdk;
        if (!sdk) return;

        this.isLoading = true;
        this.errorMessage = '';

        try {
            this.collectionInfo = await sdk.getCollectionInfo(this.collectionAddress);
            if (!this.collectionInfo.isAllowed) {
                this.errorMessage = 'This collection is not whitelisted in the NFTJuice system.';
            }
        } catch (err: any) {
            this.errorMessage = err.message || 'Failed to load collection information';
        } finally {
            this.isLoading = false;
        }
    }

    setActiveTab(tab: TabType): void {
        this.activeTab = tab;
    }

    async connectWallet(): Promise<void> {
        try {
            await this.walletService.connectWallet();
        } catch (err) {
            console.error('Failed to connect wallet:', err);
        }
    }

    async switchToNetwork(): Promise<void> {
        try {
            await this.walletService.switchToNetwork('hoodi');
        } catch (err) {
            console.error('Failed to switch network:', err);
        }
    }

    get wallet() {
        return this.walletService.currentWallet;
    }

    get sdk() {
        return this.nftJuiceService.currentSdk;
    }

    get isWrongNetwork(): boolean {
        return this.wallet.isConnected && !!this.sdk && this.wallet.chainId !== this.sdk.currentNetworkConfig.chainId;
    }

    get networkNameToSwitch(): string {
        if (this.sdk && this.wallet.isConnected && this.wallet.chainId) {
            const network = Object.values(NETWORK_CONFIGS).find(c =>
                c.chainId === this.sdk?.currentNetworkConfig.chainId
            );
            return network?.chainName || this.sdk.currentNetworkConfig.chainName || 'correct network';
        }
        return this.sdk?.currentNetworkConfig?.chainName || 'correct network';
    }

    get formattedCollectionAddress(): string {
        return `${this.collectionAddress.slice(0, 6)}...${this.collectionAddress.slice(-4)}`;
    }

    handleTransactionSuccess(result: any): void {
        console.log('Transaction successful:', result);
    }

    handleTransactionError(error: Error): void {
        console.error('Transaction failed:', error);
    }
}
