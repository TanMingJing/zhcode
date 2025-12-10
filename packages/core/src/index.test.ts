// @ts-ignore - vitest types not installed, but vitest will work at runtime
import { describe, it, expect } from 'vitest';
import { hello } from './index';

describe('WenCode Core', () => {
  it('should export hello function', () => {
    expect(hello()).toBe('Hello from WenCode Core!');
  });
});
