# @nftjuice/angular

Angular components and services for NFTJuice SDK - A comprehensive solution for integrating NFT liquidity vault functionality into Angular applications.

## Installation

```bash
npm install @nftjuice/angular @nftjuice/sdk ethers
```

## Quick Start

### 1. Import the Module

```typescript
import { Component } from '@angular/core';
import { NFTJuiceModule } from '@nftjuice/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NFTJuiceModule],
  template: `
    <nftjuice-widget
      collectionAddress="0xYourCollectionAddress"
      view="grid">
    </nftjuice-widget>
  `
})
export class AppComponent {}
```

### 2. Using Standalone Components

```typescript
import { Component } from '@angular/core';
import { NftJuiceWidgetComponent } from '@nftjuice/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NftJuiceWidgetComponent],
  template: `
    <nftjuice-widget
      collectionAddress="0xYourCollectionAddress">
    </nftjuice-widget>
  `
})
export class AppComponent {}
```

## Components

### NFTJuiceWidget

The main widget component that provides a complete UI for depositing, withdrawing, and viewing NFT balances.

```typescript
<nftjuice-widget
  collectionAddress="0x..."
  [view]="'grid'"
  [className]="'custom-class'">
</nftjuice-widget>
```

**Inputs:**
- `collectionAddress` (string, required): The NFT collection contract address
- `view` ('grid' | 'list'): Display mode for NFT lists (default: 'grid')
- `className` (string): Additional CSS class names

### DepositNFT

Component for depositing NFTs into the vault.

```typescript
<nftjuice-deposit-nft
  collectionAddress="0x..."
  [tokenId]="'123'"
  [view]="'grid'"
  (success)="handleSuccess($event)"
  (error)="handleError($event)">
</nftjuice-deposit-nft>
```

**Inputs:**
- `collectionAddress` (string, required): The NFT collection contract address
- `tokenId` (string, optional): Pre-select a specific token ID
- `view` ('grid' | 'list'): Display mode
- `className` (string): Additional CSS class names

**Outputs:**
- `success`: Emitted when deposit succeeds
- `error`: Emitted when deposit fails

### WithdrawNFT

Component for withdrawing NFTs from the vault.

```typescript
<nftjuice-withdraw-nft
  collectionAddress="0x..."
  [view]="'grid'"
  (success)="handleSuccess($event)"
  (error)="handleError($event)">
</nftjuice-withdraw-nft>
```

**Inputs:**
- `collectionAddress` (string, required): The NFT collection contract address
- `tokenId` (string, optional): Pre-select a specific token ID
- `view` ('grid' | 'list'): Display mode
- `className` (string): Additional CSS class names

**Outputs:**
- `success`: Emitted when withdrawal succeeds
- `error`: Emitted when withdrawal fails

### BalanceDisplay

Component for displaying user balances and vault NFTs.

```typescript
<nftjuice-balance-display
  [userAddress]="'0x...'"
  [collectionAddress]="'0x...'"
  [showAllCollections]="true"
  [view]="'grid'">
</nftjuice-balance-display>
```

**Inputs:**
- `userAddress` (string, optional): Specific user address to query (uses connected wallet if not provided)
- `collectionAddress` (string, optional): Filter by collection address
- `showAllCollections` (boolean): Show all collections or filter by collectionAddress (default: true)
- `view` ('grid' | 'list'): Display mode
- `className` (string): Additional CSS class names

### NFTList

Reusable component for displaying lists of NFTs.

```typescript
<nftjuice-nft-list
  [nfts]="nftArray"
  [view]="'grid'"
  [layout]="'default'"
  [showStatus]="true"
  [statusFilter]="'all'"
  [loading]="false"
  [emptyMessage]="'No NFTs found'"
  [actionButton]="actionButtonConfig"
  (selectNft)="onNftSelected($event)">
</nftjuice-nft-list>
```

## Services

### NFTJuiceService

Manages SDK instances and network configuration.

```typescript
import { Component, OnInit } from '@angular/core';
import { NFTJuiceService } from '@nftjuice/angular';

@Component({...})
export class MyComponent implements OnInit {
  constructor(private nftJuiceService: NFTJuiceService) {}

  ngOnInit() {
    // Set network
    this.nftJuiceService.setNetwork('hoodi');

    // Get current SDK instance
    this.nftJuiceService.sdk$.subscribe(sdk => {
      if (sdk) {
        // Use SDK methods
      }
    });
  }
}
```

### WalletService

Handles wallet connection and network switching.

```typescript
import { Component } from '@angular/core';
import { WalletService } from '@nftjuice/angular';

@Component({...})
export class MyComponent {
  constructor(public walletService: WalletService) {}

  async connect() {
    await this.walletService.connectWallet();
  }

  async switchNetwork() {
    await this.walletService.switchToNetwork('hoodi');
  }

  ngOnInit() {
    // Subscribe to wallet state
    this.walletService.wallet$.subscribe(wallet => {
      console.log('Wallet connected:', wallet.isConnected);
      console.log('Address:', wallet.address);
    });
  }
}
```

## Styling

The package includes pre-built CSS styles. The styles are automatically included when you import the components.

### Custom Styling

You can override the default styles by targeting the CSS classes:

```css
.widget {
  /* Your custom styles */
}

.nftCard {
  /* Custom NFT card styles */
}
```

## Examples

### Basic Integration

```typescript
import { Component } from '@angular/core';
import { NftJuiceWidgetComponent } from '@nftjuice/angular';

@Component({
  selector: 'app-nft-page',
  standalone: true,
  imports: [NftJuiceWidgetComponent],
  template: `
    <div class="container">
      <h1>My NFT Collection</h1>
      <nftjuice-widget
        collectionAddress="0xd09aE1374b054342749d7C775181C91dAeD4CaA6">
      </nftjuice-widget>
    </div>
  `
})
export class NftPageComponent {}
```

### Advanced Usage with Services

```typescript
import { Component, OnInit } from '@angular/core';
import { NFTJuiceService, WalletService } from '@nftjuice/angular';

@Component({
  selector: 'app-custom-nft',
  template: `
    <button (click)="connect()" *ngIf="!isConnected">
      Connect Wallet
    </button>
    <div *ngIf="isConnected">
      <p>Connected: {{ address }}</p>
      <button (click)="depositNFT()">Deposit NFT</button>
    </div>
  `
})
export class CustomNftComponent implements OnInit {
  isConnected = false;
  address = '';

  constructor(
    private nftJuiceService: NFTJuiceService,
    private walletService: WalletService
  ) {}

  ngOnInit() {
    this.walletService.wallet$.subscribe(wallet => {
      this.isConnected = wallet.isConnected;
      this.address = wallet.address || '';
    });

    // Set network
    this.nftJuiceService.setNetwork('hoodi');
  }

  async connect() {
    await this.walletService.connectWallet();
  }

  async depositNFT() {
    const sdk = this.nftJuiceService.currentSdk;
    if (sdk) {
      const result = await sdk.depositNFT('0xCollection', '123');
      console.log('Deposit successful:', result);
    }
  }
}
```

## Requirements

- Angular 17+ (recommended: Angular 19)
- MetaMask or compatible Web3 wallet
- ethers.js v6
- @nftjuice/sdk v1.0.0+

## License

MIT

## Links

- [GitHub Repository](https://github.com/nftjuice/nftjuice-sdk)
- [NPM Package](https://www.npmjs.com/package/@nftjuice/angular)
- [Documentation](https://github.com/nftjuice/nftjuice-sdk)
