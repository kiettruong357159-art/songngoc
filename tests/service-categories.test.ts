import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  CreateServiceCategorySchema,
  UpdateServiceCategorySchema,
} from '../src/lib/validation/schemas';
import {
  getDefaultServiceCategories,
  isDefaultServiceCategoryId,
} from '../src/lib/service-categories';

describe('Service categories management', () => {
  it('Create schema normalizes code to uppercase and applies defaults', () => {
    const parsed = CreateServiceCategorySchema.parse({ code: ' spa_01 ', name: ' Spa ' });
    expect(parsed.code).toBe('SPA_01');
    expect(parsed.name).toBe('Spa');
    expect(parsed.icon).toBe('tag');
    expect(parsed.isActive).toBe(true);
  });

  it('Create schema rejects invalid code, empty name and unknown icon', () => {
    expect(CreateServiceCategorySchema.safeParse({ code: 'A', name: 'x' }).success).toBe(false);
    expect(CreateServiceCategorySchema.safeParse({ code: 'co dau', name: 'x' }).success).toBe(false);
    expect(CreateServiceCategorySchema.safeParse({ code: 'SPA', name: '  ' }).success).toBe(false);
    expect(CreateServiceCategorySchema.safeParse({ code: 'SPA', name: 'Spa', icon: 'rocket' }).success).toBe(false);
  });

  it('Update schema requires id and does not accept code changes', () => {
    expect(UpdateServiceCategorySchema.safeParse({ name: 'x' }).success).toBe(false);
    const parsed = UpdateServiceCategorySchema.parse({ id: 'abc', name: 'Tên mới', code: 'NEW' });
    expect('code' in parsed).toBe(false);
  });

  it('Default categories match the 4 legacy codes and are flagged as default', () => {
    const defaults = getDefaultServiceCategories();
    expect(defaults.map((c) => c.code)).toEqual(['MINIBAR', 'LAUNDRY', 'FOOD', 'TRANSPORT']);
    expect(defaults.every((c) => isDefaultServiceCategoryId(c.id))).toBe(true);
  });

  it('API route, manager component and SQL file exist and API checks permissions', () => {
    const routePath = path.resolve(__dirname, '../src/app/api/admin/service-categories/route.ts');
    expect(fs.existsSync(routePath)).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/components/admin/ServiceCategoryManager.tsx'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../prisma/sql/service-categories.sql'))).toBe(true);

    const routeSource = fs.readFileSync(routePath, 'utf-8');
    expect(routeSource).toContain("'services:view'");
    expect(routeSource.match(/'services:manage'/g)?.length).toBe(3);
  });
});
