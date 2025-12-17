import { describe, it, expect } from 'vitest';
import { hello } from './index';

describe('ZhCode Core', () => {
  it('should export hello function', () => {
    expect(hello()).toBe('Hello from ZhCode Core!');
  });
});
