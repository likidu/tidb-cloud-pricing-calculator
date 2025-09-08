import type { PricingInputs, PricingResult } from './model'
import { MIN_COMPRESSION_RATIO } from '../config'

// defaults chosen as reasonable placeholders; adjust in UI
export const defaultInputs: PricingInputs = {
  migrationSource: 'mysql',
  qpsPattern: 'sine',
  regionKey: 'aws-ap-southeast-1',
  dualLayerEncryption: false,
  mysqlDataDirGB: 500, // GB
  compressionRatio: 1, // MySQL (RDS) defaults to no compression
  vcpuBaseline: 8,
  vcpuPeak: 32,
  vcpuAverage: 16,
  rcuPerVcpu: 3000, // RCU per vCPU
  baselineWorkloadPct: 0.75,

  storagePricePerGBMonth: 0.24,
  millionRuPrice: 0.12,
  rcuPrice: 0.24,
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
