import { execSync } from 'node:child_process';

/**
 * Run Cypress accessibility checks.
 * @param {string} [spec='tests/e2e/a11y.cy.ts'] test spec path
 * @param {(cmd: string) => Buffer} [execFn=execSync] execution helper
 * @returns {number} exit code
 */
export function runA11yChecks(
  spec = 'tests/e2e/a11y.cy.ts',
  execFn = execSync,
) {
  try {
    execFn(`npx cypress run --browser chrome --headless --spec ${spec}`, {
      stdio: 'inherit',
    });
    return 0;
  } catch {
    return 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(runA11yChecks());
}
