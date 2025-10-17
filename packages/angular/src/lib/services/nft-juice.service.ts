import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { NFTJuiceSDK, type NetworkName, type NetworkConfig } from '@nftjuice/sdk';
import { WalletService } from './wallet.service';
import { NFT_JUICE_CONFIG } from '../config/nft-juice.config';

@Injectable({
    providedIn: 'root'
})
export class NFTJuiceService {
    private config = inject(NFT_JUICE_CONFIG);
    private sdkSubject = new BehaviorSubject<NFTJuiceSDK | undefined>(undefined);
    private networkSubject = new BehaviorSubject<NetworkName | NetworkConfig>(this.config.network);

    public sdk$: Observable<NFTJuiceSDK | undefined> = this.sdkSubject.asObservable();
    public network$ = this.networkSubject.asObservable();

    constructor(private walletService: WalletService) {
        this.initialize();
    }

    get currentSdk(): NFTJuiceSDK | undefined {
        return this.sdkSubject.value;
    }

    setNetwork(network: NetworkName | NetworkConfig): void {
        this.networkSubject.next(network);
    }

    private initialize(): void {
        combineLatest([
            this.walletService.wallet$,
            this.network$
        ]).pipe(
            map(([wallet, network]) => {
                if (wallet.isConnected && wallet.signer) {
                    return new NFTJuiceSDK({
                        network,
                        provider: wallet.provider,
                        signer: wallet.signer
                    });
                }
                return undefined;
            })
        ).subscribe(sdk => {
            this.sdkSubject.next(sdk);
        });
    }
}
