import { InjectionToken } from '@angular/core';
import type { NetworkName, NetworkConfig } from '@nftjuice/sdk';

export interface NFTJuiceConfig {
  network: NetworkName | NetworkConfig;
}

export const NFT_JUICE_CONFIG = new InjectionToken<NFTJuiceConfig>(
  'NFT_JUICE_CONFIG',
  {
    providedIn: 'root',
    factory: () => ({ network: 'mainnet' })
  }
);

export function provideNFTJuice(config: NFTJuiceConfig) {
  return {
    provide: NFT_JUICE_CONFIG,
    useValue: config
  };
}