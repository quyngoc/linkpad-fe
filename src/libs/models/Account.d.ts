export default Account;
declare class Account {
    constructor(web3: any, account: any);
    web3: any;
    account: any;
    getBalance(): Promise<any>;
    getAddress(): any;
    getPrivateKey(): any;
    getAccount(): any;
    sendEther(amount: any, address: any, data?: any): Promise<any>;
}
