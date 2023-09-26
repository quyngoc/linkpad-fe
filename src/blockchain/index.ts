import Web3 from 'web3'
import { FixedPoolModel } from '@/models/fixed-pool-model'
import { isNumber } from 'lodash-es'
import FixedSwapContract from '@/libs/models/FixedSwapContract.js'
import FixedSwapContractBsl from '@/libs/models/FixedSwapContract.bsl.js'
import FixedSwapContractV3 from '@/libs/models/FixedSwapContract.v3.js'
import FixedSwapContractV4 from '@/libs/models/FixedSwapContract.v4.js'
import FixedSwapContractV5 from '@/libs/models/FixedSwapContract.v5.js'

const ethMainnetRpcs = [
  'https://cool-dark-owl.discover.quiknode.pro/a75573e38fec6cb3f26eb848e8f09e6bebf75e2f',
  'https://aged-snowy-friday.discover.quiknode.pro/b238b96c74a10d300d956471b39b0f37763e75f8',
  'https://black-icy-butterfly.discover.quiknode.pro/1b797aed02c61f99a0bb78be1f8561e33d795017',
  'https://chaotic-wandering-needle.discover.quiknode.pro/956e28e2649454fd76596095400a83940dc13f6b',
  'https://young-skilled-firefly.discover.quiknode.pro/3365e9fc7faf15584fce2b42fabf5f1cf870a537',
  'https://sly-smart-water.discover.quiknode.pro/5602c613e30744ab0cb3de42431a1e729a3049d9',
  'https://distinguished-frequent-river.discover.quiknode.pro/8300c14a3b88ade043d6812e451cdab9dd09ab44'
]

const getRandomRpc = () => {
  const randomIndex = Math.floor(Math.random() * ethMainnetRpcs.length)
  const rpc = ethMainnetRpcs[randomIndex]
  return rpc || 'https://cool-dark-owl.discover.quiknode.pro/a75573e38fec6cb3f26eb848e8f09e6bebf75e2f'
}

const getChainConfig = (chainId: any) => {
  chainId = isNumber(+chainId) ? +chainId : chainId
  let rpc = ''
  let name = ''
  switch (chainId) {
    case 1:
    case 'eth':
      name = 'Ethereum Mainnet'
      rpc = getRandomRpc()
      break
    case 3:
      name = 'Ropsten Test Network'
      rpc = 'https://speedy-nodes-nyc.moralis.io/1cbc67e7252c9ef1e7e63dc8/eth/ropsten'
      break
    case 56:
    case 'bsc':
      name = 'BSC MainNET'
      rpc = 'https://bsc.publicnode.com'
      break
    case 97:
      name = 'BSC TestNET'
      rpc = 'https://bsc-testnet.publicnode.com'
      break
  }
  return { rpc, name }
}

const getWeb3 = (chainId: any) => {
  chainId = isNumber(+chainId) ? +chainId : chainId
  const { rpc, name } = getChainConfig(chainId)
  if (rpc) return new Web3(new Web3.providers.HttpProvider(rpc))
  else return null
}
function idoContractFactory(model: FixedPoolModel) {
  const { address: contractAddress, type, chainId } = model
  const web3 = getWeb3(chainId)
  if (!contractAddress) return null
  let contract: FixedSwapContract | undefined = undefined
  switch (type) {
    case 'v1':
      contract = new FixedSwapContract({
        web3: web3,
        contractAddress,
        decimals: 18
      })
      break
    case 'v2':
      contract = new FixedSwapContractBsl({
        web3: web3,
        contractAddress,
        decimals: 18
      })
      break
    case 'v3':
      contract = new FixedSwapContractV3({
        web3: web3,
        contractAddress,
        decimals: 18
      })
      break
    case 'v4':
      contract = new FixedSwapContractV4({
        web3: web3,
        contractAddress,
        decimals: 18
      })
      break
    case 'v5':
    default:
      contract = new FixedSwapContractV5({
        web3: web3,
        contractAddress,
        decimals: 18
      })
      break
  }
  return contract
}

function etherBatchRequest(web3: Web3, methods: any[]) {
  if (!methods.length) return []
  const batch = new web3.BatchRequest()
  const tasks = Promise.all(
    methods.map(
      method =>
        new Promise((resolve, reject) => {
          batch.add(
            method.call.request({}, function(error, result) {
              if (error) {
                console.error('Errror=', method, error)
                reject(error)
              } else {
                resolve(result)
              }
            })
          )
        })
    )
  )
  batch.execute()
  return tasks
}

export const blockchainHandler = {
  getChainConfig,
  getWeb3,
  idoContractFactory,
  etherBatchRequest
}
