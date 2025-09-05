import { describe, it, expect } from 'vitest'
import { REGIONS, formatRegionLabel, derivePrices } from '../../pricing/regions'

describe('regions pricing mapping', () => {
  it('formatRegionLabel includes provider and code when present', () => {
    const aws = REGIONS.find(r => r.provider === 'AWS' && r.code)!
    const label = formatRegionLabel(aws)
    expect(label).toContain('AWS -')
    expect(label).toContain(`(${aws.code})`)
  })

  it('maps region to RU and RCU prices', () => {
    const aliJakarta = REGIONS.find(r => r.key.includes('ali-jakarta'))!
    const derived = derivePrices(aliJakarta.key, false)
    expect(derived.millionRuPrice).toBeCloseTo(aliJakarta.millionRuPrice)
    expect(derived.rcuPrice).toBeCloseTo(aliJakarta.rcuPrice)
    expect(derived.storagePricePerGBMonth).toBeCloseTo(aliJakarta.storagePrice)
  })

  it('toggles storage price with dual-layer encryption', () => {
    const awsTokyo = REGIONS.find(r => r.key.includes('aws-ap-northeast-1'))!
    const plain = derivePrices(awsTokyo.key, false)
    const enc = derivePrices(awsTokyo.key, true)
    expect(enc.storagePricePerGBMonth).toBeGreaterThan(plain.storagePricePerGBMonth)
    expect(enc.storagePricePerGBMonth).toBeCloseTo(awsTokyo.storagePriceEncrypted)
  })
})

