import { ethers } from 'ethers';
export declare class NFTJuiceSDK {
    contract: ethers.Contract;
    constructor(address: string, abi: any, provider: ethers.Provider);
    read(method: string, ...args: any[]): Promise<void>;
    write(signer: ethers.Signer, method: string, ...args: any[]): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map