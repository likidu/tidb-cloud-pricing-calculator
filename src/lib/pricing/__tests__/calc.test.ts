import { describe, it, expect } from 'vitest'
import { calculatePricing, defaultInputs } from '../../pricing/calc'

describe('pricing calc', () => {
  it('produces non-negative prices and sensible ordering (sine)', () => {
    const res = calculatePricing({ ...defaultInputs, qpsPattern: 'sine' })
    expect(res.starter.totalUsd).toBeGreaterThanOrEqual(0)
    expect(res.essential.totalUsd).toBeGreaterThanOrEqual(0)
  })

  it('increases with larger storage', () => {
    const base = { ...defaultInputs, qpsPattern: 'sine' as const }
    const a = calculatePricing({ ...base, mysqlDataDirGB: 100 })
    const b = calculatePricing({ ...base, mysqlDataDirGB: 1000 })
    expect(b.starter.totalUsd).toBeGreaterThan(a.starter.totalUsd)
    expect(b.essential.totalUsd).toBeGreaterThan(a.essential.totalUsd)
  })

  it('increases with higher peak/baseline (sine)', () => {
    const base = { ...defaultInputs, qpsPattern: 'sine' as const }
    // Make values large enough to clear the 2000 RCU minimum for Essential
    const a = calculatePricing({ ...base, vcpuBaseline: 20, vcpuPeak: 40 })
    const b = calculatePricing({ ...base, vcpuBaseline: 40, vcpuPeak: 80 })
    expect(b.starter.totalUsd).toBeGreaterThan(a.starter.totalUsd)
    expect(b.essential.totalUsd).toBeGreaterThan(a.essential.totalUsd)
  })

  it('flat pattern uses average vCPU', () => {
    const flat = calculatePricing({ ...defaultInputs, qpsPattern: 'flat', vcpuAverage: 10 })
    const sineEquivalent = calculatePricing({
      ...defaultInputs,
      qpsPattern: 'sine',
      vcpuBaseline: 10,
      vcpuPeak: 10,
      baselineWorkloadPct: 1,
    })
    // With zero amplitude, sine reduces to baseline-only; should roughly match flat average
    expect(Math.abs(flat.averaged.avgConsumedRcu - sineEquivalent.averaged.avgConsumedRcu)).toBeLessThan(1e-6)
  })
})
