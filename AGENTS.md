# AGENTS.md — TiDB Cloud Pricing Calculator

Authoritative guide for contributors and AI agents working on this repository. It defines the tech stack, setup, conventions, pricing model, and a delivery roadmap for a cloud service pricing calculator built with Vite, TypeScript, React, pnpm, and shadcn/ui (Radix + Tailwind).

## Goals

- Deliver an accurate, transparent pricing calculator for TiDB Cloud–style services.
- Enable quick iteration with a modern, typed, component-driven UI.
- Keep the pricing logic isolated, testable, and documented.

## Tech Stack

- App: Vite + React + TypeScript
- Package manager: pnpm, use as much as pnpm instead of npm
- UI: Tailwind CSS + shadcn/ui (Radix Primitives)
- Forms & validation: react-hook-form + zod
- State: local component state first; lightweight store (Zustand) if needed
- Tests: Vitest + React Testing Library
- Formatting/Lint: Prettier + ESLint (typescript-eslint)

## Local Setup

Prerequisites:

- Node.js ≥ 22 (Active LTS)
- pnpm ≥ 9 (`npm i -g pnpm`)

Bootstrap (scaffold a new Vite React + TS app):

```bash
# If this repo is empty, initialize the app:
pnpm create vite@latest . -- --template react-ts
pnpm i

# Tailwind CSS
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui CLI (project-local)
pnpm dlx shadcn-ui@latest init

# Forms + validation, testing, and state (optional)
pnpm add react-hook-form zod
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
pnpm add zustand # only if shared state becomes necessary
```

Configure Tailwind (tailwind.config.js or .ts):

```ts
import { fontFamily } from 'tailwindcss/defaultTheme'
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config
```

Create `src/index.css` (or `src/styles/globals.css`) and import it in `src/main.tsx`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}
```

shadcn/ui usage:

```bash
# Initialize with defaults when prompted
pnpm dlx shadcn-ui@latest init

# Add components as needed, e.g. Button, Input, Select, Tabs, Slider
pnpm dlx shadcn-ui@latest add button input label select tabs slider card toggle-switch dialog dropdown-menu tooltip separator skeleton table accordion toast alert
```

Recommended `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest --environment jsdom",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier -w ."
  }
}
```

## Project Structure

```
src/
  components/
    ui/            # shadcn-generated components
    pricing/       # pricing-specific components
  features/
    calculator/    # pages, containers, hooks
  lib/
    pricing/       # core pricing engine (pure TS)
    utils/         # number/currency helpers, cn()
  routes/          # if using a router later
  app.tsx          # app shell
  main.tsx         # entry
index.html
```

Guiding principles:

- Keep the pricing engine framework-agnostic in `src/lib/pricing`.
- Components in `src/components/pricing` are dumb/presentational where possible.
- Feature containers handle user input, validation, and mapping to the pricing engine.

## Pricing Model

Please refer to the [ARCHITECTURE.md](./ARCHITECTURE.md) for the actual model.

Terminology:

- Product: A billable capability (e.g., compute vCPU hours, storage GB-month, backup GB-month, egress GB).
- Region: Multipliers or price tables per region/cloud (AWS/Alibaba Cloud, us-east-1, eu-west-1).
- Plan: Bundle-level modifiers (e.g., Starter vs. Essential).
- Discounts: Percentage or contract-based reductions applied after tiering.

Data shape (example, extend as needed):

```ts
export type Region = 'aws-us-east-1' | 'ali-ap-east1' | string

export interface ProductPricing {
  code: string // e.g., "storage"
  unit: string // e.g., "GB-month"
  regionOverrides?: Record<Region, { tiers?: Tier[]; multiplier?: number }>
}

export interface PlanModifier {
  code: string // e.g., "enterprise-support"
  percentUplift?: number // e.g., 0.1 for +10%
}

export interface Discount {
  percent: number
} // 0.0–1.0

export interface PricingInput {
  region: Region
  usage: Record<string, number> // product code -> quantity
  plan?: string // e.g., "starter", "essential"
  discount?: Discount
}
```

Calculation rules:

- Apply region overrides (tiers or multiplier) if present.
- Sum product subtotals; apply plan uplift; then apply discount.
- Round to cents at the end; keep internal math in integers (minor units) where possible.

Edge cases to handle:

- Quantities may be fractional (e.g., hours). Keep precision with decimals or minor units.
- Ensure monotonic tier boundaries (no overlaps/gaps). Validate on load.
- Guard against negative or NaN inputs.

## UI/UX Requirements

- Live estimate updates while changing inputs (no explicit submit).
- Sensible defaults and presets (e.g., common cluster sizes, storage, region).
- Clear breakdown by product and total; show effective rates.
- Region and plan selectors; discount input (percent).
- Support compare scenarios (A vs. B) in a later milestone.
- Accessible components (labels, roles, focus states, keyboard nav).

## State & Forms

- Prefer controlled components with react-hook-form for inputs.
- Use zod schemas to validate form/state.
- Lift minimal state to a feature container; consider Zustand only if shared across distant components.

## Currency, Numbers, i18n

- Use `Intl.NumberFormat` for currency and compact numbers. Centralize helpers in `src/lib/utils/format.ts`.
- Default currency: USD. Abstract currency so it can be swapped later.
- Stick to en-US locale initially; design for i18n readiness.

## Testing Strategy

- Unit tests for `src/lib/pricing` (tier math, edge cases).
- Component tests for calculator UI (inputs, outputs, a11y roles).
- Snapshot is okay for static rendering; prefer behavior assertions.

Examples:

```bash
pnpm test
pnpm test -t pricing # filter by name
```

## Performance & Quality

- Keep bundle lean; prefer tree-shakable libs.
- Avoid heavy charts initially; add lazily if needed.
- Run `pnpm lint` and `pnpm format` before PRs.

## Deployment

- Vercel/Netlify friendly. Static export via Vite is fine.
- Provide environment-agnostic builds; no server dependencies.

## Roadmap (Suggested)

1. Scaffold app (Vite + TS + Tailwind + shadcn/ui).
2. Implement core pricing engine with tests.
3. Build calculator UI (inputs, summary, breakdown).
4. Add presets and region/plan selectors.
5. Add discount handling and effective rate display.
6. Add scenario compare and shareable links.
7. Polish: a11y, keyboard nav, theming, docs.

## Component Checklist (shadcn/ui)

- Layout: card, separator, tabs, accordion
- Inputs: input, select, slider, checkbox, toggle, label
- Feedback: toast, tooltip, dialog, alert
- Data: table, skeleton

## Contribution Workflow

- Create small, focused PRs.
- Include tests for pricing logic changes.
- Keep UI changes accessible (run manual keyboard pass).
- Update this file if architectural decisions change.

## Agent Notes (You)

- When adding components, prefer `pnpm dlx shadcn-ui add <component>` to keep style consistency.
- Keep `src/lib/pricing` free of React/DOM imports for testability.
- If adding dependencies, prefer lightweight, tree-shakable packages; avoid network-bound code.

## Troubleshooting

- Missing styles: ensure Tailwind `content` includes `src/**/*.{ts,tsx}` and shadcn component paths.
- Classname merge: add a `cn` helper (clsx + tailwind-merge) if conflicts appear.
- JSDOM test errors: ensure `vitest` uses `jsdom` environment.

---

This document is source-of-truth for how we build and evolve the pricing calculator. Keep it current.
