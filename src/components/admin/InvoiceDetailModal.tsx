'use client';

import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  CheckCircle,
  Receipt
} from 'lucide-react';
import { formatVND, formatDateVN } from '@/lib/utils';
import { calculateInvoiceSettlement } from '@/lib/pricing';
import { generateVietQRUrl, DEFAULT_HOTEL_BANK } from '@/lib/vietqr';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import { useToast } from '@/context/ToastContext';

interface BookingServiceItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  service: {
    name: string;
    unit: string;
  };
}

export interface BookingForInvoice {
  id: string;
  bookingCode: string;
  checkIn: string;
  checkOut: string;
  totalRoomAmount: number;
  depositAmount: number;
  guest: {
    fullName: string;
    phone: string;
    idCard?: string | null;
  };
  roomType: {
    name: string;
  };
  room?: {
    roomNumber: string;
    floor?: {
      name: string;
    };
  } | null;
  services?: BookingServiceItem[];
}

export interface InvoiceRecord {
  id: string;
  invoiceCode: string;
  createdAt: string;
  roomCharge: number;
  serviceCharge: number;
  surcharge: number;
  surchargeReason?: string | null;
  discount: number;
  depositDeducted: number;
  finalAmount: number;
  paymentMethod: string;
  paidAt?: string | null;
  notes?: string | null;
  createdBy?: {
    name: string;
    username: string;
  } | null;
  booking: BookingForInvoice;
}

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Hoặc truyền invoice đã lưu (để xem/in)
  invoice?: InvoiceRecord | null;
  // Hoặc truyền booking đang lưu trú (để lập hóa đơn và check-out)
  booking?: BookingForInvoice | null;
  onSettlementSuccess?: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoice,
  booking,
  onSettlementSuccess,
}) => {
  const { showToast } = useToast();

  const [surcharge, setSurcharge] = useState<number>(0);
  const [surchargeReason, setSurchargeReason] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'VIETQR' | 'CARD'>('CASH');
  const [notes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeBooking = invoice ? invoice.booking : booking;

  // Tính toán phí dịch vụ phòng
  const serviceCharge = useMemo(() => {
    if (invoice) return invoice.serviceCharge;
    return activeBooking?.services?.reduce((sum, s) => sum + s.totalPrice, 0) || 0;
  }, [invoice, activeBooking]);

  const roomCharge = useMemo(() => {
    if (invoice) return invoice.roomCharge;
    return activeBooking?.totalRoomAmount || 0;
  }, [invoice, activeBooking]);

  const depositDeducted = useMemo(() => {
    if (invoice) return invoice.depositDeducted;
    return activeBooking?.depositAmount || 0;
  }, [invoice, activeBooking]);

  // Settlement calculations
  const settlement = useMemo(() => {
    if (invoice) {
      return {
        grossTotal: invoice.roomCharge + invoice.serviceCharge + invoice.surcharge - invoice.discount,
        finalAmount: invoice.finalAmount,
        refundAmount: 0,
      };
    }
    return calculateInvoiceSettlement({
      roomCharge,
      serviceCharge,
      surcharge,
      surchargeReason,
      discount,
      depositDeducted,
    });
  }, [invoice, roomCharge, serviceCharge, surcharge, surchargeReason, discount, depositDeducted]);

  // VietQR link if QR payment is active
  const qrUrl = useMemo(() => {
    if (!activeBooking || settlement.finalAmount <= 0) return '';
    return generateVietQRUrl({
      amount: settlement.finalAmount,
      bookingCode: activeBooking.bookingCode,
    });
  }, [activeBooking, settlement.finalAmount]);

  if (!isOpen || !activeBooking) return null;

  const handleCheckoutAndPay = async () => {
    if (!booking) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          surcharge: Number(surcharge),
          surchargeReason: surchargeReason.trim() || undefined,
          discount: Number(discount),
          paymentMethod,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.invoice) {
        showToast(`Trả phòng thành công! Đã lập hóa đơn ${data.invoice.invoiceCode}`, 'success');
        if (onSettlementSuccess) onSettlementSuccess();
        onClose();
      } else {
        showToast(data.error || 'Quy trình thanh toán thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi gửi yêu cầu thanh toán', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const paymentOptions: SelectOption[] = [
    { value: 'CASH', label: '💵 Tiền mặt tại quầy' },
    { value: 'VIETQR', label: '📱 Chuyển khoản VietQR Napas247' },
    { value: 'CARD', label: '💳 Quẹt thẻ ngân hàng POS' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Receipt size={22} style={{ color: 'var(--color-primary)' }} />
          <span>
            {invoice ? `Hóa Đơn ${invoice.invoiceCode}` : `Thanh Toán & Trả Phòng - ${activeBooking.bookingCode}`}
          </span>
        </div>
      }
      maxWidth="680px"
    >
      <div id="printable-invoice" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Guest & Room Summary */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            fontSize: '0.875rem',
          }}
        >
          <div>
            <div><strong>Khách hàng:</strong> {activeBooking.guest.fullName}</div>
            <div style={{ color: 'var(--color-text-muted)' }}>SĐT: {activeBooking.guest.phone}</div>
            {activeBooking.guest.idCard && (
              <div style={{ color: 'var(--color-text-muted)' }}>CCCD: {activeBooking.guest.idCard}</div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              {activeBooking.room ? `Phòng ${activeBooking.room.roomNumber}` : 'Chưa gán'}
            </div>
            <div style={{ color: 'var(--color-text-muted)' }}>{activeBooking.roomType.name}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              {formatDateVN(activeBooking.checkIn)} → {formatDateVN(activeBooking.checkOut)}
            </div>
          </div>
        </div>

        {/* Bill Breakdown Table */}
        <div
          style={{
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                <th style={{ textAlign: 'left', padding: '0.625rem 0.875rem' }}>Khoản mục chi phí</th>
                <th style={{ textAlign: 'center', padding: '0.625rem 0.875rem' }}>SL</th>
                <th style={{ textAlign: 'right', padding: '0.625rem 0.875rem' }}>Đơn giá</th>
                <th style={{ textAlign: 'right', padding: '0.625rem 0.875rem' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {/* Room Charge */}
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.625rem 0.875rem', fontWeight: 600 }}>
                  Tiền phòng lưu trú ({activeBooking.roomType.name})
                </td>
                <td style={{ textAlign: 'center', padding: '0.625rem 0.875rem' }}>1</td>
                <td style={{ textAlign: 'right', padding: '0.625rem 0.875rem' }}>{formatVND(roomCharge)}</td>
                <td style={{ textAlign: 'right', padding: '0.625rem 0.875rem', fontWeight: 600 }}>
                  {formatVND(roomCharge)}
                </td>
              </tr>

              {/* Minibar & Services */}
              {activeBooking.services && activeBooking.services.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.625rem 0.875rem', color: 'var(--color-text)' }}>
                    • {item.service.name}
                  </td>
                  <td style={{ textAlign: 'center', padding: '0.625rem 0.875rem' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', padding: '0.625rem 0.875rem' }}>{formatVND(item.unitPrice)}</td>
                  <td style={{ textAlign: 'right', padding: '0.625rem 0.875rem' }}>{formatVND(item.totalPrice)}</td>
                </tr>
              ))}

              {/* Subtotal of Services if any */}
              {serviceCharge > 0 && (
                <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--color-border)' }}>
                  <td colSpan={3} style={{ padding: '0.5rem 0.875rem', textAlign: 'right', fontWeight: 600 }}>
                    Tổng tiền dịch vụ & minibar:
                  </td>
                  <td style={{ padding: '0.5rem 0.875rem', textAlign: 'right', fontWeight: 600 }}>
                    {formatVND(serviceCharge)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Adjustments: Surcharges & Discounts (Inputs in Settlement Mode, Text in View Mode) */}
        {!invoice ? (
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              PHỤ PHÍ VÀ CHIẾT KHẤU TẠI QUẦY
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Phụ thu (VNĐ)
                </label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={surcharge}
                  onChange={(e) => setSurcharge(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Lý do phụ thu
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trả phòng muộn 2h..."
                  value={surchargeReason}
                  onChange={(e) => setSurchargeReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Giảm giá / Ưu đãi (VNĐ)
                </label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Phương thức thanh toán
                </label>
                <CustomSelect
                  options={paymentOptions}
                  value={paymentMethod}
                  onChange={(val) => setPaymentMethod(val as any)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg)',
              fontSize: '0.8125rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            {invoice.surcharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Phụ thu ({invoice.surchargeReason || 'Khác'}):</span>
                <span>+{formatVND(invoice.surcharge)}</span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                <span>Giảm giá:</span>
                <span>-{formatVND(invoice.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Hình thức thanh toán:</span>
              <span>{invoice.paymentMethod === 'VIETQR' ? 'VietQR Napas247' : invoice.paymentMethod === 'CARD' ? 'Thẻ POS' : 'Tiền mặt'}</span>
            </div>
          </div>
        )}

        {/* Settlement Summary Box */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light)',
            border: '1px solid rgba(13, 148, 136, 0.3)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tổng phát sinh (Phòng + Dịch vụ + Phụ thu - Giảm giá):</span>
              <strong>{formatVND(settlement.grossTotal)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
              <span>Khách đã đặt cọc trước đó:</span>
              <strong>-{formatVND(depositDeducted)}</strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--color-primary)',
                paddingTop: '0.5rem',
                marginTop: '0.25rem',
                borderTop: '2px solid rgba(13, 148, 136, 0.3)',
              }}
            >
              <span>{settlement.refundAmount > 0 ? 'Tiền thối lại cho khách:' : 'Khách cần thanh toán:'}</span>
              <span>{formatVND(settlement.refundAmount > 0 ? settlement.refundAmount : settlement.finalAmount)}</span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '0.25rem' }}>
              (Công thức quyết toán: [Tiền phòng: {formatVND(roomCharge)}] + [Dịch vụ: {formatVND(serviceCharge)}] + [Phụ thu: {formatVND(surcharge)}] - [Giảm giá: {formatVND(discount)}] - [Tiền cọc: {formatVND(depositDeducted)}] -&gt; Thực thu: {formatVND(settlement.finalAmount)})
            </div>
          </div>
        </div>

        {/* VietQR Dynamic Code Display when chosen and not yet settled */}
        {!invoice && paymentMethod === 'VIETQR' && settlement.finalAmount > 0 && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ffffff',
              border: '2px dashed var(--color-primary)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
              MÃ VIETQR NAPAS247 QUYẾT TOÁN TẠI QUẦY
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Khách hàng mở App Ngân hàng bất kỳ để quét mã thanh toán đúng số tiền {formatVND(settlement.finalAmount)}
            </p>
            <img
              src={qrUrl}
              alt="VietQR Settlement"
              style={{
                maxWidth: '240px',
                height: 'auto',
                margin: '0 auto',
                display: 'block',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)',
              }}
            />
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
              Số TK: <strong>{DEFAULT_HOTEL_BANK.accountNo}</strong> ({DEFAULT_HOTEL_BANK.bankId}) • Chủ TK: <strong>{DEFAULT_HOTEL_BANK.accountName}</strong>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          {invoice ? (
            <>
              <Button variant="outline" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Printer size={16} />
                <span>In phiếu thu</span>
              </Button>
              <Button variant="primary" onClick={onClose}>
                Đóng
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleCheckoutAndPay}
                loading={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <CheckCircle size={16} />
                <span>Xác nhận thanh toán & Trả phòng (Check-out)</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceDetailModal;
