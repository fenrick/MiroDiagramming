import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // Node environment project
  'vitest.config.node.ts',
  // jsdom environment project
  'vitest.config.jsdom.ts',
])
