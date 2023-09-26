import { BigNumber, FixedNumber } from '@ethersproject/bignumber'

class BigNumberHelper {
  /**
   * Greater than
   */
  gt(first: FixedNumber, second: FixedNumber) {
    const diff = first.subUnsafe(second)
    return !diff.isZero() && !diff.isNegative()
  }

  gte(first, second) {
    const diff = first.subUnsafe(second)
    return !diff.isNegative()
  }
  /**
   * Less than
   */
  lt(first: FixedNumber, second: FixedNumber) {
    return first.subUnsafe(second).isNegative()
  }

  lte(first, second) {
    const diff = first.subUnsafe(second)
    return diff.isZero() || diff.isNegative()
  }

  getDecimals(decimals = 18) {
    return FixedNumber.from(
      BigNumber.from('10')
        .pow(decimals)
        .toString()
    )
  }

  fromDecimals(amount, decimals: any = 18) {
    return FixedNumber.from(`${amount}`).divUnsafe(this.getDecimals(+decimals))
  }

  toDecimalString(fx: FixedNumber | string, decimals: any = 18) {
    fx = FixedNumber.from(fx.toString())
    const num = fx.mulUnsafe(this.getDecimals(+decimals))
    // xxx.0 => take xxx
    return num.toString().split('.')[0]
  }
}

export const bigNumberHelper = new BigNumberHelper()
