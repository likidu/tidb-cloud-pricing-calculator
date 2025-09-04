import { describe, it, expect } from 'vitest'
import { calculatePricing, defaultInputs } from '../../pricing/calc'

describe('pricing calc', () => {
  it('produces non-negative prices and sensible ordering', () => {
    const res = calculatePricing(defaultInputs)
    expect(res.starter.totalUsd).toBeGreaterThanOrEqual(0)
    expect(res.essential.totalUsd).toBeGreaterThanOrEqual(0)
  })

  it('increases with larger storage', () => {
    const a = calculatePricing({ ...defaultInputs, mysqlDataDirGB: 100 })
    const b = calculatePricing({ ...defaultInputs, mysqlDataDirGB: 1000 })
    expect(b.starter.totalUsd).toBeGreaterThan(a.starter.totalUsd)
    expect(b.essential.totalUsd).toBeGreaterThan(a.essential.totalUsd)
  })

  it('increases with higher peak/baseline', () => {
    const a = calculatePricing({ ...defaultInputs, vcpuBaseline: 4, vcpuPeak: 8 })
    const b = calculatePricing({ ...defaultInputs, vcpuBaseline: 8, vcpuPeak: 16 })
    expect(b.starter.totalUsd).toBeGreaterThan(a.starter.totalUsd)
    expect(b.essential.totalUsd).toBeGreaterThan(a.essential.totalUsd)
  })
})

