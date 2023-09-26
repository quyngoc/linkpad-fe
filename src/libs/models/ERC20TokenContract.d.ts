export default ERC20TokenContract;
declare class ERC20TokenContract {
    constructor({ decimals, contractAddress, web3, acc }: {
        decimals: any;
        contractAddress: any;
        web3: any;
        acc: any;
    });
    acc: any;
    params: {
        web3: any;
        contractAddress: any;
        contract: contract;
        decimals: any;
    };
    initAsync: () => Promise<any>
    __metamaskCall: ({ f, acc, value, callback }: {
        f: any;
        acc: any;
        value: any;
        callback?: () => void;
    }) => Promise<any>;
    __sendTx: (f: any, call: boolean, value: any, callback?: () => void) => Promise<any>;
    __assert(): void;
    getContract(): any;
    getAddress(): any;
    setNewOwner: ({ address }: {
        address: any;
    }) => Promise<any>;
    transferTokenAmount({ toAddress, tokenAmount }: {
        toAddress: any;
        tokenAmount: any;
    }): Promise<any>;
    getTokenAmount(address: any): Promise<any>;
    totalSupply(): Promise<any>;
    getABI(): any;
    getDecimals(): any;
    isApproved({ address, amount, spenderAddress }: {
        address: any;
        amount?: string;
        spenderAddress: any;
    }): Promise<boolean>;
    approve({ address, amount, callback }: {
        address: any;
        callback?: any;
    }): Promise<any>;
}
import contract from "./Contract";
