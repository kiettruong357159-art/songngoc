import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Task 1: Database Direct URL & Composite Indexes', () => {
  it('has directUrl configured in prisma/schema.prisma datasource', () => {
    const schemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma');
    const content = fs.readFileSync(schemaPath, 'utf-8');

    expect(content).toMatch(/datasource\s+db\s*\{[^}]*directUrl\s*=\s*env\("DIRECT_URL"\)[^}]*\}/s);
  });

  it('has composite indexes for Booking, Invoice, and Room models', () => {
    const schemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma');
    const content = fs.readFileSync(schemaPath, 'utf-8');

    // Booking composite indexes
    expect(content).toContain('@@index([status, createdAt])');
    expect(content).toContain('@@index([paymentStatus, createdAt])');

    // Invoice composite indexes
    expect(content).toContain('@@index([paymentMethod, createdAt])');

    // Room composite indexes
    expect(content).toContain('@@index([roomTypeId, status])');
    expect(content).toContain('@@index([floorId, status])');
  });

  it('has DIRECT_URL configured in .env and .env.example', () => {
    const envPath = path.resolve(process.cwd(), '.env');
    const envExamplePath = path.resolve(process.cwd(), '.env.example');

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envExampleContent = fs.readFileSync(envExamplePath, 'utf-8');

    expect(envContent).toContain('DIRECT_URL=');
    expect(envExampleContent).toContain('DIRECT_URL=');
  });
});
