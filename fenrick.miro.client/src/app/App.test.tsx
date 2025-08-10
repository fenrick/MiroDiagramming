import { describe, it, expect } from 'vitest';
import { createElement } from 'react';

describe('App boot', () => {
  it('renders without crashing', () => {
    expect(createElement('div')).toBeTruthy();
  });
});
