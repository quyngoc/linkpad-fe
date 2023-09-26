export default Contract;
declare class Contract {
    constructor(web3: any, contract_json: any, address: any);
    web3: any;
    json: any;
    abi: any;
    address: any;
    contract: any;
    deploy(account: any, abi: any, byteCode: any, args?: any[], callback?: () => void, ...args: any[]): Promise<any>;
    __metamaskDeploy: ({ byteCode, args, acc, callback }: {
        byteCode: any;
        args: any;
        acc: any;
        callback?: () => void;
    }) => Promise<any>;
    use(contract_json: any, address: any): Promise<void>;
    send(account: any, byteCode: any, value?: string, callback?: () => void): Promise<any>;
    getContract(): any;
    getABI(): any;
    getJSON(): any;
    getAddress(): any;
}
