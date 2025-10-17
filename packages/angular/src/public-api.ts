/*
 * Public API Surface of @nftjuice/angular
 */

// Module
export { NFTJuiceModule } from './lib/nft-juice.module';

// Components
export { NftJuiceWidgetComponent } from './lib/components/nft-juice-widget/nft-juice-widget.component';
export { DepositNftComponent } from './lib/components/deposit-nft/deposit-nft.component';
export { WithdrawNftComponent } from './lib/components/withdraw-nft/withdraw-nft.component';
export { BalanceDisplayComponent } from './lib/components/balance-display/balance-display.component';
export { NftListComponent, type ActionButton } from './lib/components/nft-list/nft-list.component';

// Services
export { NFTJuiceService } from './lib/services/nft-juice.service';
export { WalletService } from './lib/services/wallet.service';

// Configuration
export { provideNFTJuice, NFT_JUICE_CONFIG, type NFTJuiceConfig } from './lib/config/nft-juice.config';

// Types
export * from './lib/types';

// Re-export SDK types
export type {
    UserNFT,
    NFTBalance,
    NFTMetadata,
    NFTJuiceSDK,
    NFTAttribute,
    UserBalances,
    NetworkConfig,
    NetworkName,
    DepositResult,
    WithdrawResult,
    AllowNFTResult,
    CollectionInfo,
    CollectionBalance,
    TransactionOptions,
} from '@nftjuice/sdk';
