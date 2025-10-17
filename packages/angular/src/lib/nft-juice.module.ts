import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { NftJuiceWidgetComponent } from './components/nft-juice-widget/nft-juice-widget.component';
import { DepositNftComponent } from './components/deposit-nft/deposit-nft.component';
import { WithdrawNftComponent } from './components/withdraw-nft/withdraw-nft.component';
import { BalanceDisplayComponent } from './components/balance-display/balance-display.component';
import { NftListComponent } from './components/nft-list/nft-list.component';

// Services
import { NFTJuiceService } from './services/nft-juice.service';
import { WalletService } from './services/wallet.service';

const components = [
    NftJuiceWidgetComponent,
    DepositNftComponent,
    WithdrawNftComponent,
    BalanceDisplayComponent,
    NftListComponent
];

@NgModule({
    imports: [
        CommonModule,
        ...components
    ],
    exports: components,
    providers: [
        NFTJuiceService,
        WalletService
    ]
})
export class NFTJuiceModule {}
