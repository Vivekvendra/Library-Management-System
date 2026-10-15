import { useState } from 'react';
import {
  X,
  DollarSign,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  Printer,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { useLibrary, formatDisplayDate } from '../../context/LibraryContext';

export function PayFineModal({ isOpen, onClose, issueRecord }) {
  const { payFine } = useLibrary();

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customAmount, setCustomAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  if (!isOpen || !issueRecord) return null;

  const fineDue = issueRecord.calculatedFine || 0;
  const effectiveAmount = customAmount !== '' ? Number(customAmount) : fineDue;

  const handlePay = (e) => {
    e.preventDefault();
    const res = payFine({
      issueId: issueRecord.id,
      amount: effectiveAmount,
      paymentMethod,
      notes: notes || 'Overdue fine settlement',
      receiptNumber: receiptNumber || `RCP-${Date.now().toString().slice(-6)}`,
    });
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1D1611]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF7F2] rounded-2xl w-full max-w-md border border-[#E0D5C7] shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EAE0D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white flex items-center justify-center shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[15px] text-[#1D1611]">Process Fine Payment</h3>
              <p className="text-[11.5px] text-[#7C6959]">Loan #{issueRecord.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#7C6959] hover:bg-[#EAE0D5] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handlePay} className="mt-4 space-y-4">
          {/* Member & Book Card */}
          <div className="p-3 bg-white rounded-xl border border-[#EAE0D5] flex items-center gap-3">
            {issueRecord.bookCover ? (
              <img
                src={issueRecord.bookCover}
                alt={issueRecord.bookTitle}
                className="w-10 h-14 object-cover rounded shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-10 h-14 rounded bg-[#FAF7F2] border border-[#E0D5C7] flex items-center justify-center text-[#764B24]">
                <BookOpen className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-[#1D1611] truncate">{issueRecord.bookTitle}</h4>
              <p className="text-[11px] text-[#7C6959]">
                Patron: <strong className="text-[#1D1611]">{issueRecord.memberName}</strong> (
                <span className="font-mono text-[#764B24]">{issueRecord.membershipId}</span>)
              </p>
              <p className="text-[10.5px] text-[#DC2626] font-medium mt-0.5">
                {issueRecord.overdueDays} days late • $5.00/day
              </p>
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-[#FEF6EE] border border-[#FAD7B5] rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#8C4F1A] uppercase tracking-wider block">
                Total Overdue Penalty
              </span>
              <span className="text-2xl font-black text-[#8C4F1A]">
                ${fineDue.toFixed(2)}
              </span>
            </div>
            <div className="w-32">
              <label className="block text-[10px] font-semibold text-[#8C4F1A] mb-1">
                Settling Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={fineDue}
                placeholder={fineDue.toFixed(2)}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-[#FAD7B5] rounded-lg text-xs font-bold text-[#1D1611] outline-none text-right"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'Cash', label: 'Cash Desk', icon: Banknote },
                { id: 'Card', label: 'Credit / Debit', icon: CreditCard },
                { id: 'UPI / Online', label: 'UPI / Online', icon: Smartphone },
                { id: 'Net Banking', label: 'Bank Transfer', icon: Building },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'border-[#15803D] bg-[#DCFCE7]/40 text-[#15803D] font-bold shadow-2xs'
                        : 'border-[#EAE0D5] bg-white text-[#5C4B3E] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Receipt & Notes */}
          <div className="grid grid-cols-1 gap-2 pt-1">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                Receipt Number (Optional)
              </label>
              <input
                type="text"
                placeholder="Auto-generated e.g. RCP-849201"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                Cashier Remarks / Notes
              </label>
              <input
                type="text"
                placeholder="Overdue late fine received in full"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE0D5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#7C6959] hover:bg-[#EAE0D5] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#15803D] text-white shadow-xs hover:bg-[#166534] transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Payment (${effectiveAmount.toFixed(2)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function WaiveFineModal({ isOpen, onClose, issueRecord }) {
  const { waiveFine } = useLibrary();
  const [reason, setReason] = useState('Academic Research Grace');
  const [notes, setNotes] = useState('');

  if (!isOpen || !issueRecord) return null;

  const handleWaive = (e) => {
    e.preventDefault();
    const res = waiveFine({
      issueId: issueRecord.id,
      reason: `${reason}${notes ? ` - ${notes}` : ''}`,
    });
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1D1611]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF7F2] rounded-2xl w-full max-w-md border border-[#E0D5C7] shadow-2xl p-6">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EAE0D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[15px] text-[#1D1611]">Waive Overdue Penalty</h3>
              <p className="text-[11.5px] text-[#7C6959]">Loan #{issueRecord.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#7C6959] hover:bg-[#EAE0D5] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleWaive} className="mt-4 space-y-4">
          <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-[#991B1B] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Waiving Accrued Fine</p>
              <p className="mt-0.5 text-[11px] text-[#B91C1C]">
                You are about to waive the <strong>${Number(issueRecord.calculatedFine || 0).toFixed(2)}</strong> penalty for <strong>{issueRecord.memberName}</strong>. This action will be recorded in the audit log.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1.5">
              Waiver Justification Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none"
            >
              <option value="Academic Research Grace">Academic Research Grace Extension</option>
              <option value="Medical Emergency on Record">Medical Emergency on Record</option>
              <option value="First-time Courtesy Waiver">First-time Courtesy Waiver</option>
              <option value="Library System Maintenance Delay">Library System Maintenance Delay</option>
              <option value="Faculty Exemption Approved">Faculty Exemption Approved</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
              Officer Notes / Approval Reference
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Approved per Dean of Library Services memo #402"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE0D5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#7C6959] hover:bg-[#EAE0D5] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#DC2626] text-white shadow-xs hover:bg-[#B91C1C] transition cursor-pointer"
            >
              Confirm Waiver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ReceiptModal({ isOpen, onClose, receiptRecord }) {
  if (!isOpen || !receiptRecord) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1D1611]/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl w-full max-w-md border border-[#E0D5C7] shadow-2xl p-6 print:shadow-none print:border-none">
        {/* Receipt Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#EAE0D5]">
          <div>
            <div className="flex items-center gap-2 text-[#764B24] font-black text-sm tracking-wider uppercase">
              <Receipt className="w-4 h-4" />
              <span>LibraX Library Services</span>
            </div>
            <p className="text-[11px] text-[#7C6959] mt-0.5">
              Official Overdue Penalty Settlement Receipt
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#7C6959] hover:bg-[#FAF7F2] transition cursor-pointer print:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="my-4 space-y-3.5 text-xs text-[#1D1611]">
          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE0D5] flex items-center justify-between">
            <div>
              <span className="text-[10.5px] uppercase font-semibold text-[#7C6959] block">
                Receipt Number
              </span>
              <strong className="font-mono text-sm text-[#764B24]">
                {receiptRecord.receiptNumber || receiptRecord.id}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-[10.5px] uppercase font-semibold text-[#7C6959] block">
                Date Issued
              </span>
              <strong className="text-xs">
                {formatDisplayDate(receiptRecord.paidAt)}
              </strong>
            </div>
          </div>

          <div className="space-y-1.5 border-b border-[#F0E6DC] pb-3">
            <div className="flex justify-between">
              <span className="text-[#7C6959]">Patron Name:</span>
              <strong className="text-[#1D1611]">{receiptRecord.memberName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7C6959]">Membership ID:</span>
              <span className="font-mono text-[#764B24]">{receiptRecord.membershipId || 'LBX-MEM'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7C6959]">Book Title:</span>
              <span className="font-semibold text-right max-w-[200px] truncate">
                {receiptRecord.bookTitle}
              </span>
            </div>
            {receiptRecord.overdueDays !== undefined && (
              <div className="flex justify-between">
                <span className="text-[#7C6959]">Days Overdue:</span>
                <span>{receiptRecord.overdueDays} days</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#7C6959]">Payment Mode:</span>
              <span className="font-semibold text-[#15803D]">
                {receiptRecord.paymentMethod || 'Desk Cash'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7C6959]">Status:</span>
              <span className={`font-bold ${receiptRecord.paymentStatus === 'Waived' ? 'text-[#DC2626]' : 'text-[#15803D]'}`}>
                {receiptRecord.paymentStatus || 'Paid'}
              </span>
            </div>
          </div>

          {/* Amount Paid Box */}
          <div className="flex items-center justify-between bg-[#F4FDF7] border border-[#DCFCE7] p-3 rounded-xl">
            <span className="font-bold text-[#166534]">Total Amount Settled:</span>
            <span className="text-xl font-extrabold text-[#15803D]">
              ${Number(receiptRecord.amount || 0).toFixed(2)}
            </span>
          </div>

          {receiptRecord.notes && (
            <p className="text-[11px] text-[#7C6959] italic bg-[#FAF7F2] p-2 rounded-lg">
              Note: {receiptRecord.notes}
            </p>
          )}

          <div className="pt-2 text-[10.5px] text-center text-[#8C7A6B]">
            Thank you for supporting institutional library stewardship.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE0D5] print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#7C6959] hover:bg-[#EAE0D5] transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#764B24] text-white hover:bg-[#5C3919] transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
