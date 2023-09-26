export default Numbers;
declare let Numbers: numbers;
declare class numbers {
    fromDayMonthYear(date: any): any;
    fromSmartContractTimeToMinutes(time: any): any;
    fromMinutesToSmartContracTime(time: any): any;
    fromHex(hex: any): any;
    toFloat(number: any): number;
    timeToSmartContractTime(time: any): number;
    toDate(date: any): any;
    toMoney(number: any): any;
    toFormatBet(number: any): number;
    formatNumber(number: any): any;
    toSmartContractDecimals(value: any, decimals: any): any;
    fromBigNumberToInteger(value: any, decimals?: number): number;
    fromDecimals(value: any, decimals: any): any;
    fromExponential(x: any): any;
}
