import { FixedNumber } from '@ethersproject/bignumber'

export interface TierModel {
  index?: number
  type?: string
  name?: string
  requiredAmount?: FixedNumber
  duration?: string
  allocationSize?: FixedNumber
  allocationType?: string
  color?: string
}
