import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: [],
    pool: 'forks',
    isolate: true,
    watch: false,
    minThreads: 1,
    maxThreads: 1,
  },
})
