import { ChainId } from '@pancakeswap-libs/sdk-v2'

const BSCSCAN_PREFIXES: { [chainId in ChainId]: string } = {
  56: '',
  97: 'testnet.'
}

export function getBscScanLink(chainId: number, data: string, type: 'transaction' | 'token' | 'address'): string {
  let prefix = `https://${BSCSCAN_PREFIXES[chainId] || BSCSCAN_PREFIXES[ChainId.MAINNET]}bscscan.com`
  if (chainId === 1) {
    prefix = 'ttps://etherscan.io'
  } else if (chainId === 3) {
    prefix = 'https://ropsten.etherscan.io/'
  }

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}
