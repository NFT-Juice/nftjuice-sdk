import { ethers } from 'ethers';
export class NFTJuiceSDK {
    contract;
    constructor(address, abi, provider) {
        this.contract = new ethers.Contract(address, abi, provider);
    }
    async read(method, ...args) {
        // return this.contract[method](...args);
    }
    async write(signer, method, ...args) {
        // return this.contract.connect(signer)[method](...args);
    }
}
//# sourceMappingURL=index.js.map