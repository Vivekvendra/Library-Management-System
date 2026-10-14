import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, User, AlertTriangle, Phone, Mail, MapPin, Calendar, CreditCard, Shield } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export function MemberFormModal({ isOpen, onClose, initialData = null }) {
  const { addMember, editMember, members } = useLibrary();
  const isEditing = Boolean(initialData);

  const defaultNextId = `LBX-2026-${String(members.length + 1).padStart(3, '0')}`;
  const todayIso = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      membershipId: defaultNextId,
      membershipDate: todayIso,
      status: 'Active',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        membershipId: initialData.membershipId || '',
        membershipDate: initialData.membershipDate || todayIso,
        status: initialData.status || 'Active',
      });
    } else {
      reset({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        membershipId: defaultNextId,
        membershipDate: todayIso,
        status: 'Active',
      });
    }
  }, [initialData, isOpen, reset, defaultNextId, todayIso]);

  if (!isOpen) return null;

  const onSubmit = (formData) => {
    if (isEditing) {
      const res = editMember({
        id: initialData.id,
        ...formData,
      });
      if (res.success) {
        onClose();
      }
    } else {
      const res = addMember(formData);
      if (res.success) {
        reset();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1D1611]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl w-full max-w-lg border border-[#E0D5C7] shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F5EFE6] border-b border-[#EAE0D5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#764B24] to-[#4A2E16] text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[16px] text-[#1D1611]">
                {isEditing ? 'Edit Member Profile' : 'Register New Member'}
              </h3>
              <p className="text-[12px] text-[#7C6959]">
                {isEditing
                  ? `Updating file for ${initialData.fullName}`
                  : 'Add a new patron or reader to the library directory'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7C6959] hover:bg-[#EAE0D5] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
              Full Name <span className="text-[#C53030]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Johnathan Doe"
                {...register('fullName', {
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'Minimum 2 characters' },
                })}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none transition"
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email & Mobile Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                Email Address <span className="text-[#C53030]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-2.5" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none transition"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                Mobile Number <span className="text-[#C53030]">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-2.5" />
                <input
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  {...register('phone', {
                    required: 'Mobile number is required',
                    minLength: { value: 7, message: 'Valid phone number required' },
                  })}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none transition"
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
              Address <span className="text-[#C53030]">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. 142 Baker St, Suite 4B, London"
                {...register('address', {
                  required: 'Postal or residential address is required',
                  minLength: { value: 4, message: 'Address must be at least 4 characters' },
                })}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none transition"
              />
            </div>
            {errors.address && (
              <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Membership ID & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                Membership ID <span className="text-[#C53030]">*</span>
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="LBX-2026-001"
                  {...register('membershipId', {
                    required: 'Membership ID is required',
                  })}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs font-mono text-[#1D1611] outline-none transition uppercase"
                />
              </div>
              {errors.membershipId && (
                <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                  {errors.membershipId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                Membership Date <span className="text-[#C53030]">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-2.5" />
                <input
                  type="date"
                  {...register('membershipDate', {
                    required: 'Membership date is required',
                  })}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none transition"
                />
              </div>
              {errors.membershipDate && (
                <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                  {errors.membershipDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
              Membership Status
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-2.5" />
              <select
                {...register('status')}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none transition cursor-pointer"
              >
                <option value="Active">Active (In Good Standing)</option>
                <option value="Suspended">Suspended</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Actions */}
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#764B24] to-[#553417] text-white shadow-sm hover:brightness-110 transition cursor-pointer disabled:opacity-50"
            >
              {isEditing ? 'Save Changes' : 'Register Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteMemberConfirmModal({
  isOpen,
  onClose,
  member,
  onConfirm,
}) {
  const { issues } = useLibrary();
  if (!isOpen || !member) return null;

  const activeLoans = issues.filter(
    (i) => i.memberId === member.id && i.status !== 'Returned'
  );
  const hasActiveLoans = activeLoans.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#1D1611]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF7F2] rounded-2xl w-full max-w-md border border-[#E0D5C7] shadow-2xl p-6">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              hasActiveLoans
                ? 'bg-[#FEF3C7] text-[#D97706]'
                : 'bg-[#FEE2E2] text-[#DC2626]'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[15px] text-[#1D1611]">
              {hasActiveLoans
                ? 'Cannot Delete Active Member'
                : 'Confirm Member Deletion'}
            </h3>
            <p className="text-[12px] text-[#7C6959] mt-1">
              {hasActiveLoans ? (
                <>
                  <strong className="text-[#1D1611]">{member.fullName}</strong> currently
                  has{' '}
                  <span className="font-semibold text-[#D97706]">
                    {activeLoans.length} unreturned book(s)
                  </span>
                  . All books must be returned or resolved before this member account can
                  be removed.
                </>
              ) : (
                <>
                  Are you sure you want to delete member{' '}
                  <strong className="text-[#1D1611]">{member.fullName}</strong> (
                  <span className="font-mono text-[#764B24]">{member.membershipId}</span>
                  )? This action cannot be undone.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#7C6959] hover:bg-[#EAE0D5] transition cursor-pointer"
          >
            {hasActiveLoans ? 'Close' : 'Cancel'}
          </button>
          {!hasActiveLoans && (
            <button
              type="button"
              onClick={() => {
                onConfirm(member.id);
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#DC2626] text-white hover:bg-[#B91C1C] transition cursor-pointer shadow-sm"
            >
              Delete Member
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
