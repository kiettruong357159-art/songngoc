import { describe, it, expect } from 'vitest';
import { generateVietQRUrl, DEFAULT_HOTEL_BANK } from '../src/lib/vietqr';

describe('VietQR Napas247 Generator', () => {
  it('generates valid VietQR image URL with encoded parameters', () => {
    const url = generateVietQRUrl({
      bankId: 'MBBank',
      accountNo: '0987654321',
      amount: 450000,
      bookingCode: 'BK-202610-1001',
      accountName: 'KHACH SAN SONG NGOC',
    });

    expect(url).toContain('https://img.vietqr.io/image/MBBank-0987654321-compact2.png');
    expect(url).toContain('amount=450000');
    expect(url).toContain('addInfo=BK-202610-1001');
    expect(url).toContain('accountName=KHACH%20SAN%20SONG%20NGOC');
  });

  it('uses default bank configuration if optional parameters are omitted', () => {
    const url = generateVietQRUrl({
      amount: 200000,
      bookingCode: 'INV-202610-001',
    });
    expect(url).toContain(DEFAULT_HOTEL_BANK.bankId);
    expect(url).toContain(DEFAULT_HOTEL_BANK.accountNo);
    expect(url).toContain('amount=200000');
  });

  it('rounds decimal or float amount to whole integer VNĐ without decimal points', () => {
    const url = generateVietQRUrl({
      amount: 199999.8,
      bookingCode: 'BK-TEST',
    });
    expect(url).toContain('amount=200000');
    expect(url).not.toContain('.8');
  });
});
