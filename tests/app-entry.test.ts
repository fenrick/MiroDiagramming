/** @vitest-environment jsdom */
import { createRoot } from 'react-dom/client';

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render: vi.fn() })),
}));

test('mounts App on existing container', async () => {
  document.body.innerHTML = '<div id="root"></div>';
  await import('../src/app/App');
  expect(createRoot).toHaveBeenCalled();
});
