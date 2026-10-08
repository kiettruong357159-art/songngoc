// Song Ngọc VietQR Napas247 Dynamic Generator
import { DEFAULT_HOTEL_BANK } from './constants';

export { DEFAULT_HOTEL_BANK };

export interface VietQROptions {
  bankId?: string;
  accountNo?: string;
  accountName?: string;
  amount: number;
  bookingCode: string;
}

/**
 * Sinh URL mã QR động chuẩn VietQR Napas247
 * Định dạng: https://img.vietqr.io/image/{bankId}-{accountNo}-compact2.png?amount={amount}&addInfo={bookingCode}&accountName={accountName}
 */
export function generateVietQRUrl(options: VietQROptions): string {
  const bankId = options.bankId || DEFAULT_HOTEL_BANK.bankId;
  const accountNo = options.accountNo || DEFAULT_HOTEL_BANK.accountNo;
  const accountName = options.accountName || DEFAULT_HOTEL_BANK.accountName;

  // Làm tròn số tiền thành số nguyên VNĐ dương
  const safeAmount = Math.max(0, Math.round(options.amount));

  const encodedBank = encodeURIComponent(bankId);
  const encodedAccountNo = encodeURIComponent(accountNo);
  const encodedInfo = encodeURIComponent(options.bookingCode);
  const encodedName = encodeURIComponent(accountName);

  return `https://img.vietqr.io/image/${encodedBank}-${encodedAccountNo}-compact2.png?amount=${safeAmount}&addInfo=${encodedInfo}&accountName=${encodedName}`;
}
