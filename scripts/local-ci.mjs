#!/usr/bin/env node
import { execSync } from 'node:child_process';

const steps = [
  'corepack enable',
  'npm install',
  'npm audit --omit=dev --audit-level=moderate',
  'npm run prettier:check',
  'npm run lint',
  'npm run stylelint',
  'npm run typecheck',
  'npm test',
  'npm run build',
  'npm run build-storybook',
];

for (const step of steps) {
  console.log(`\n-- ${step} --`);
  try {
    execSync(step, { stdio: 'inherit' });
  } catch (err) {
    console.error(`\nStep failed: ${step}`);
    process.exitCode = 1;
    break;
  }
}
