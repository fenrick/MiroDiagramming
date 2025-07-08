import { bundleSize } from '../src/ci/bundleBudget.js';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';

const dummy = () => '1024';

test('returns 1 when directory missing', () => {
  expect(bundleSize('missing', 300, dummy)).toBe(1);
});

test('passes when under limit', () => {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'bundle-'));
  fs.writeFileSync(path.join(dir, 'a.js'), 'x');
  expect(bundleSize(dir, 300, dummy)).toBe(0);
  fs.rmSync(dir, { recursive: true, force: true });
});
