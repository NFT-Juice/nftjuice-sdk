import { ethers } from 'ethers';

export class NFTJuiceSDK {
    contract: ethers.Contract;

    constructor(address: string, abi: any, provider: ethers.Provider) {
        this.contract = new ethers.Contract(address, abi, provider);
    }

    async read(method: string, ...args: any[]) {
        // return this.contract[method](...args);
    }

    async write(signer: ethers.Signer, method: string, ...args: any[]) {
        // return this.contract.connect(signer)[method](...args);
    }
}