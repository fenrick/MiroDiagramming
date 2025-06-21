/** @jest-environment jsdom */
import { createRoot } from 'react-dom/client';

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({ render: jest.fn() })),
}));

test('mounts App on existing container', async () => {
  document.body.innerHTML = '<div id="root"></div>';
  await import('../src/app/app');
  expect(createRoot).toHaveBeenCalled();
});
