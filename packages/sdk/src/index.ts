import {ethers, EventLog} from 'ethers';
import {NETWORK_CONFIGS} from './types.js';
import {NFTJuiceVaultABI, BottleNFTABI, JuiceTokenABI, ERC721ABI} from './abis.js';
import type {
    UserNFT,
    NFTBalance,
    SDKOptions,
    NFTMetadata,
    UserBalances,
    DepositResult,
    NetworkConfig,
    WithdrawResult,
    AllowNFTResult,
    CollectionInfo,
    CollectionBalance,
    DisallowNFTResult,
    TransactionOptions,
    UpdateFeeConfigResult,
} from './types.js';

export class NFTJuiceSDK {
    private signer?: ethers.Signer;

    private readonly provider: ethers.Provider;
    private readonly vaultContract: ethers.Contract;
    private readonly networkConfig: NetworkConfig;

    constructor(options: SDKOptions) {
        if (!options.network) {
            throw new Error('Network is required. Specify a network like { network: "mainnet" } or provide a custom NetworkConfig.');
        }

        if (typeof options.network === 'string') {
            this.networkConfig = NETWORK_CONFIGS[options.network];
        } else {
            this.networkConfig = options.network;
        }

        this.provider = options.provider || new ethers.JsonRpcProvider(this.networkConfig.rpcUrl);

        if (options.signer) {
            this.signer = options.signer;
        }

        this.vaultContract = new ethers.Contract(
            this.networkConfig.vaultContract,
            NFTJuiceVaultABI,
            this.provider
        );
    }

    setSigner(signer: ethers.Signer): void {
        this.signer = signer;
    }

    private requireSigner(): ethers.Signer {
        if (!this.signer) {
            throw new Error('Signer required for this operation. Call setSigner() first.');
        }
        return this.signer;
    }

    private getContractWithSigner(contract: ethers.Contract): ethers.Contract {
        const signer = this.requireSigner();
        return contract.connect(signer) as ethers.Contract;
    }

    async depositNFT(
        collectionAddress: string,
        tokenId: string,
    ): Promise<DepositResult> {
        const signer = this.requireSigner();

        const nftContract = new ethers.Contract(collectionAddress, ERC721ABI, signer) as ethers.Contract;
        const currentOwner = await (nftContract as any).ownerOf(tokenId);
        const signerAddress = await signer.getAddress();

        if (currentOwner.toLowerCase() !== signerAddress.toLowerCase()) {
            throw new Error('You do not own this NFT');
        }

        const approvedAddress = await (nftContract as any).getApproved(tokenId);
        if (approvedAddress.toLowerCase() !== this.networkConfig.vaultContract.toLowerCase()) {
            const approveTx = await (nftContract as any).approve(this.networkConfig.vaultContract, tokenId);
            await approveTx.wait();
        }

        const tx = await (nftContract as any).safeTransferFrom(signerAddress, this.networkConfig.vaultContract, tokenId);
        const receipt = await tx.wait();

        const depositEvent = receipt.logs.find((log: any) => {
            try {
                const parsed = this.vaultContract.interface.parseLog(log);
                return parsed?.name === 'NFTDeposited';
            } catch {
                return false;
            }
        });

        let bottleTokenId = '';
        let juiceReceived = '';

        if (depositEvent) {
            const parsed = this.vaultContract.interface.parseLog(depositEvent);
            console.log('parsed', parsed)
            bottleTokenId = tokenId;

            const feeConfig = await this.getCollectionFeeConfig(collectionAddress);
            const totalFees = feeConfig.collectionOwnerFees + feeConfig.operatorFees;
            const userAmount = 100 - totalFees;
            juiceReceived = userAmount.toString();
        }

        return {
            transactionHash: tx.hash,
            bottleTokenId,
            juiceReceived,
            gasUsed: receipt.gasUsed.toString()
        };
    }

    async withdrawNFT(
        collectionAddress: string,
        tokenId: string,
    ): Promise<WithdrawResult> {
        const signer = this.requireSigner();

        const collectionInfo = await this.getCollectionInfo(collectionAddress);
        if (!collectionInfo.isAllowed) {
            throw new Error('Collection is not whitelisted');
        }

        const juiceContract = new ethers.Contract(collectionInfo.juiceContract, JuiceTokenABI, signer) as ethers.Contract;
        const userAddress = await signer.getAddress();
        const juiceBalance = await (juiceContract as any).balanceOf(userAddress);

        if (juiceBalance < ethers.parseEther('100')) {
            throw new Error('Insufficient Juice tokens. Need 100 Juice to withdraw NFT.');
        }

        const bottleContract = new ethers.Contract(collectionInfo.bottleContract, BottleNFTABI, signer) as ethers.Contract;
        const bottleOwner = await (bottleContract as any).ownerOf(tokenId);
        if (bottleOwner.toLowerCase() !== userAddress.toLowerCase()) {
            throw new Error('You do not own the Bottle NFT for this token');
        }

        const bottleApproved = await (bottleContract as any).getApproved(tokenId);
        if (bottleApproved.toLowerCase() !== this.networkConfig.vaultContract.toLowerCase()) {
            const approveTx = await (bottleContract as any).approve(this.networkConfig.vaultContract, tokenId);
            await approveTx.wait();
        }

        const tx = await (bottleContract as any).safeTransferFrom(userAddress, this.networkConfig.vaultContract, tokenId);
        const receipt = await tx.wait();

        return {
            transactionHash: tx.hash,
            nftTokenId: tokenId,
            juiceBurned: '100',
            gasUsed: receipt.gasUsed.toString()
        };
    }

    async getCollectionInfo(collectionAddress: string): Promise<CollectionInfo> {
        const isAllowed = await (this.vaultContract as any).allowedCollections(collectionAddress);

        if (!isAllowed) {
            return {
                collectionAddress,
                bottleContract: '',
                juiceContract: '',
                operatorFee: 0,
                ownerFee: 0,
                operatorAddress: '',
                ownerAddress: '',
                isAllowed: false
            };
        }

        const [pair, feeConfig] = await Promise.all([
            (this.vaultContract as any).pairs(collectionAddress),
            (this.vaultContract as any).feeConfigs(collectionAddress)
        ]);

        return {
            collectionAddress,
            bottleContract: pair.bottle,
            juiceContract: pair.juice,
            operatorFee: Number(feeConfig.operatorFees),
            ownerFee: Number(feeConfig.collectionOwnerFees),
            operatorAddress: feeConfig.operator,
            ownerAddress: feeConfig.collectionOwner,
            isAllowed: true
        };
    }

    async getUserBalances(userAddress: string, collectionAddresses: string[]): Promise<UserBalances> {
        const collections: CollectionBalance[] = [];

        for (const collectionAddress of collectionAddresses) {
            const collectionInfo = await this.getCollectionInfo(collectionAddress);

            if (!collectionInfo.isAllowed) continue;

            const juiceContract = new ethers.Contract(collectionInfo.juiceContract, JuiceTokenABI, this.provider);
            const juiceBalance = await (juiceContract as any).balanceOf(userAddress);

            const bottleContract = new ethers.Contract(collectionInfo.bottleContract, BottleNFTABI, this.provider);
            const bottleBalance = await (bottleContract as any).balanceOf(userAddress);

            const bottleNFTs: NFTBalance[] = [];

            if (Number(bottleBalance) > 0) {
                try {
                    for (let i = 0; i < Number(bottleBalance); i++) {
                        try {
                            const tokenId = await (bottleContract as any).tokenOfOwnerByIndex(userAddress, i);
                            const tokenUri = await (bottleContract as any).tokenURI(tokenId);
                            bottleNFTs.push({
                                tokenId: tokenId.toString(),
                                tokenUri
                            });
                        } catch (error) {
                            console.warn(`Failed to get bottle NFT at index ${i}:`, error);
                        }
                    }
                } catch (error) {
                    console.warn('Failed to query bottle NFTs:', error);
                }
            }

            collections.push({
                collectionAddress,
                bottleNFTs,
                juiceBalance: ethers.formatEther(juiceBalance),
                juiceContract: collectionInfo.juiceContract,
                bottleContract: collectionInfo.bottleContract
            });
        }

        return {
            address: userAddress,
            collections
        };
    }

    async isCollectionAllowed(collectionAddress: string): Promise<boolean> {
        return await (this.vaultContract as any).allowedCollections(collectionAddress);
    }

    async getCollectionFeeConfig(collectionAddress: string): Promise<{
        collectionOwner: string,
        collectionOwnerFees: number,
        operator: string,
        operatorFees: number
    }> {
        const feeConfig = await (this.vaultContract as any).feeConfigs(collectionAddress);
        return {
            collectionOwner: feeConfig.collectionOwner,
            collectionOwnerFees: Number(feeConfig.collectionOwnerFees),
            operator: feeConfig.operator,
            operatorFees: Number(feeConfig.operatorFees)
        };
    }

    // Owner methods
    async allowNFT(
        collectionAddress: string,
        ownerAddress: string,
        ownerFeePercentage: number,
        operatorAddress: string,
        operatorFeePercentage: number,
        txOptions?: TransactionOptions
    ): Promise<AllowNFTResult> {
        const signer = this.requireSigner();
        const vaultWithSigner = this.getContractWithSigner(this.vaultContract);

        const tx = await (vaultWithSigner as any).allowNFT(
            collectionAddress,
            ownerAddress,
            ownerFeePercentage,
            operatorAddress,
            operatorFeePercentage,
            txOptions
        );

        const receipt = await tx.wait();

        const collectionInfo = await this.getCollectionInfo(collectionAddress);

        return {
            transactionHash: tx.hash,
            bottleContract: collectionInfo.bottleContract,
            juiceContract: collectionInfo.juiceContract,
            gasUsed: receipt.gasUsed.toString()
        };
    }

    async disallowNFT(
        collectionAddress: string,
        txOptions?: TransactionOptions
    ): Promise<DisallowNFTResult> {
        const signer = this.requireSigner();
        const vaultWithSigner = this.getContractWithSigner(this.vaultContract);

        const tx = await (vaultWithSigner as any).disallowNFT(
            collectionAddress,
            txOptions
        );

        const receipt = await tx.wait();

        return {
            transactionHash: tx.hash,
            gasUsed: receipt.gasUsed.toString()
        };
    }

    async updateFeeConfig(
        collectionAddress: string,
        ownerAddress: string,
        ownerFeePercentage: number,
        operatorAddress: string,
        operatorFeePercentage: number,
        txOptions?: TransactionOptions
    ): Promise<UpdateFeeConfigResult> {
        const signer = this.requireSigner();
        const vaultWithSigner = this.getContractWithSigner(this.vaultContract);

        const tx = await (vaultWithSigner as any).updateFeeConfig(
            collectionAddress,
            ownerAddress,
            ownerFeePercentage,
            operatorAddress,
            operatorFeePercentage,
            txOptions
        );

        const receipt = await tx.wait();

        return {
            transactionHash: tx.hash,
            gasUsed: receipt.gasUsed.toString()
        };
    }

    private async checkSupportsEnumerable(contract: ethers.Contract): Promise<boolean> {
        try {
            const ERC721_ENUMERABLE_INTERFACE_ID = '0x780e9d63';
            return await (contract as any).supportsInterface(ERC721_ENUMERABLE_INTERFACE_ID);
        } catch (error) {
            return false;
        }
    }

    private async getVaultedTokenIds(collectionAddress: string): Promise<Set<string>> {
        const vaultedTokens = new Set<string>();

        try {
            const depositFilter = this.vaultContract.filters.NFTDeposited?.(collectionAddress);
            if (depositFilter) {
                const depositEvents = await this.vaultContract.queryFilter(depositFilter, 0);

                for (const event of depositEvents) {
                    if ((event as EventLog)?.args) {
                        const tokenId = (event as EventLog)?.args?.[1];
                        vaultedTokens.add(tokenId.toString());
                    }
                }
            }

            const withdrawFilter = this.vaultContract.filters.NFTWithdrawn?.(collectionAddress);
            if (withdrawFilter) {
                const withdrawEvents = await this.vaultContract.queryFilter(withdrawFilter, 0);

                for (const event of withdrawEvents) {
                    if ((event as EventLog)?.args) {
                        const tokenId = (event as EventLog)?.args?.[1];
                        vaultedTokens.delete(tokenId.toString());
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to query vault NFTs:', error);
        }

        return vaultedTokens;
    }

    async fetchNFTMetadata(tokenUri: string): Promise<NFTMetadata | undefined> {
        try {
            if (!tokenUri || tokenUri === '') {
                return undefined;
            }

            // Handle IPFS URLs
            let url = tokenUri;
            if (tokenUri.startsWith('ipfs://')) {
                url = tokenUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }

            const response = await fetch(url);
            if (!response.ok) {
                return undefined;
            }

            const metadata = await response.json();

            // Handle IPFS image URLs
            let image = metadata.image;
            if (image && image.startsWith('ipfs://')) {
                image = image.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }

            return {
                name: metadata.name,
                description: metadata.description,
                image,
                attributes: metadata.attributes || []
            };
        } catch (error) {
            console.warn('Failed to fetch NFT metadata:', error);
            return undefined;
        }
    }

    async getUserNFTs(userAddress: string, collectionAddress: string): Promise<UserNFT[]> {
        const collectionInfo = await this.getCollectionInfo(collectionAddress);
        if (!collectionInfo.isAllowed) {
            return [];
        }

        const nftContract = new ethers.Contract(collectionAddress, ERC721ABI, this.provider);

        const vaultNFTs = await this.getVaultedTokenIds(collectionAddress);
        const userNFTs: UserNFT[] = [];

        try {
            // Check if the external NFT collection supports ERC721Enumerable
            const supportsEnumerable = await this.checkSupportsEnumerable(nftContract);

            if (supportsEnumerable) {
                // Use optimized enumerable approach
                const balance = await (nftContract as any).balanceOf(userAddress);

                if (Number(balance) > 0) {
                    for (let i = 0; i < Number(balance); i++) {
                        try {
                            const tokenId = await (nftContract as any).tokenOfOwnerByIndex(userAddress, i);
                            const tokenIdString = tokenId.toString();
                            const tokenUri = await (nftContract as any).tokenURI(tokenId);
                            const metadata = await this.fetchNFTMetadata(tokenUri);

                            userNFTs.push({
                                tokenId: tokenIdString,
                                tokenUri,
                                ...(metadata && {metadata}),
                                isInVault: vaultNFTs.has(tokenIdString)
                            });
                        } catch (error) {
                            console.warn(`Failed to get NFT at index ${i}:`, error);
                        }
                    }
                }
            } else {
                // Fallback to event-based approach for non-enumerable contracts
                const transferFilter = nftContract.filters.Transfer?.(null, userAddress);
                if (transferFilter) {
                    const transferEvents = await nftContract.queryFilter(transferFilter, 0);
                    const processedTokenIds = new Set<string>();

                    for (const event of transferEvents) {
                        if ((event as EventLog)?.args) {
                            const tokenId = (event as EventLog)?.args?.[2];
                            const tokenIdString = tokenId.toString();

                            if (processedTokenIds.has(tokenIdString)) {
                                continue;
                            }
                            processedTokenIds.add(tokenIdString);

                            try {
                                const currentOwner = await (nftContract as any).ownerOf(tokenId);
                                if (currentOwner.toLowerCase() === userAddress.toLowerCase()) {
                                    const tokenUri = await (nftContract as any).tokenURI(tokenId);
                                    const metadata = await this.fetchNFTMetadata(tokenUri);

                                    userNFTs.push({
                                        tokenId: tokenIdString,
                                        tokenUri,
                                        ...(metadata && {metadata}),
                                        isInVault: vaultNFTs.has(tokenIdString)
                                    });
                                }
                            } catch (error) {
                                console.warn(`Failed to get info for token ${tokenIdString}:`, error);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to query user NFTs:', error);
        }

        return userNFTs;
    }

    async getVaultNFTs(userAddress: string, collectionAddress: string): Promise<UserNFT[]> {
        const collectionInfo = await this.getCollectionInfo(collectionAddress);
        if (!collectionInfo.isAllowed) {
            return [];
        }

        const nftContract = new ethers.Contract(collectionAddress, ERC721ABI, this.provider);
        const bottleContract = new ethers.Contract(collectionInfo.bottleContract, BottleNFTABI, this.provider);
        const vaultNFTs: UserNFT[] = [];

        try {
            const bottleBalance = await (bottleContract as any).balanceOf(userAddress);

            if (Number(bottleBalance) > 0) {
                for (let i = 0; i < Number(bottleBalance); i++) {
                    try {
                        const tokenId = await (bottleContract as any).tokenOfOwnerByIndex(userAddress, i);
                        const tokenUri = await (nftContract as any).tokenURI(tokenId);
                        const metadata = await this.fetchNFTMetadata(tokenUri);

                        vaultNFTs.push({
                            tokenId: tokenId.toString(),
                            tokenUri,
                            ...(metadata && {metadata}),
                            isInVault: true
                        });
                    } catch (error) {
                        console.warn(`Failed to get vault NFT at index ${i}:`, error);
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to query vault NFTs:', error);
        }

        return vaultNFTs;
    }

    get currentNetworkConfig(): NetworkConfig {
        return this.networkConfig;
    }
}

export * from './types.js';
export * from './abis.js';