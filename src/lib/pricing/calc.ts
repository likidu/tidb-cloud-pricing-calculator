import type { PricingInputs, PricingResult } from './model'
import {
  DEFAULT_BASELINE_WORKLOAD_PCT,
  DEFAULT_DUAL_LAYER_ENCRYPTION_ENABLED,
  DEFAULT_MIGRATION_SOURCE,
  DEFAULT_MILLION_RU_PRICE,
  DEFAULT_MYSQL_DATA_DIR_GB,
  DEFAULT_QPS_PATTERN,
  DEFAULT_RCU_PRICE,
  DEFAULT_CALCULATOR_REGION_KEY,
  DEFAULT_STORAGE_PRICE_PER_GB_MONTH,
  DEFAULT_VCPU_AVERAGE,
  DEFAULT_VCPU_BASELINE,
  DEFAULT_VCPU_PEAK,
  MIN_COMPRESSION_RATIO,
  RCU_PER_VCPU_DEFAULTS,
} from '../config'

// defaults chosen as reasonable placeholders; adjust in UI
export const defaultInputs: PricingInputs = {
  migrationSource: DEFAULT_MIGRATION_SOURCE,
  qpsPattern: DEFAULT_QPS_PATTERN,
  regionKey: DEFAULT_CALCULATOR_REGION_KEY,
  dualLayerEncryption: DEFAULT_DUAL_LAYER_ENCRYPTION_ENABLED,
  mysqlDataDirGB: DEFAULT_MYSQL_DATA_DIR_GB, // GB
  compressionRatio: 1, // MySQL (RDS) defaults to no compression
  vcpuBaseline: DEFAULT_VCPU_BASELINE,
  vcpuPeak: DEFAULT_VCPU_PEAK,
  vcpuAverage: DEFAULT_VCPU_AVERAGE,
  rcuPerVcpu: RCU_PER_VCPU_DEFAULTS.mysql,
  baselineWorkloadPct: DEFAULT_BASELINE_WORKLOAD_PCT,

  storagePricePerGBMonth: DEFAULT_STORAGE_PRICE_PER_GB_MONTH,
  millionRuPrice: DEFAULT_MILLION_RU_PRICE,
  rcuPrice: DEFAULT_RCU_PRICE,
}

const SECONDS_PER_HOUR = 3600
const HOURS_PER_MONTH = 730
const TWO_OVER_PI = 2 / Math.PI

export function calculatePricing(input: PricingInputs): PricingResult {
  // If migration source is MySQL (RDS), compression is effectively disabled.
  const compression =
    input.migrationSource === 'mysql'
      ? 1
      : clamp(input.compressionRatio, MIN_COMPRESSION_RATIO, 1)
  const baselinePct = clamp(input.baselineWorkloadPct, 0, 1)

  const meteringStorageGB = safeMax(0, input.mysqlDataDirGB / 3 / compression)

  let avgConsumedRcu = 0
  if (input.qpsPattern === 'flat') {
    const avgVcpu = safeMax(0, input.vcpuAverage ?? 0)
    avgConsumedRcu = avgVcpu * input.rcuPerVcpu
  } else {
    const peakRCU = safeMax(0, input.vcpuPeak * input.rcuPerVcpu)
    const baselineRCU = safeMax(0, input.vcpuBaseline * input.rcuPerVcpu)
    const amplitude = safeMax(0, peakRCU - baselineRCU)
    // Use percentage of NON-baseline portion for the amplitude contribution.
    const nonBaselinePct = 1 - baselinePct
    avgConsumedRcu = baselineRCU + nonBaselinePct * amplitude * TWO_OVER_PI
  }

  // Starter (Serverless)
  const storagePriceStarter = meteringStorageGB * input.storagePricePerGBMonth
  const consumedRuTotal = avgConsumedRcu * SECONDS_PER_HOUR * HOURS_PER_MONTH
  const consumedRuMillion = consumedRuTotal / 1_000_000
  const ruPriceUsd = consumedRuMillion * input.millionRuPrice
  const starterTotal = storagePriceStarter + ruPriceUsd

  // Essential
  const provisionedRcu = Math.max(Math.ceil(avgConsumedRcu / 0.9), 2000)
  const storagePriceEssential = meteringStorageGB * input.storagePricePerGBMonth
  const provisionedRcuPriceUsd = provisionedRcu * input.rcuPrice
  const essentialTotal = storagePriceEssential + provisionedRcuPriceUsd

  return {
    averaged: {
      avgConsumedRcu,
    },
    starter: {
      storagePriceUsd: roundCents(storagePriceStarter),
      consumedRuMillion: round(consumedRuMillion, 4),
      ruPriceUsd: roundCents(ruPriceUsd),
      totalUsd: roundCents(starterTotal),
    },
    essential: {
      storagePriceUsd: roundCents(storagePriceEssential),
      provisionedRcu,
      provisionedRcuPriceUsd: roundCents(provisionedRcuPriceUsd),
      totalUsd: roundCents(essentialTotal),
    },
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function safeMax(a: number, b: number) {
  if (!Number.isFinite(a)) return b
  if (!Number.isFinite(b)) return a
  return Math.max(a, b)
}

function roundCents(n: number) {
  return Math.round(n * 100) / 100
}

function round(n: number, digits: number) {
  const f = 10 ** digits
  return Math.round(n * f) / f
}

export type { PricingInputs }
