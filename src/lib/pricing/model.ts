export type QpsPattern = 'sine' | 'flat'
export type MigrationSource = 'mysql' | 'tidb71'
export type RegionKey = string
export type Plan = 'starter' | 'essential'

export interface PricingInputs {
  migrationSource: MigrationSource
  qpsPattern: QpsPattern
  regionKey?: RegionKey
  dualLayerEncryption?: boolean
  mysqlDataDirGB: number
  compressionRatio: number // compressed/original (0-1]
  // For sine-like pattern
  vcpuBaseline: number
  vcpuPeak: number
  // For flat pattern
  vcpuAverage?: number
  rcuPerVcpu: number
  baselineWorkloadPct: number // 0-1

  storagePricePerGBMonth: number // $/GB-month
  millionRuPrice: number // $/1M RU
  rcuPrice: number // $/RCU-month
}

export interface StarterPricing {
  storagePriceUsd: number
  consumedRuMillion: number
  ruPriceUsd: number
  totalUsd: number
}

export interface EssentialPricing {
  storagePriceUsd: number
  provisionedRcu: number
  provisionedRcuPriceUsd: number
  totalUsd: number
}

export interface AveragedMetrics {
  avgConsumedRcu: number
}

export interface PricingResult {
  averaged: AveragedMetrics
  starter: StarterPricing
  essential: EssentialPricing
}
