// Centralized configuration for pricing calculator constants
// Adjust these values to tune calculator behavior without touching core logic.
import type { MigrationSource, QpsPattern } from './pricing/model'

// Minimum allowed compression ratio (Compressed / Original)
// 0 is invalid (would imply infinite compression). Use a small positive floor.
export const MIN_COMPRESSION_RATIO = 0.1

// Recommended RCU per vCPU defaults per migration source.
export const RCU_PER_VCPU_DEFAULTS: Record<MigrationSource, number> = {
  mysql: 1000,
  tidb71: 3000,
}

// Default workload assumptions.
export const DEFAULT_MIGRATION_SOURCE: MigrationSource = 'mysql'
export const DEFAULT_QPS_PATTERN: QpsPattern = 'sine'
export const DEFAULT_MYSQL_DATA_DIR_GB = 500
export const DEFAULT_VCPU_BASELINE = 8
export const DEFAULT_VCPU_PEAK = 32
export const DEFAULT_VCPU_AVERAGE = 16
export const DEFAULT_BASELINE_WORKLOAD_PCT = 0.75

// Default pricing knobs.
export const DEFAULT_CALCULATOR_REGION_KEY = 'aws-ap-southeast-1'
export const DEFAULT_DUAL_LAYER_ENCRYPTION_ENABLED = false
export const DEFAULT_STORAGE_PRICE_PER_GB_MONTH = 0.24
export const DEFAULT_MILLION_RU_PRICE = 0.12
export const DEFAULT_RCU_PRICE = 0.24
