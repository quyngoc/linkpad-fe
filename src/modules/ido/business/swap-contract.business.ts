import { blockchainHandler } from '@/blockchain'
import FixedSwapContract from '@/libs/models/FixedSwapContract'
import { FixedPoolModel } from '@/models/fixed-pool-model'
import { walletStore } from '@/stores/wallet-store'
import { round } from 'lodash-es'
import moment, { Duration, duration } from 'moment'
import { PoolStore } from '../stores/pool-store'

interface PoolState {
  filled: boolean
  started: boolean
  ended: boolean
  startDuration: Duration
  endDuration: Duration
  startDate: moment.MomentInput
  endDate: moment.MomentInput
  isTBAStartDate: boolean
}

const formatDuration = (duration: moment.Duration) => {
  if (!duration) return ''
  let text = ''
  const makeNumber = n => round(Math.abs(n))
  const remainedHours = makeNumber(duration.asHours())
  const remainedSeconds = makeNumber(duration.asSeconds())
  if (remainedHours > 24) {
    text = `${makeNumber(duration.asDays())} day(s)`
  } else if (remainedHours > 1) {
    text = `${makeNumber(duration.asHours())} hour(s)`
  } else if (remainedSeconds > 60) {
    text = `${makeNumber(duration.asMinutes())} minute(s)`
  } else {
    text = `${makeNumber(remainedSeconds)} second(s)`
  }
  return text
}

const getPoolState = async (store: PoolStore): Promise<PoolState> => {
  const { pool, progress } = store
  const { startDate, endDate } = pool

  const isTBAStartDate = store.isTBAStartDate
  const started = isTBAStartDate ? false : moment(startDate).isBefore(moment())
  const startDuration = duration(moment().diff(moment(startDate)))
  const ended: any = endDate && moment(endDate).isBefore(moment())
  const endDuration: any = endDate && duration(moment(endDate).diff(moment()))
  const filled = progress > 99

  const result: PoolState = { started, startDuration, ended, endDuration, filled, startDate, endDate, isTBAStartDate }
  return result
  // if (ended) {
  //   return { ...result, state: filled ? 'Filled' : 'Ended', warn: !filled }
  // } else if (started) {
  //   const text = `remain ${formatDuration(endDuration)}`
  //   return { ...result, state: filled ? 'Filled' : text }
  // } else {
  //   const text = `in ${formatDuration(startDuration)}`
  //   return { ...result, state: text }
  // }
}

const getContract = (model: FixedPoolModel) => {
  return blockchainHandler.idoContractFactory(model)
  const { address: contractAddress, type } = model
  let contract: FixedSwapContract | undefined = undefined
  try {
    if (contractAddress) {
      switch (type) {
        case 'v1':
          contract = walletStore.app.getFixedSwapContract({ contractAddress })
          break
        case 'v2':
          contract = walletStore.app.getFixedSwapContractBsl({ contractAddress })
          break
        case 'v3':
          contract = walletStore.app.getFixedSwapContractV3({ contractAddress })
          break
        case 'v4':
          contract = walletStore.app.getFixedSwapContractV4({ contractAddress })
          break
        default:
          contract = walletStore.app.getFixedSwapContractV4({ contractAddress })
          break
      }
    }
  } catch (err) {
    console.error(err)
  }
  return contract
}

export { formatDuration, getPoolState, PoolState, getContract }
