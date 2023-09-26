import { TierModel } from '@/models/tier-mode'
import { FixedNumber } from '@ethersproject/bignumber'

export const Zero = FixedNumber.from(0)
export const fn100 = FixedNumber.from('100')
export const YEAR_IN_SECONDS = 365 * 24 * 60 * 60
export const adminWallets = ['0xDDfb3051B95170B7c4a1a3f5dEa12444870a4808']

export const noTier: TierModel = {
  index: 0,
  type: 'no-tier',
  name: 'No Tier',
  requiredAmount: FixedNumber.from('0'),
  duration: '15 days',
  allocationSize: FixedNumber.from('0'),
  color: '#16182D'
}
export const friendTier: TierModel = {
  index: 1,
  type: 'friend',
  name: "MOMO's Friend",
  requiredAmount: FixedNumber.from('100000000'),
  duration: '15 days',
  allocationSize: FixedNumber.from('100'),
  color: '#00AAF3'
}
export const communityTier: TierModel = {
  index: 2,
  type: 'community',
  name: "MOMO's Community",
  requiredAmount: FixedNumber.from('500000000'),
  duration: '15 days',
  allocationSize: FixedNumber.from('500'),
  color: '#009988'
}
export const familyTier: TierModel = {
  index: 3,
  type: 'family',
  name: "MOMO's Family",
  requiredAmount: FixedNumber.from('1000000000'),
  duration: '15 days',
  allocationSize: FixedNumber.from('1000'),
  color: '#FE9800'
}
export const loverTier: TierModel = {
  index: 4,
  type: 'lover',
  name: "MOMO's Lover",
  requiredAmount: FixedNumber.from('2500000000'),
  duration: '15 days',
  allocationSize: FixedNumber.from('2500'),
  color: '#FF5190'
}
export const mammaTier: TierModel = {
  index: 5,
  type: 'mamma',
  name: "MOMO's Mamma",
  requiredAmount: FixedNumber.from('5000000000'),
  duration: '15 days',
  allocationSize: FixedNumber.from('5000'),
  color: '#844AFF'
}
export const papaTier: TierModel = {
  index: 6,
  type: 'papa',
  name: "MOMO's Papa",
  requiredAmount: FixedNumber.from('10000000000'),
  duration: '15 days',
  allocationSize: FixedNumber.from('12000'),
  color: '#3E53B5'
}

export const TIERS: TierModel[] = [noTier, friendTier, communityTier, familyTier, loverTier, mammaTier, papaTier]
