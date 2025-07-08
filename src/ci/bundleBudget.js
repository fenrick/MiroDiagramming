import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

/**
 * Check gzipped bundle size against a 300 KB budget.
 * @param {string} [dir='dist'] directory to check
 * @param {number} [limitKb=300] size limit in kilobytes
 * @param {(cmd: string) => Buffer} [execFn=execSync] exec function for tests
 * @returns {number} exit code
 */
export function bundleSize(
  dir = 'dist',
  limitKb = 300,
  execFn = execSync,
  existsFn = existsSync,
) {
  if (!existsFn(dir)) return 1;
  const out = String(execFn(`tar -czf - ${dir} | wc -c`)).trim();
  const size = Number(out);
  return Number.isNaN(size) || size > limitKb * 1024 ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const code = bundleSize();
  if (code) console.error('Bundle size exceeds 300 KB');
  else console.log('Bundle size within budget');
  process.exit(code);
}
