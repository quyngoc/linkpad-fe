class NumberHelper {
  usdFormat = (number: any, minimumFractionDigits: any = 2, maximumFractionDigits: any = 6) => {
    if (!isNaN(+number) && +number !== 0) {
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits,
        maximumFractionDigits,
      });
      return formatter.format(+number);
    }
    return number;
  };
  formatNumber = (number: any, maximumFractionDigits = 5) => {
    const nf = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: maximumFractionDigits,
    });
    return nf.format(number);
  };
  isNumber = (number: any) => {
    return /^[0-9]*$/gi.test(number);
  };
}

export const numberHelper = new NumberHelper();
