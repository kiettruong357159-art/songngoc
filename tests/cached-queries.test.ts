import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getCachedRoomTypeBySlug, getCachedActiveRoomTypes } from '@/lib/cached-queries';
import type { ActionResponse, PaginatedResponse } from '@/lib/types/api';

describe('Task 3: Envelopes, Type Safety & React.cache() Query Deduplication', () => {
  it('defines ActionResponse and PaginatedResponse in src/lib/types/api.ts', () => {
    const apiTypesPath = path.resolve(process.cwd(), 'src/lib/types/api.ts');
    expect(fs.existsSync(apiTypesPath)).toBe(true);

    const content = fs.readFileSync(apiTypesPath, 'utf-8');
    expect(content).toContain('export interface ActionResponse');
    expect(content).toContain('export interface PaginatedResponse');
    expect(content).toContain('totalPages: number');
    expect(content).toContain('hasNextPage: boolean');
  });

  it('provides getCachedRoomTypeBySlug and getCachedActiveRoomTypes in src/lib/cached-queries.ts', async () => {
    const cachedPath = path.resolve(process.cwd(), 'src/lib/cached-queries.ts');
    expect(fs.existsSync(cachedPath)).toBe(true);

    const content = fs.readFileSync(cachedPath, 'utf-8');
    expect(content).toContain("import { cache } from 'react'");
    expect(content).toContain('export const getCachedRoomTypeBySlug');
    expect(content).toContain('export const getCachedActiveRoomTypes');

    // Test calling the cached query
    const roomTypes = await getCachedActiveRoomTypes();
    expect(Array.isArray(roomTypes)).toBe(true);
    expect(roomTypes.length).toBeGreaterThan(0);

    const firstSlug = roomTypes[0].slug;
    const roomType = await getCachedRoomTypeBySlug(firstSlug);
    expect(roomType).toBeDefined();
    expect(roomType?.slug).toBe(firstSlug);
  });

  it('uses generateMetadata and getCachedRoomTypeBySlug in src/app/(public)/rooms/[slug]/page.tsx', () => {
    const pagePath = path.resolve(process.cwd(), 'src/app/(public)/rooms/[slug]/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    expect(content).toContain('generateMetadata');
    expect(content).toContain('getCachedRoomTypeBySlug');
  });
});
