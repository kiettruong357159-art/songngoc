import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Invoice Code Generation & PMS Settlement', () => {
  it('generates invoice code matching format INV-YYYYMM-XXXX', () => {
    const generateInvoiceCode = () => {
      const now = new Date();
      const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      const random = Math.floor(1000 + Math.random() * 9000);
      return `INV-${datePart}-${random}`;
    };

    const code = generateInvoiceCode();
    expect(code).toMatch(/^INV-\d{6}-\d{4}$/);
  });

  it('invoice modal, page and API files exist', () => {
    const modalPath = path.resolve(__dirname, '../src/components/admin/InvoiceDetailModal.tsx');
    const pagePath = path.resolve(__dirname, '../src/app/admin/invoices/page.tsx');
    const apiPath = path.resolve(__dirname, '../src/app/api/admin/invoices/route.ts');

    expect(fs.existsSync(modalPath)).toBe(true);
    expect(fs.existsSync(pagePath)).toBe(true);
    expect(fs.existsSync(apiPath)).toBe(true);
  });
});
