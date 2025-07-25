import fs from 'fs/promises';
import path from 'path';

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node absoluteLcov.mjs <lcov-file>');
    process.exit(1);
  }
  const root = process.cwd();
  const content = await fs.readFile(file, 'utf8');
  const converted = content.replace(/^SF:(?!\/)(.*)$/gm, (_, p) => `SF:${path.resolve(root, p)}`);
  await fs.writeFile(file, converted);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

