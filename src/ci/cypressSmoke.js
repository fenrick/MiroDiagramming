import { execSync } from 'node:child_process';

/**
 * Run Cypress smoke tests.
 * @param {string} [spec='tests/e2e/smoke.cy.ts'] pattern for spec file
 * @param {(cmd: string) => Buffer} [execFn=execSync] execution function
 * @returns {number} exit code
 */
export function runCypressSmoke(
  spec = 'tests/e2e/smoke.cy.ts',
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
  process.exit(runCypressSmoke());
}
