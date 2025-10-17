import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { UserNFT } from '@nftjuice/sdk';
import type { ViewMode, LayoutMode, StatusFilter } from '../../types';

const NFT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTMyIiBoZWlnaHQ9IjUzMiIgdmlld0JveD0iMCAwIDUzMiA1MzIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQo8cGF0aCBkPSJNMjkyIDI2LjU1ODFMNDYwLjM2MyAxMjMuNzYyQzQ3Ni40NTIgMTMzLjA1MSA0ODYuMzYzIDE1MC4yMTggNDg2LjM2MyAxNjguNzk2VjM2My4yMDRDNDg2LjM2MyAzODEuNzgyIDQ3Ni40NTIgMzk4Ljk0OSA0NjAuMzYzIDQwOC4yMzhMMjkyIDUwNS40NDJDMjc1LjkxMSA1MTQuNzMxIDI1Ni4wODkgNTE0LjczMSAyNDAgNTA1LjQ0Mkw3MS42MzcyIDQwOC4yMzhDNTUuNTQ4NCAzOTguOTQ5IDQ1LjYzNzIgMzgxLjc4MiA0NS42MzcyIDM2My4yMDRWMTY4Ljc5NkM0NS42MzcyIDE1MC4yMTggNTUuNTQ4NCAxMzMuMDUxIDcxLjYzNzIgMTIzLjc2MkwyNDAgMjYuNTU4MUMyNTYuMDg5IDE3LjI2OTIgMjc1LjkxMSAxNy4yNjkyIDI5MiAyNi41NTgxWiIgc3Ryb2tlPSIjOTZBMEFCIiBzdHJva2Utd2lkdGg9IjIwIi8+DQo8cGF0aCBkPSJNMTAyLjU5MiAzNzJDOTYuMTk3MyAzNzIgOTMgMzY5LjgwMiA5MyAzNjUuNDA2VjE2Ny41OTRDOTMgMTYzLjE5OCA5Ni4xOTczIDE2MSAxMDIuNTkyIDE2MUgxMDguNjVDMTExLjE3NCAxNjEgMTEzLjE5NCAxNjEuNSAxMTQuNzA4IDE2Mi40OTlDMTE2LjIyMyAxNjMuMjk4IDExNy40ODUgMTY0Ljc5NiAxMTguNDk0IDE2Ni45OTRMMTc3LjA1NiAzMDAuOTY3QzE3OS40MTIgMzA2LjE2MiAxODEuNTk5IDMxMi40NTYgMTgzLjYxOSAzMTkuODQ5TDE4NC44ODEgMzE5LjI1QzE4My41MzQgMzEyLjI1NyAxODIuODYxIDMwNS42NjMgMTgyLjg2MSAyOTkuNDY5VjE2Ny41OTRDMTgyLjg2MSAxNjMuMTk4IDE4Ni4wNTkgMTYxIDE5Mi40NTMgMTYxSDE5NS40ODJDMjAxLjg3NyAxNjEgMjA1LjA3NCAxNjMuMTk4IDIwNS4wNzQgMTY3LjU5NFYzNjUuNDA2QzIwNS4wNzQgMzY5LjgwMiAyMDEuODc3IDM3MiAxOTUuNDgyIDM3MkgxOTAuMTgyQzE4NS40NyAzNzIgMTgyLjQ0MSAzNzAuNTAxIDE4MS4wOTQgMzY3LjUwNEwxMjEuMDE5IDIyOS4wMzZDMTE4LjY2MyAyMjMuODQgMTE2LjQ3NSAyMTcuNTQ2IDExNC40NTYgMjEwLjE1M0wxMTMuMTk0IDIxMC43NTNDMTE0LjU0IDIxNy43NDYgMTE1LjIxMyAyMjQuMzQgMTE1LjIxMyAyMzAuNTM0VjM2NS40MDZDMTE1LjIxMyAzNjkuODAyIDExMi4wMTYgMzcyIDEwNS42MjEgMzcySDEwMi41OTJaIiBmaWxsPSIjOTZBMEFCIi8+DQo8cGF0aCBkPSJNMjUyLjc0MiAzNzJDMjQ2LjM0OCAzNzIgMjQzLjE1IDM2OS44MDIgMjQzLjE1IDM2NS40MDZWMTcwLjU5MUMyNDMuMTUgMTY3LjM5NCAyNDMuNjU1IDE2NS4wOTYgMjQ0LjY2NSAxNjMuNjk3QzI0NS44NDMgMTYyLjI5OSAyNDcuNjEgMTYxLjU5OSAyNDkuOTY2IDE2MS41OTlIMzE1LjU5NUMzMTguNzkyIDE2MS41OTkgMzIwLjM5MSAxNjQuNTk3IDMyMC4zOTEgMTcwLjU5MVYxNzUuMzg2QzMyMC4zOTEgMTgxLjM4MSAzMTguNzkyIDE4NC4zNzggMzE1LjU5NSAxODQuMzc4SDI2NS44NjhWMjU4LjcwN0gzMTEuMzAzQzMxNC41MDEgMjU4LjcwNyAzMTYuMDk5IDI2MS43MDUgMzE2LjA5OSAyNjcuNjk5VjI3Mi40OTRDMzE2LjA5OSAyNzguNDg5IDMxNC41MDEgMjgxLjQ4NiAzMTEuMzAzIDI4MS40ODZIMjY1Ljg2OFYzNjUuNDA2QzI2NS44NjggMzY5LjgwMiAyNjIuNjcxIDM3MiAyNTYuMjc2IDM3MkgyNTIuNzQyWiIgZmlsbD0iIzk2QTBBQiIvPg0KPHBhdGggZD0iTTM4NS45ODIgMzcyQzM3OS41ODggMzcyIDM3Ni4zOSAzNjkuODAyIDM3Ni4zOSAzNjUuNDA2VjE4NC4zNzhIMzQwLjA0MkMzMzYuODQ1IDE4NC4zNzggMzM1LjI0NiAxODEuMzgxIDMzNS4yNDYgMTc1LjM4NlYxNzAuNTkxQzMzNS4yNDYgMTY0LjU5NyAzMzYuODQ1IDE2MS41OTkgMzQwLjA0MiAxNjEuNTk5SDQzNC45NTJDNDM2LjgwMyAxNjEuNTk5IDQzOC4wNjUgMTYyLjI5OSA0MzguNzM4IDE2My42OTdDNDM5LjU3OSAxNjUuMDk2IDQ0MCAxNjcuMzk0IDQ0MCAxNzAuNTkxVjE3NS4zODZDNDQwIDE3OC41ODMgNDM5LjU3OSAxODAuODgxIDQzOC43MzggMTgyLjI4QzQzOC4wNjUgMTgzLjY3OSA0MzYuODAzIDE4NC4zNzggNDM0Ljk1MiAxODQuMzc4SDM5OS4xMDhWMzY1LjQwNkMzOTkuMTA4IDM2OS44MDIgMzk1LjkxMSAzNzIgMzg5LjUxNiAzNzJIMzg1Ljk4MloiIGZpbGw9IiM5NkEwQUIiLz4NCjwvc3ZnPg0K';

export interface ActionButton {
    text: string;
    onClick: (nft: UserNFT) => void;
    disabled?: (nft: UserNFT) => boolean;
    loading?: boolean | ((nft: UserNFT) => boolean);
    loadingText?: string;
}

@Component({
    selector: 'nftjuice-nft-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './nft-list.component.html',
    styleUrls: ['../../styles/nft-juice.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class NftListComponent {
    @Input() nfts: UserNFT[] = [];
    @Input() view: ViewMode = 'grid';
    @Input() layout: LayoutMode = 'default';
    @Input() showStatus = false;
    @Input() statusFilter: StatusFilter = 'all';
    @Input() selectedTokenId?: string;
    @Input() loading = false;
    @Input() emptyMessage = 'No NFTs found';
    @Input() actionButton?: ActionButton;
    @Input() className = '';

    @Output() selectNft = new EventEmitter<UserNFT>();

    readonly nftPlaceholder = NFT_PLACEHOLDER;

    get filteredNFTs(): UserNFT[] {
        if (this.statusFilter === 'all') return this.nfts;
        if (this.statusFilter === 'locked') return this.nfts.filter(nft => nft.isInVault);
        if (this.statusFilter === 'unlocked') return this.nfts.filter(nft => !nft.isInVault);
        return this.nfts;
    }

    getImageUrl(nft: UserNFT): string {
        if (nft.metadata?.image) {
            if (nft.metadata.image.startsWith('ipfs://')) {
                return `https://ipfs.io/ipfs/${nft.metadata.image.replace('ipfs://', '')}`;
            }
            return nft.metadata.image;
        }
        return NFT_PLACEHOLDER;
    }

    isSelected(nft: UserNFT): boolean {
        return this.selectedTokenId === nft.tokenId;
    }

    isActionDisabled(nft: UserNFT): boolean {
        return this.actionButton?.disabled?.(nft) || false;
    }

    isActionLoading(nft: UserNFT): boolean {
        if (!this.actionButton?.loading) return false;
        return typeof this.actionButton.loading === 'function'
            ? this.actionButton.loading(nft)
            : this.actionButton.loading;
    }

    onNftClick(nft: UserNFT): void {
        this.selectNft.emit(nft);
    }

    onActionClick(event: Event, nft: UserNFT): void {
        event.stopPropagation();
        this.actionButton?.onClick(nft);
    }

    onImageError(event: Event): void {
        const target = event.target as HTMLImageElement;
        if (!target.src.startsWith('data:image/svg+xml')) {
            target.src = NFT_PLACEHOLDER;
        }
    }

    truncateDescription(description: string): string {
        return description.length > 100
            ? `${description.substring(0, 100)}...`
            : description;
    }

    trackByTokenId(index: number, nft: UserNFT): string {
        return nft.tokenId;
    }
}
