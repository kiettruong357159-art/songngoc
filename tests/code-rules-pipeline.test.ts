import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { checkContent, checkDirectory } from '../scripts/verify-code-rules';

describe('Pipeline code rules', () => {
  it('phát hiện debugger, console.log, tiền tố _ và hàm rỗng', () => {
    const sample = [
      'debugger;',
      'console.log("x");',
      'items.map((_, i) => i);',
      'const noop = () => {};',
    ].join('\n');
    const rules = checkContent('sample.ts', sample).map((v) => v.rule);
    expect(rules).toHaveLength(4);
  });

  it('bỏ qua dòng comment', () => {
    expect(checkContent('sample.ts', '// console.log("x")')).toHaveLength(0);
  });

  it('toàn bộ src/ không có vi phạm', () => {
    expect(checkDirectory(path.join(process.cwd(), 'src'))).toEqual([]);
  });

  it('package.json có đủ script pipeline và tsconfig bật noUnused*', async () => {
    const pkg = (await import('../package.json')).default as { scripts: Record<string, string> };
    for (const key of ['check:rules', 'check:types', 'verify', 'pre-push', 'prepare:hooks']) {
      expect(pkg.scripts[key]).toBeTruthy();
    }
    const ts = (await import('../tsconfig.json')).default as { compilerOptions: Record<string, unknown> };
    expect(ts.compilerOptions.noUnusedLocals).toBe(true);
    expect(ts.compilerOptions.noUnusedParameters).toBe(true);
  });
});
