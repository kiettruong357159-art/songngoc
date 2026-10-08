import { describe, it, expect } from 'vitest';

describe('Project Scaffolding', () => {
  it('should run tests successfully with Vitest', () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(1, 2)).toBe(3);
  });
});
