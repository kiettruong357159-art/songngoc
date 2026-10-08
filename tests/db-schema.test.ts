import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Prisma Schema Definition', () => {
  it('schema.prisma contains all required models and indices', () => {
    const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
    const content = fs.readFileSync(schemaPath, 'utf-8');

    expect(content).toContain('model Role');
    expect(content).toContain('model User');
    expect(content).toContain('model Floor');
    expect(content).toContain('model RoomType');
    expect(content).toContain('model Room');
    expect(content).toContain('model Guest');
    expect(content).toContain('model Booking');
    expect(content).toContain('model Service');
    expect(content).toContain('model BookingService');
    expect(content).toContain('model Invoice');
  });
});
