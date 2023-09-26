export default FixedSwapContract;
export interface FixedSwapContractPurchase {
    _id: string,
    amount: string,
    purchaser: string,
    ethAmount: string,
    timestamp: Date,
    wasFinalized: boolean,
    reverted: boolean,
    validAfterDate?: Date,
    refunded: boolean,
    refundStart: Date,
	refundEnd: Date
}
/**
 * Fixed Swap Object
 * @constructor FixedSwapContract
 * @param {Web3} web3
 * @param {Address} tokenAddress
 * @param {Integer} decimals
 * @param {Address} contractAddress ? (opt)
 */
declare class FixedSwapContract {
    constructor({ web3, tokenAddress, decimals, contractAddress, acc, }: {
        web3: any;
        tokenAddress?: any;
        decimals?: any;
        contractAddress?: any;
        acc?: any;
    });
    web3: any;
    acc: any;
    params: {
        web3: any;
        contractAddress: any;
        contract: Contract;
    };
    decimals: any;
    injectMetamaskWeb3: (web3: Web3) => void
    __init__(): void;
    assertERC20Info: () => Promise<void>;
    __metamaskCall: ({ f, acc, value, callback }: {
        f: any;
        acc: any;
        value: any;
        callback?: () => void;
    }) => Promise<any>;
    __sendTx: (f: any, call: boolean, value: any, callback?: () => void) => Promise<any>;
    __deploy: (params: any, callback: any) => Promise<any>;
    /**
     * @function setNewOwner
     * @description Set New Owner of the Contract
     * @param {string} address
     */
    setNewOwner: ({ address }: string) => Promise<any>;
    /**
     * @function owner
     * @description Get Owner of the Contract
     * @returns {string} address
     */
    owner(): string;
    /**
     * @function isPaused
     * @description Get Owner of the Contract
     * @returns {boolean}
     */
    isPaused(): boolean;
    /**
     * @function pauseContract
     * @type admin
     * @description Pause Contract
     */
    pauseContract(): Promise<any>;
    /**
     * @function erc20
     * @description Get Token Address
     * @returns {Address} Token Address
     */
    erc20(): any;
    /**
     * @function decimals
     * @description Get Decimals
     * @returns {Integer} Integer
     */
    decimalsAsync(): any;
    /**
     * @function unpauseContract
     * @type admin
     * @description Unpause Contract
     */
    tradeErc20(): Promise<any>;
    /**
     * @function unpauseContract
     * @type admin
     * @description Unpause Contract
     */
    requiredErc20(): Promise<any>;
    /**
     * @function unpauseContract
     * @type admin
     * @description Unpause Contract
     */
    unpauseContract(): Promise<any>;
    /**
     * @function tradeValue
     * @description Get swapratio for the pool
     * @returns {Integer} trade value against ETH
     */
    tradeValue(): any;
    /**
     * @function startDate
     * @description Get Start Date of Pool
     * @returns {Date}
     */
    startDate(): Promise<Date>;
    /**
     * @function endDate
     * @description Get End Date of Pool
     * @returns {Date}
     */
    endDate(): Promise<Date>;
    /**
     * @function isFinalized
     * @description To see if contract was finalized
     * @returns {Boolean}
     */
    isFinalized(): Promise<boolean>;
    /**
     * @function individualMinimumAmount
     * @description Get Individual Minimum Amount for each address
     * @returns {Integer}
     */
    individualMinimumAmount(): any;
    /**
     * @function individualMaximumAmount
     * @description Get Individual Maximum Amount for each address
     * @returns {Integer}
     */
    individualMaximumAmount(): Promise<any>;
    /**
     * @function minimumRaiseAchieved
     * @description Was Minimum Raise Achieved
     * @returns {Boolean}
     */
    minimumRaiseAchieved(): Promise<boolean>;
    /**
     * @function minimumRaise
     * @description Get Minimum Raise amount for Token Sale
     * @returns {Integer} Amount in Tokens
     */
    minimumRaise(): any;
    /**
     * @function tokensAllocated
     * @description Get Total tokens Allocated already, therefore the tokens bought until now
     * @returns {Integer} Amount in Tokens
     */
    tokensAllocated(): any;
    /**
     * @function tokensForSale
     * @description Get Total tokens Allocated/In Sale for the Pool
     * @returns {Integer} Amount in Tokens
     */
    tokensForSale(): any;
    /**
     * @function hasMinimumRaise
     * @description See if hasMinimumRaise
     * @returns {Boolea}
     */
    hasMinimumRaise(): any;
    /**
     * @function minimumReached
     * @description See if minimumRaise was Reached
     * @returns {Integer}
     */
    wasMinimumRaiseReached(): any;
    /**
     * @function tokensAvailable
     * @description Get Total tokens owned by the Pool
     * @returns {Integer} Amount in Tokens
     */
    tokensAvailable(): Promise<any>;
    /**
     * @function tokensLeft
     * @description Get Total tokens available to be sold in the pool
     * @returns {Integer} Amount in Tokens
     */
    tokensLeft(): any;
    /**
     * @function withdrawableUnsoldTokens
     * @description Get Total tokens available to be withdrawn by the admin
     * @returns {Integer} Amount in Tokens
     */
    withdrawableUnsoldTokens(): any;
    /**
     * @function withdrawableFunds
     * @description Get Total funds raised to be withdrawn by the admin
     * @returns {Integer} Amount in ETH
     */
    withdrawableFunds(): any;
    /**
     * @function isTokenSwapAtomic
     * @description Verify if the Token Swap is atomic on this pool
     * @returns {Boolean}
     */
    isTokenSwapAtomic(): Promise<boolean>;
    /**
     * @function hasWhitelisting
     * @description Verify if swap has whitelisting
     * @returns {Boolean}
     */
    hasWhitelisting(): Promise<boolean>;
    /**
     * @function isWhitelisted
     * @description Verify if address is whitelisted
     * @returns {Boolean}
     */
    isWhitelisted({ address }: {
        address: any;
    }): Promise<boolean>;
    /**
     * @function wereUnsoldTokensReedemed
     * @description Verify if the admin already reemeded unsold tokens
     * @returns {Boolean}
     */
    wereUnsoldTokensReedemed(): boolean;
    /**
     * @function isFunded
     * @description Verify if the Token Sale is Funded with all Tokens proposed in tokensForSale
     * @returns {Boolean}
     */
    isFunded(): Promise<boolean>;
    /**
     * @function isOpen
     * @description Verify if the Token Sale is Open for Swap
     * @returns {Boolean}
     */
    isOpen(): Promise<boolean>;
    /**
     * @function hasStarted
     * @description Verify if the Token Sale has started the Swap
     * @returns {Boolean}
     */
    hasStarted(): Promise<boolean>;
    /**
     * @function hasFinalized
     * @description Verify if the Token Sale has finalized, if the current date is after endDate
     * @returns {Boolean}
     */
    hasFinalized(): Promise<boolean>;
    /**
     * @function isPreStart
     * @description Verify if the Token Sale in not open yet, where the admin can fund the pool
     * @returns {Boolean}
     */
    isPreStart(): Promise<boolean>;
    /**
     * @function getPurchase
     * @description Get Purchase based on ID
     * @param {Integer} purchase_id
     * @returns {Integer} _id
     * @returns {Integer} amount
     * @returns {Address} purchaser
     * @returns {Integer} ethAmount
     * @returns {Date} timestamp
     * @returns {Boolean} wasFinalized
     * @returns {Boolean} reverted
     */
    getPurchase: ({ purchase_id }: any) => Promise<FixedSwapContractPurchase>;
    getPendingPurchase: () => Promise<FixedSwapContractPurchase>;
    getBoughtAmount: (address: string) => Promise<string>;
    /**
     * @function getWhiteListedAddresses
     * @description Get Whitelisted Addresses
     * @returns {Array | Address} addresses
     */
    getWhitelistedAddresses: () => any[] | any;
    /**
     * @function getBuyers
     * @description Get Buyers
     * @returns {Array | Integer} _ids
     */
    getBuyers: () => Promise<any[]>;
    getBuyerLength: () => Promise<number>;
    isBuyer: (address: string) => Promise<boolean>;
    /**
     * @function getPurchaseIds
     * @description Get All Purchase Ids
     * @returns {(Array | Integer)} _ids
     */
    getPurchaseIds: () => (any[] | any);
    /**
     * @function getPurchaseIds
     * @description Get All Purchase Ids filter by Address/Purchaser
     * @param {Address} address
     * @returns {Array | Integer} _ids
     */
    getAddressPurchaseIds: ({ address }: any) => any[] | any;
    /**
     * @function getETHCostFromTokens
     * @description Get ETH Cost from Tokens Amount
     * @param {Integer} tokenAmount
     * @returns {Integer} ethAmount
     */
    getETHCostFromTokens: ({ tokenAmount }: any) => any;
    /**
     * @function swap
     * @description Swap tokens by Ethereum
     * @param {Integer} tokenAmount
     */
    swap: ({ tokenAmount, callback }: any) => Promise<any>;
    /**
     * @function redeemTokens
     * @variation isStandard
     * @description Reedem tokens bought
     * @param {Integer} purchase_id
     */
    redeemTokens: ({ purchase_id }: any) => Promise<any>;
    /**
     * @function redeemGivenMinimumGoalNotAchieved
     * @variation isStandard
     * @description Reedem Ethereum from sale that did not achieve minimum goal
     * @param {Integer} purchase_id
     */
    redeemGivenMinimumGoalNotAchieved: ({ purchase_id }: any) => Promise<any>;
    /**
     * @function withdrawUnsoldTokens
     * @description Withdraw unsold tokens of sale
     */
    withdrawUnsoldTokens: () => Promise<any>;
    /**
     * @function withdrawFunds
     * @description Withdraw all funds from tokens sold
     */
    withdrawFunds: () => Promise<any>;
    /**
     * @function approveFundERC20
     * @description Approve the pool to use approved tokens for sale
     */
    approveFundERC20: ({ tokenAmount, callback }: {
        tokenAmount: any;
        callback: any;
    }) => Promise<any>;
    /**
     * @function isApproved
     * @description Verify if the Admin has approved the pool to use receive the tokens for sale
     * @param {Integer} tokenAmount
     * @param {Address} address
     * @returns {Boolean}
     */
    isApproved: ({ tokenAmount, address }: any) => boolean;
    /**
     * @function fund
     * @description Send tokens to pool for sale, fund the sale
     * @param {Integer} tokenAmount
     */
    fund: ({ tokenAmount, callback }: any) => Promise<any>;
    /**
     * @function addWhitelistedAddress
     * @description add WhiteListed Address
     * @param { Array | Addresses} Addresses
     */
    addWhitelistedAddress: ({ addresses }: any[] | any) => Promise<any>;
    /**
    * @function removeWhitelistedAddress
    * @description remove WhiteListed Address
    */
    removeWhitelistedAddress: ({ address, index }: {
        address: any;
        index: any;
    }) => Promise<any>;
    /**
     * @function safePull
     * @description Safe Pull all tokens & ETH
     */
    safePull: () => Promise<any>;
    /**
     * @function removeOtherERC20Tokens
     * @description Remove Tokens from other ERC20 Address (in case of accident)
     * @param {Address} tokenAddress
     * @param {Address} toAddress
     */
    removeOtherERC20Tokens: ({ tokenAddress, toAddress }: any) => Promise<any>;
    __assert(): void;
    getDecimals: () => any;
    /**
    * @function deploy
    * @description Deploy the Pool Contract
    
    */
    deploy: ({ tradeValue, tokensForSale, startDate, endDate, individualMinimumAmount, individualMaximumAmount, isTokenSwapAtomic, minimumRaise, feeAmount, hasWhitelisting, callback }: {
        tradeValue: any;
        tokensForSale: any;
        startDate: any;
        endDate: any;
        individualMinimumAmount?: number;
        individualMaximumAmount?: number;
        isTokenSwapAtomic?: boolean;
        minimumRaise?: number;
        feeAmount?: number;
        hasWhitelisting?: boolean;
        callback: any;
    }) => Promise<any>;
    getAddress(): any;
    getTokenAddress(): any;
    getTokenContract(): any;
    /**
     * @function getOwner
     * @description Get owner address of contract
     * @param {Address} Address
     */
    getOwner: () => Promise<any>;
    /**
     * @function getBalance
     * @description Get Balance of Contract
     * @param {Integer} Balance
     */
    getBalance: () => Promise<any>;
    getRedeemedAmount: () => Promise<any>;
    getAmountConfigs: () => Promise<any>;
    getTax: () => Promise<any>;
    refund:() => Promise<any>;
}
import Web3 from "web3";
import Contract from "./Contract";
