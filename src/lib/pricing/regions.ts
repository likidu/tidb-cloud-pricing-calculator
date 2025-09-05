export type Provider = 'AWS' | 'Alibaba Cloud'

export interface RegionPricing {
  key: string
  provider: Provider
  name: string
  code?: string
  millionRuPrice: number // $ / 1M RU
  rcuPrice: number // $ / RCU-month
  storagePrice: number // $ / GB-month
  storagePriceEncrypted: number // $ / GB-month
}

export const REGIONS: RegionPricing[] = [
  // AWS
  {
    key: 'aws-us-west-2',
    provider: 'AWS',
    name: 'Oregon',
    code: 'us-west-2',
    millionRuPrice: 0.1,
    rcuPrice: 0.2,
    storagePrice: 0.2,
    storagePriceEncrypted: 0.3,
  },
  {
    key: 'aws-us-east-1',
    provider: 'AWS',
    name: 'Virginia',
    code: 'us-east-1',
    millionRuPrice: 0.1,
    rcuPrice: 0.2,
    storagePrice: 0.2,
    storagePriceEncrypted: 0.3,
  },
  {
    key: 'aws-ap-southeast-1',
    provider: 'AWS',
    name: 'Singapore',
    code: 'ap-southeast-1',
    millionRuPrice: 0.12,
    rcuPrice: 0.24,
    storagePrice: 0.24,
    storagePriceEncrypted: 0.36,
  },
  {
    key: 'aws-ap-northeast-1',
    provider: 'AWS',
    name: 'Tokyo',
    code: 'ap-northeast-1',
    millionRuPrice: 0.12,
    rcuPrice: 0.28,
    storagePrice: 0.24,
    storagePriceEncrypted: 0.36,
  },
  // Alibaba Cloud
  {
    key: 'ali-jakarta',
    provider: 'Alibaba Cloud',
    name: 'Jakarta',
    code: 'ap-southeast-5',
    millionRuPrice: 0.14,
    rcuPrice: 0.27,
    storagePrice: 0.24,
    storagePriceEncrypted: 0.36,
  },
  {
    key: 'ali-mexico',
    provider: 'Alibaba Cloud',
    name: 'Mexico',
    // code not specified in docs
    millionRuPrice: 0.21,
    rcuPrice: 0.22,
    storagePrice: 0.24,
    storagePriceEncrypted: 0.36,
  },
  {
    key: 'ali-singapore',
    provider: 'Alibaba Cloud',
    name: 'Singapore',
    code: 'ap-southeast-1',
    millionRuPrice: 0.12,
    rcuPrice: 0.24,
    storagePrice: 0.24,
    storagePriceEncrypted: 0.36,
  },
  {
    key: 'ali-tokyo',
    provider: 'Alibaba Cloud',
    name: 'Tokyo',
    code: 'ap-northeast-1',
    millionRuPrice: 0.14,
    rcuPrice: 0.28,
    storagePrice: 0.24,
    storagePriceEncrypted: 0.36,
  },
]

export const DEFAULT_REGION_KEY = 'aws-us-west-2'

export function formatRegionLabel(r: RegionPricing) {
  return `${r.provider} - ${r.name}${r.code ? ` (${r.code})` : ''}`
}

export function getRegion(regionKey?: string): RegionPricing {
  return REGIONS.find(r => r.key === regionKey) ?? REGIONS[0]
}

export function derivePrices(regionKey?: string, dualLayerEncryption?: boolean) {
  const r = getRegion(regionKey)
  const storagePricePerGBMonth = dualLayerEncryption ? r.storagePriceEncrypted : r.storagePrice
  return {
    storagePricePerGBMonth,
    millionRuPrice: r.millionRuPrice,
    rcuPrice: r.rcuPrice,
  }
}
