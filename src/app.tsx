import { useMemo, useState } from 'react'
import {
  calculatePricing,
  defaultInputs,
  type PricingInputs,
} from './lib/pricing/calc'
import { formatCurrency } from './lib/utils/format'

function NumberInput({
  label,
  value,
  onChange,
  step = 1,
  min,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
}) {
  return (
    <label className='flex flex-col gap-1'>
      <span className='text-sm text-gray-700'>{label}</span>
      <input
        type='number'
        className='border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring'
        value={Number.isFinite(value) ? value : ''}
        step={step}
        min={min}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
    </label>
  )
}

export default function App() {
  const [inputs, setInputs] = useState<PricingInputs>(defaultInputs)

  const result = useMemo(() => calculatePricing(inputs), [inputs])

  return (
    <div className='mx-auto max-w-6xl p-6 grid gap-6 md:grid-cols-2'>
      <div className='space-y-4'>
        <h1 className='text-2xl font-semibold'>
          TiDB Cloud Pricing Calculator
        </h1>
        <p className='text-sm text-gray-600'>
          Based on current RU model assumptions (see ARCHITECTURE.md).
        </p>

        <div className='grid gap-4 bg-white rounded border p-4'>
          <h2 className='font-medium'>Workload Inputs</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-center'>
            <label className='flex flex-col gap-1'>
              <span className='text-sm text-gray-700'>QPS pattern</span>
              <select
                className='border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring'
                value={inputs.qpsPattern}
                onChange={e =>
                  setInputs(s => ({
                    ...s,
                    qpsPattern: e.target.value as PricingInputs['qpsPattern'],
                  }))
                }
              >
                <option value='sine'>Sine-like</option>
                <option value='flat'>Flat</option>
              </select>
            </label>
            <div className='justify-self-end'>
              <img
                src={
                  inputs.qpsPattern === 'sine'
                    ? '/assets/qps_sine.svg'
                    : '/assets/qps_flat.svg'
                }
                alt={
                  inputs.qpsPattern === 'sine'
                    ? 'Sine-like QPS pattern'
                    : 'Flat QPS pattern'
                }
                className='max-h-24 object-contain ml-auto'
              />
            </div>
          </div>
          <NumberInput
            label='MySQL data directory size (GB)'
            value={inputs.mysqlDataDirGB}
            min={0}
            step={1}
            onChange={v => setInputs(s => ({ ...s, mysqlDataDirGB: v || 0 }))}
          />
          <NumberInput
            label='Compression ratio (Compressed/Original)'
            value={inputs.compressionRatio}
            min={0.01}
            step={0.01}
            onChange={v => setInputs(s => ({ ...s, compressionRatio: v || 0 }))}
          />
          {inputs.qpsPattern === 'sine' ? (
            <div className='grid grid-cols-2 gap-4'>
              <NumberInput
                label='Baseline vCPU used'
                value={inputs.vcpuBaseline}
                min={0}
                step={1}
                onChange={v => setInputs(s => ({ ...s, vcpuBaseline: v || 0 }))}
              />
              <NumberInput
                label='Peak vCPU used'
                value={inputs.vcpuPeak}
                min={0}
                step={1}
                onChange={v => setInputs(s => ({ ...s, vcpuPeak: v || 0 }))}
              />
            </div>
          ) : (
            <NumberInput
              label='Average vCPU used'
              value={inputs.vcpuAverage ?? 0}
              min={0}
              step={1}
              onChange={v => setInputs(s => ({ ...s, vcpuAverage: v || 0 }))}
            />
          )}
          <NumberInput
            label='RCU per vCPU'
            value={inputs.rcuPerVcpu}
            min={0}
            step={1}
            onChange={v => setInputs(s => ({ ...s, rcuPerVcpu: v || 0 }))}
          />
          {inputs.qpsPattern === 'sine' && (
            <NumberInput
              label='Baseline workload percentage (0–1)'
              value={inputs.baselineWorkloadPct}
              min={0}
              step={0.01}
              onChange={v =>
                setInputs(s => ({
                  ...s,
                  baselineWorkloadPct: Math.max(0, Math.min(1, v || 0)),
                }))
              }
            />
          )}
        </div>

        <div className='grid gap-4 bg-white rounded border p-4'>
          <h2 className='font-medium'>Pricing (List)</h2>
          <NumberInput
            label='Row-based storage price ($ / GB-month)'
            value={inputs.storagePricePerGBMonth}
            min={0}
            step={0.01}
            onChange={v =>
              setInputs(s => ({ ...s, storagePricePerGBMonth: v || 0 }))
            }
          />
          <div className='grid grid-cols-2 gap-4'>
            <NumberInput
              label='Million RU price ($ / 1M RU)'
              value={inputs.millionRuPrice}
              min={0}
              step={0.01}
              onChange={v => setInputs(s => ({ ...s, millionRuPrice: v || 0 }))}
            />
            <NumberInput
              label='RCU price ($ / RCU-month)'
              value={inputs.rcuPrice}
              min={0}
              step={0.01}
              onChange={v => setInputs(s => ({ ...s, rcuPrice: v || 0 }))}
            />
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <div className='grid gap-2 bg-white rounded border p-4'>
          <h2 className='font-medium'>Intermediate</h2>
          <Row
            label='Metering Storage Size (GB)'
            value={inputs.mysqlDataDirGB / 3 / inputs.compressionRatio}
          />
          {inputs.qpsPattern === 'sine' ? (
            <>
              <Row
                label='Peak RCU'
                value={inputs.vcpuPeak * inputs.rcuPerVcpu}
              />
              <Row
                label='Baseline RCU'
                value={inputs.vcpuBaseline * inputs.rcuPerVcpu}
              />
              <Row
                label='Amplitude'
                value={Math.max(
                  0,
                  (inputs.vcpuPeak - inputs.vcpuBaseline) * inputs.rcuPerVcpu
                )}
              />
            </>
          ) : (
            <Row
              label='Average RCU'
              value={(inputs.vcpuAverage ?? 0) * inputs.rcuPerVcpu}
            />
          )}
          <Row
            label='Avg Consumed RCU'
            value={result.averaged.avgConsumedRcu}
          />
        </div>

        <div className='grid gap-2 bg-white rounded border p-4'>
          <h2 className='font-medium'>Starter (Serverless)</h2>
          <Row
            label='Storage Price'
            value={result.starter.storagePriceUsd}
            money
          />
          <Row
            label='Consumed RU (Million)'
            value={result.starter.consumedRuMillion}
          />
          <Row label='RU Price' value={result.starter.ruPriceUsd} money />
          <Row label='Total' value={result.starter.totalUsd} money highlight />
        </div>

        <div className='grid gap-2 bg-white rounded border p-4'>
          <h2 className='font-medium'>Essential</h2>
          <Row
            label='Storage Price'
            value={result.essential.storagePriceUsd}
            money
          />
          <Row
            label='Provisioned RCU'
            value={result.essential.provisionedRcu}
          />
          <Row
            label='Provisioned RCU Price'
            value={result.essential.provisionedRcuPriceUsd}
            money
          />
          <Row
            label='Total'
            value={result.essential.totalUsd}
            money
            highlight
          />
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  money,
  highlight,
}: {
  label: string
  value: number
  money?: boolean
  highlight?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between ${highlight ? 'font-semibold' : ''}`}
    >
      <span className='text-gray-700'>{label}</span>
      <span>
        {money
          ? formatCurrency(value)
          : Number.isFinite(value)
            ? value.toLocaleString()
            : '-'}
      </span>
    </div>
  )
}
