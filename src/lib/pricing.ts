// Song Ngọc Homestay Pricing Calculations & Formulas
import { formatVND } from './utils';

export { formatVND };

export interface BookingPricingParams {
  basePrice: number;
  nights: number;
  weekendPrice?: number | null;
  weekendNights?: number;
}

export interface BookingPricingResult {
  nights: number;
  regularNights: number;
  weekendNights: number;
  totalRoomAmount: number;
}

export interface InvoiceSettlementParams {
  roomCharge: number;
  serviceCharge: number;
  surcharge?: number;
  surchargeReason?: string | null;
  discount?: number;
  depositDeducted?: number;
}

export interface InvoiceSettlementResult {
  grossTotal: number;
  finalAmount: number;
  refundAmount: number;
  depositDeducted: number;
}

/**
 * Tính số đêm giữa ngày nhận và trả phòng (tối thiểu 1 đêm) — DST-safe: dùng calendar days.
 */
export function calculateNights(checkIn: Date | string, checkOut: Date | string): number {
  const dIn = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const dOut = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
  if (isNaN(dIn.getTime()) || isNaN(dOut.getTime())) return 1;
  // Normalize to local calendar day (UTC-normalized via date-fns style diff would ideal; fallback ceil)
  const start = new Date(dIn.getFullYear(), dIn.getMonth(), dIn.getDate());
  const end = new Date(dOut.getFullYear(), dOut.getMonth(), dOut.getDate());
  const diffMs = end.getTime() - start.getTime();
  const rawNights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, rawNights);
}

/**
 * Công thức tính tổng tiền phòng dự kiến theo số đêm ngày thường và cuối tuần:
 * Tổng tiền phòng = (Số đêm thường x Giá thường) + (Số đêm cuối tuần x Giá cuối tuần)
 */
export function calculateBookingPricing(params: BookingPricingParams): BookingPricingResult {
  const nights = Math.max(1, params.nights);
  const weekendNights = Math.min(nights, Math.max(0, params.weekendNights || 0));
  const regularNights = Math.max(0, nights - weekendNights);

  const regularRate = params.basePrice;
  const weekendRate = params.weekendPrice ?? params.basePrice;

  const totalRoomAmount = regularNights * regularRate + weekendNights * weekendRate;

  return {
    nights,
    regularNights,
    weekendNights,
    totalRoomAmount,
  };
}

/**
 * Công thức thanh toán chốt hóa đơn tại quầy:
 * Tổng thanh toán = Tiền phòng + Tiền dịch vụ + Phụ thu - Giảm giá - Tiền cọc đã trả
 */
export function calculateInvoiceSettlement(params: InvoiceSettlementParams): InvoiceSettlementResult {
  const roomCharge = Math.max(0, params.roomCharge);
  const serviceCharge = Math.max(0, params.serviceCharge);
  const surcharge = Math.max(0, params.surcharge || 0);
  const discount = Math.max(0, params.discount || 0);
  const depositDeducted = Math.max(0, params.depositDeducted || 0);

  const grossTotal = roomCharge + serviceCharge + surcharge - discount;
  const finalAmount = Math.max(0, grossTotal - depositDeducted);
  const refundAmount = depositDeducted > grossTotal ? depositDeducted - grossTotal : 0;

  return {
    grossTotal,
    finalAmount,
    refundAmount,
    depositDeducted,
  };
}
