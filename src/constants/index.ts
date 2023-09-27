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
  duration: '30 days',
  allocationSize: FixedNumber.from('0'),
  allocationType: 'FCFS',
  color: '#16182D'
}
export const tier1: TierModel = {
  index: 1,
  type: 'tier1',
  name: 'Tier 1',
  requiredAmount: FixedNumber.from('10000'),
  duration: '30 days',
  allocationSize: FixedNumber.from('100'),
  allocationType: 'FCFS',
  color: '#00AAF3'
}
export const tier2: TierModel = {
  index: 2,
  type: 'tier2',
  name: 'Tier 2',
  requiredAmount: FixedNumber.from('20000'),
  duration: '30 days',
  allocationSize: FixedNumber.from('200'),
  allocationType: 'FCFS',
  color: '#009988'
}
export const tier3: TierModel = {
  index: 3,
  type: 'tier3',
  name: 'Tier 3',
  requiredAmount: FixedNumber.from('50000'),
  duration: '30 days',
  allocationSize: FixedNumber.from('500'),
  allocationType: 'Guaranteed',
  color: '#FE9800'
}
export const tier4: TierModel = {
  index: 4,
  type: 'tier4',
  name: 'Tier 4',
  requiredAmount: FixedNumber.from('100000'),
  duration: '30 days',
  allocationSize: FixedNumber.from('2000'),
  allocationType: 'Guaranteed',
  color: '#FF5190'
}

export const TIERS: TierModel[] = [noTier, tier1, tier2, tier3, tier4]
