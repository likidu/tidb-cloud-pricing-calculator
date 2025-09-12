import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select'
import { Switch } from './components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './components/ui/tooltip'
import { calculatePricing, defaultInputs, type PricingInputs } from './lib/pricing/calc'
import type { Plan } from './lib/pricing/model'
import { REGIONS, derivePrices, formatRegionLabel } from './lib/pricing/regions'
import { formatCurrency } from './lib/utils/format'
import { MIN_COMPRESSION_RATIO } from './lib/config'
import { ChevronDown } from 'lucide-react'

function NumberInput({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  disabled,
}: {
  label: ReactNode
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  max?: number
  disabled?: boolean
}) {
  return (
    <label className='flex flex-col gap-1'>
      <div className='text-sm text-gray-700'>{label}</div>
      <Input
        type='number'
        value={Number.isFinite(value) ? value : ('' as unknown as number)}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        readOnly={disabled}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
    </label>
  )
}

export default function App() {
  const [plan, setPlan] = useState<Plan>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('tidbcalc:prefs')
        if (raw) {
          const prefs = JSON.parse(raw) as Partial<{ plan: Plan }>
          if (prefs.plan === 'starter' || prefs.plan === 'essential') return prefs.plan
        }
      } catch {
        /* ignore */
      }
    }
    return 'starter'
  })
  const [inputs, setInputs] = useState<PricingInputs>(() => {
    // Load from localStorage if present
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('tidbcalc:prefs')
        if (raw) {
          const prefs = JSON.parse(raw) as Partial<
            Pick<
              PricingInputs,
              'migrationSource' | 'regionKey' | 'dualLayerEncryption'
            >
          >
          const base = { ...defaultInputs, ...prefs }
          // Set sensible default compression per source
          if (base.migrationSource === 'mysql') {
            base.compressionRatio = 1
          } else if (base.migrationSource === 'tidb71') {
            base.compressionRatio = 0.4
          }
          const prices = derivePrices(base.regionKey, base.dualLayerEncryption)
          return { ...base, ...prices }
        }
      } catch {
        return defaultInputs
      }
    }
    return defaultInputs
  })

  const result = useMemo(() => calculatePricing(inputs), [inputs])

  // Persist key preferences (including plan)
  useEffect(() => {
    try {
      localStorage.setItem(
        'tidbcalc:prefs',
        JSON.stringify({
          migrationSource: inputs.migrationSource,
          regionKey: inputs.regionKey,
          dualLayerEncryption: inputs.dualLayerEncryption,
          plan,
        })
      )
    } catch {
      /* ignore write errors */
    }
  }, [inputs.migrationSource, inputs.regionKey, inputs.dualLayerEncryption, plan])

  const isLogin =
    typeof window !== 'undefined' && window.location.pathname === '/login'

  if (isLogin) {
    return (
      <div className='min-h-screen grid place-items-center p-6'>
        <Card className='w-full max-w-sm'>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-3'>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className='mx-auto max-w-6xl p-6 space-y-6'>
        <div>
          <h1 className='text-2xl font-semibold'>
            TiDB Cloud Pricing Calculator
          </h1>
          <p className='text-sm text-gray-600'>
            Based on current RU model assumptions (by 9/4).
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          <div className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Migration Source</CardTitle>
              </CardHeader>
              <CardContent className='grid gap-4'>
                <Select
                  value={inputs.migrationSource}
                  onValueChange={v =>
                    setInputs(s => ({
                      ...s,
                      migrationSource: v as PricingInputs['migrationSource'],
                      // Force compression ratio to 1 for MySQL (RDS).
                      // For TiDB 7.1+, set default to 0.4 when switching to it.
                      compressionRatio:
                        (v as PricingInputs['migrationSource']) === 'mysql'
                          ? 1
                          : (s.migrationSource !== 'tidb71' &&
                              (v as PricingInputs['migrationSource']) === 'tidb71')
                            ? 0.4
                            : s.compressionRatio,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select migration source' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='mysql'>MySQL (RDS)</SelectItem>
                    <SelectItem value='tidb71'>TiDB 7.1+</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workload Inputs</CardTitle>
              </CardHeader>
              <CardContent className='grid gap-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-center'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-sm text-gray-700'>QPS pattern</span>
                    <Select
                      value={inputs.qpsPattern}
                      onValueChange={v =>
                        setInputs(s => ({
                          ...s,
                          qpsPattern: v as PricingInputs['qpsPattern'],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select QPS pattern' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='sine'>Sine-like</SelectItem>
                        <SelectItem value='flat'>Flat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                  label={
                    inputs.migrationSource === 'mysql'
                      ? 'MySQL data directory size (GB)'
                      : 'Storage Size (GB) on PD Dashboard'
                  }
                  value={inputs.mysqlDataDirGB}
                  min={0}
                  step={1}
                  onChange={v =>
                    setInputs(s => ({ ...s, mysqlDataDirGB: v || 0 }))
                  }
                />
                <NumberInput
                  label='Compression ratio (Compressed/Original)'
                  value={
                    inputs.migrationSource === 'mysql'
                      ? 1
                      : inputs.compressionRatio
                  }
                  min={MIN_COMPRESSION_RATIO}
                  max={1}
                  step={0.01}
                  disabled={inputs.migrationSource === 'mysql'}
                  onChange={v =>
                    setInputs(s => ({
                      ...s,
                      compressionRatio:
                        s.migrationSource === 'mysql'
                          ? 1
                          : Math.max(
                              MIN_COMPRESSION_RATIO,
                              Math.min(
                                1,
                                Number.isFinite(v) ? (v as number) : s.compressionRatio
                              )
                            ),
                    }))
                  }
                />
                {inputs.qpsPattern === 'sine' ? (
                  <div className='grid grid-cols-2 gap-4'>
                    <NumberInput
                      label='Baseline vCPU used'
                      value={inputs.vcpuBaseline}
                      min={0}
                      step={1}
                      onChange={v =>
                        setInputs(s => ({ ...s, vcpuBaseline: v || 0 }))
                      }
                    />
                    <NumberInput
                      label='Peak vCPU used'
                      value={inputs.vcpuPeak}
                      min={0}
                      step={1}
                      onChange={v =>
                        setInputs(s => ({ ...s, vcpuPeak: v || 0 }))
                      }
                    />
                  </div>
                ) : (
                  <NumberInput
                    label='Average vCPU used'
                    value={inputs.vcpuAverage ?? 0}
                    min={0}
                    step={1}
                    onChange={v =>
                      setInputs(s => ({ ...s, vcpuAverage: v || 0 }))
                    }
                  />
                )}
                <NumberInput
                  label={
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className='border-b border-dashed border-gray-400 cursor-help'>
                          RCU per vCPU
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        The faster the CPU or the higher the TPS, the higher
                        this parameter is.
                      </TooltipContent>
                    </Tooltip>
                  }
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>List Price</CardTitle>
              </CardHeader>
              <CardContent className='grid gap-4'>
                <div className='flex flex-col gap-1'>
                  <span className='text-sm text-gray-700'>
                    Cloud provider and region
                  </span>
                  <Select
                    value={inputs.regionKey}
                    onValueChange={key => {
                      const r = REGIONS.find(x => x.key === key) || REGIONS[0]
                      const storage = inputs.dualLayerEncryption
                        ? r.storagePriceEncrypted
                        : r.storagePrice
                      setInputs(s => ({
                        ...s,
                        regionKey: key,
                        storagePricePerGBMonth: storage,
                        millionRuPrice: r.millionRuPrice,
                        rcuPrice: r.rcuPrice,
                      }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select region' />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map(r => (
                        <SelectItem key={r.key} value={r.key}>
                          <span className='inline-flex items-center'>
                            <img
                              src={
                                r.provider === 'AWS'
                                  ? '/assets/aws-color.svg'
                                  : '/assets/alibabacloud-color.svg'
                              }
                              alt={r.provider}
                              className='h-4 w-4 mr-2'
                            />
                            {formatRegionLabel(r)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex flex-col'>
                    <span className='text-sm text-gray-700'>
                      Enable Dual-layer encryption
                    </span>
                  </div>
                  <Switch
                    checked={!!inputs.dualLayerEncryption}
                    onCheckedChange={checked => {
                      const r =
                        REGIONS.find(x => x.key === inputs.regionKey) ||
                        REGIONS[0]
                      const storage = checked
                        ? r.storagePriceEncrypted
                        : r.storagePrice
                      setInputs(s => ({
                        ...s,
                        dualLayerEncryption: !!checked,
                        storagePricePerGBMonth: storage,
                      }))
                    }}
                  />
                </div>
                <div className='h-px bg-gray-200' />
                <div className='grid gap-4'>
                  <Row
                    label='Row-based storage price ($ / GB-month)'
                    value={inputs.storagePricePerGBMonth}
                    money
                  />
                  {plan === 'starter' && (
                    <Row
                      label='Million RU price ($ / 1M RU)'
                      value={inputs.millionRuPrice}
                      money
                    />
                  )}
                  {plan === 'essential' && (
                    <Row
                      label='RCU price ($ / RCU-month)'
                      value={inputs.rcuPrice}
                      money
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-3'>
                  <button
                    type='button'
                    onClick={() => setPlan('starter')}
                    className={`text-left rounded-md border p-3 transition-colors focus:outline-none ${
                      plan === 'starter'
                        ? 'ring-1 ring-gray-900/30 shadow-sm bg-white'
                        : 'bg-gray-50 hover:bg-white'
                    }`}
                  >
                    <div className='font-semibold text-[#AA098F]'>Starter</div>
                    <div className='text-sm text-gray-600'>
                      Use for testing, prototyping, and hobby usage.
                    </div>
                  </button>
                  <button
                    type='button'
                    onClick={() => setPlan('essential')}
                    className={`text-left rounded-md border p-3 transition-colors focus:outline-none ${
                      plan === 'essential'
                        ? 'ring-1 ring-gray-900/30 shadow-sm bg-white'
                        : 'bg-gray-50 hover:bg-white'
                    }`}
                  >
                    <div className='font-semibold text-[#4A40BF]'>Essential</div>
                    <div className='text-sm text-gray-600'>
                      Perfect for personal and professional usage.
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {plan === 'starter' && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-[#AA098F]'>
                    Starter (Serverless)
                  </CardTitle>
                </CardHeader>
                <CardContent className='grid gap-2'>
                  <Row
                    label='Storage Price'
                    value={result.starter.storagePriceUsd}
                    money
                  />
                  <Row
                    label='Consumed RU (Million)'
                    value={result.starter.consumedRuMillion}
                  />
                  <Row
                    label='RU Price'
                    value={result.starter.ruPriceUsd}
                    money
                  />
                  <Row
                    label='Total'
                    value={result.starter.totalUsd}
                    money
                    highlight
                  />
                </CardContent>
              </Card>
            )}

            {plan === 'essential' && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-[#4A40BF]'>Essential</CardTitle>
                </CardHeader>
                <CardContent className='grid gap-2'>
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
                </CardContent>
              </Card>
            )}

            {/* Intermediate details below, foldable */}
            <IntermediateAccordion
              openByDefault={false}
              content={
                <>
                  <Row
                    label={
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className='border-b border-dashed border-gray-400 cursor-help'>
                            Metering Storage Size (GB)
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Original size of data in a single replica.
                        </TooltipContent>
                      </Tooltip>
                    }
                    value={inputs.mysqlDataDirGB / 3 / inputs.compressionRatio}
                  />
                  {inputs.qpsPattern === 'sine' ? (
                    <>
                      <Row label='Peak RCU' value={inputs.vcpuPeak * inputs.rcuPerVcpu} />
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
                    label={
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className='border-b border-dashed border-gray-400 cursor-help'>
                            Avg Consumed RCU
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          RCU used for final calculation based on QPS pattern.
                        </TooltipContent>
                      </Tooltip>
                    }
                    value={result.averaged.avgConsumedRcu}
                  />
                </>
              }
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

function LoginForm() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        window.location.href = '/'
      } else {
        setError('Incorrect password.')
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className='grid gap-3' onSubmit={onSubmit}>
      <label className='flex flex-col gap-1'>
        <span className='text-sm text-gray-700'>Password</span>
        <Input
          type='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder='Enter password'
          required
        />
      </label>
      {error && <div className='text-sm text-red-600'>{error}</div>}
      <Button type='submit' disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}

function IntermediateAccordion({
  openByDefault = false,
  content,
}: {
  openByDefault?: boolean
  content: React.ReactNode
}) {
  const [open, setOpen] = useState(!!openByDefault)
  return (
    <Card>
      <CardHeader>
        <button
          type='button'
          className='w-full flex items-center justify-between text-left'
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-controls='intermediate-content'
        >
          <CardTitle>Intermediate</CardTitle>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </CardHeader>
      {open && (
        <CardContent id='intermediate-content' className='grid gap-2'>
          {content}
        </CardContent>
      )}
    </Card>
  )
}

function Row({
  label,
  value,
  money,
  highlight,
}: {
  label: React.ReactNode
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
