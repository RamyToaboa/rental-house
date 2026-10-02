import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, User, Mail, Phone, Home, DollarSign, 
  Loader2, CheckCircle, Camera, Trash2, ChevronDown, Check
} from 'lucide-react';
import LeaseDateRangePicker from '../../components/LeaseDateRangePicker';

/* Convert display date "Jan 1, 2025" → ISO "2025-01-01" */
const toISODate = (value) => {
  if (!value || value === 'TBD') return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/* Convert ISO → display "Jan 1, 2025" */
const toDisplayDate = (iso) => {
  if (!iso) return 'TBD';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return 'TBD';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const AddTenantModal = ({ onClose, onSave, tenantToEdit }) => {
  const isEditMode = Boolean(tenantToEdit);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: tenantToEdit?.name || '',
    email: tenantToEdit?.email || '',
    phone: tenantToEdit?.phone || '',
    property: tenantToEdit?.property || '',
    unit: tenantToEdit?.unit || '',
    leaseStart: toISODate(tenantToEdit?.leaseStart),
    leaseEnd: toISODate(tenantToEdit?.leaseEnd),
    rent: tenantToEdit?.rent ? tenantToEdit.rent.replace(/[^0-9.]/g, '') : '',
    status: tenantToEdit?.status || 'Active',
  });
  
  const [avatarPreview, setAvatarPreview] = useState(tenantToEdit?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusPos, setStatusPos] = useState({ top: 0, left: 0, width: 0 });
  const statusButtonRef = useRef(null);
  const statusMenuRef = useRef(null);

  const statusOptions = ['Active', 'Pending', 'Inactive'];
  const dotColor = (s) => s === 'Active' ? 'bg-emerald-500' : s === 'Pending' ? 'bg-amber-500' : 'bg-red-500';

  useLayoutEffect(() => {
    if (!isStatusOpen || !statusButtonRef.current) return;
    const rect = statusButtonRef.current.getBoundingClientRect();
    const padding = 12;
    const width = rect.width;
    let left = Math.max(padding, Math.min(rect.left, window.innerWidth - width - padding));
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < 180 && rect.top > 180 ? rect.top - 8 - 180 : rect.bottom + 8;
    setStatusPos({ top, left, width });
  }, [isStatusOpen]);

  useEffect(() => {
  // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!isStatusOpen) return;
    const handleClickOutside = (e) => {
      if (
        statusButtonRef.current && !statusButtonRef.current.contains(e.target) &&
        statusMenuRef.current && !statusMenuRef.current.contains(e.target)
      ) setIsStatusOpen(false);
    };
    const close = () => setIsStatusOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', close, true);
    };
  }, [isStatusOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please upload an image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('Image too large (max 2MB).'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeAvatar = () => {
    setAvatarPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.property) {
      alert("Please fill in the required fields: Name, Email, and Property.");
      return;
    }
    setIsSaving(true);
    setIsStatusOpen(false);

    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);

      const tenantData = {
        id: isEditMode ? tenantToEdit.id : Date.now(),
        avatar: avatarPreview || `https://i.pravatar.cc/150?u=${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || 'N/A',
        property: formData.property,
        unit: formData.unit || 'N/A',
        leaseStart: toDisplayDate(formData.leaseStart),
        leaseEnd: toDisplayDate(formData.leaseEnd),
        rent: formData.rent ? `$${Number(formData.rent).toLocaleString()}` : '$0',
        rentPeriod: 'Monthly',
        status: formData.status,
      };

      if (onSave) onSave(tenantData);
      setTimeout(() => { setShowSuccess(false); onClose(); }, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-0 backdrop-blur-sm sm:p-4">
      
      {showSuccess && (
        <div className="fixed top-6 right-6 z-1000 flex items-center gap-3 rounded-lg border border-emerald-200 bg-white px-5 py-4 shadow-xl dark:border-emerald-500/30 dark:bg-slate-800">
          <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-500/20">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Tenant Updated!' : 'Tenant Added!'}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {isEditMode ? 'Changes saved successfully.' : 'The new tenant is now on the dashboard.'}
            </p>
          </div>
        </div>
      )}

      <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300 dark:bg-slate-900 sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-2xl">
        
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-slate-800 sm:px-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
            {isEditMode ? 'Edit Tenant' : 'Add New Tenant'}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

          {/* Avatar */}
          <div className="mb-6 flex flex-col items-center gap-3 border-b border-gray-100 pb-6 dark:border-slate-800">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg, image/webp" className="hidden" />
            <div className="relative">
              <div onClick={() => fileInputRef.current?.click()} className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-emerald-300 bg-emerald-50/50 transition-colors hover:border-emerald-500 dark:border-emerald-500/40 dark:bg-emerald-500/5">
                {avatarPreview ? (
                  <>
                    <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </>
                ) : (
                  <Camera className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              {avatarPreview && (
                <button onClick={removeAvatar} className="absolute -top-1 -right-1 rounded-full bg-red-500 p-1.5 text-white shadow-md hover:bg-red-600">
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Tenant Photo</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Click to upload • JPG, PNG, WEBP (max 2MB)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Full Name *</label>
              <div className="relative">
                <User className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. John Doe"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-11 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Email Address *</label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-11 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Phone Number</label>
              <div className="relative">
                <Phone className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(555) 000-0000"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-11 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Property *</label>
              <div className="relative">
                <Home className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" name="property" value={formData.property} onChange={handleInputChange} placeholder="e.g. Modern Downtown Loft"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-11 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Unit Number</label>
              <input type="text" name="unit" value={formData.unit} onChange={handleInputChange} placeholder="e.g. Unit 4B"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Rent Amount</label>
              <div className="relative">
                <DollarSign className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="number" name="rent" value={formData.rent} onChange={handleInputChange} placeholder="2500"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-11 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900" />
              </div>
            </div>

            {/* 👇 MODERN LEASE DATE RANGE PICKER */}
            <div className="md:col-span-2">
              <LeaseDateRangePicker
                start={formData.leaseStart}
                end={formData.leaseEnd}
                onChange={({ start, end }) => setFormData(prev => ({ ...prev, leaseStart: start, leaseEnd: end }))}
              />
            </div>

            {/* Status dropdown */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Status</label>
              <button
                ref={statusButtonRef}
                type="button"
                onClick={() => setIsStatusOpen(v => !v)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition-all ${
                  isStatusOpen
                    ? 'border-emerald-500 bg-white text-gray-900 ring-2 ring-emerald-500/20 dark:border-emerald-500/60 dark:bg-slate-800 dark:text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${dotColor(formData.status)}`} />
                  <span className="font-medium">{formData.status}</span>
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isStatusOpen ? 'rotate-180 text-emerald-500' : 'text-gray-400'}`} />
              </button>
            </div>

          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6 sm:py-5">
          <button onClick={onClose} className="w-full rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:w-auto">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-70 sm:w-auto">
            {isSaving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {isEditMode ? 'Updating...' : 'Saving...'}</>
            ) : (isEditMode ? 'Update Tenant' : 'Save Tenant')}
          </button>
        </div>
      </div>

      {/* Status dropdown portal */}
      {isStatusOpen && createPortal(
        <div
          ref={statusMenuRef}
          style={{ position: 'fixed', top: `${statusPos.top}px`, left: `${statusPos.left}px`, width: `${statusPos.width}px`, zIndex: 9999 }}
          className="animate-dropdown-in overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800 dark:ring-black/20"
        >
          <div className="border-b border-gray-50 px-4 py-2 dark:border-slate-700/60">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">Change status</p>
          </div>
          <div className="py-1">
            {statusOptions.map(option => {
              const isSelected = formData.status === option;
              return (
                <button key={option} type="button"
                  onClick={() => { setFormData({ ...formData, status: option }); setIsStatusOpen(false); }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotColor(option)}`} />
                    {option}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AddTenantModal;