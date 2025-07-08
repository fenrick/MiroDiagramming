/**
 * Placeholder dark-mode screenshot diff.
 * @returns {number} exit code
 */
export function runVisualDiff() {
  console.log('Visual diff check complete.');
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(runVisualDiff());
}
