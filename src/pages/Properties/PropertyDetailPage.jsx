import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Bed, Bath, Square, Phone, Mail, Calendar, 
  Check, ChevronDown, Loader2, CheckCircle2, Send
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationsContext';

const PropertyDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();

  const initialProperty = location.state?.property;

  const [property, setProperty] = useState(initialProperty);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusPos, setStatusPos] = useState({ top: 0, left: 0, width: 0 });
  const statusButtonRef = useRef(null);
  const statusMenuRef = useRef(null);

  // 👇 Contact form state
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');

  // Position status dropdown
  useLayoutEffect(() => {
    if (!isStatusOpen || !statusButtonRef.current) return;
    const rect = statusButtonRef.current.getBoundingClientRect();
    const padding = 12;
    const width = 160;
    let left = Math.max(padding, Math.min(rect.left, window.innerWidth - width - padding));
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < 180 && rect.top > 180 ? rect.top - 8 - 180 : rect.bottom + 8;
    setStatusPos({ top, left, width });
  }, [isStatusOpen]);

  // Close on click outside
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

  if (!property) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Property Not Found</h2>
        <p className="text-gray-500 dark:text-slate-400">The property you are looking for doesn't exist or was removed.</p>
        <Link to="/properties" className="rounded-lg bg-emerald-500 px-6 py-2 text-white hover:bg-emerald-600">
          Back to Properties
        </Link>
      </div>
    );
  }

  // Update status + save to localStorage
  const handleStatusChange = (newStatus) => {
    const updatedProperty = { ...property, type: newStatus };
    setProperty(updatedProperty);
    setIsStatusOpen(false);

    try {
      const saved = localStorage.getItem('realEstateProperties');
      if (saved) {
        const savedProperties = JSON.parse(saved);
        const updatedList = savedProperties.map(p => 
          p.id === property.id ? updatedProperty : p
        );
        localStorage.setItem('realEstateProperties', JSON.stringify(updatedList));
      }
    } catch (error) {
      console.error("Failed to update status in localStorage:", error);
    }
  };

  // 👇 Send message handler — this is what was missing!
  const handleSendMessage = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }

    // Basic email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      // 👇 Push a real-time notification to the bell
      addNotification({
        type: 'contact-message',
        title: `New message from ${formData.name}`,
        message: formData.message,
        from: formData.email,
        propertyTitle: property.title,
        propertyId: property.id,
      });

      setIsSending(false);
      setSent(true);
      setFormData({ name: '', email: '', message: '' });

      // Reset the success state after 5 seconds
      setTimeout(() => setSent(false), 5000);
    }, 700);
  };

  const statuses = ['For Sale', 'For Rent', 'Sold'];

  const dotColor = (s) => 
    s === 'For Sale' ? 'bg-emerald-500' 
    : s === 'For Rent' ? 'bg-blue-500' 
    : 'bg-gray-500';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Properties
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Main Image */}
          <div className="relative h-96 w-full overflow-hidden rounded-2xl border border-gray-100 shadow-sm dark:border-slate-800">
            <img src={property.image} alt={property.title} className="h-full w-full object-cover" />
            
            {/* Status Button */}
            <div className="absolute top-4 left-4">
              <button 
                ref={statusButtonRef}
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 ${
                  property.type === 'For Sale' ? 'bg-emerald-500' : 
                  property.type === 'For Rent' ? 'bg-blue-500' : 'bg-gray-500'
                }`}
              >
                {property.type}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Title & Specs */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{property.title}</h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400">
                  <MapPin className="h-4 w-4" /> {property.location}
                </p>
              </div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{property.price}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-gray-100 pt-6 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-gray-100 p-2 dark:bg-slate-800">
                  <Bed className="h-5 w-5 text-gray-600 dark:text-slate-300" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{property.beds} Bedrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-gray-100 p-2 dark:bg-slate-800">
                  <Bath className="h-5 w-5 text-gray-600 dark:text-slate-300" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{property.baths} Bathrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-gray-100 p-2 dark:bg-slate-800">
                  <Square className="h-5 w-5 text-gray-600 dark:text-slate-300" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{property.sqft} sq.ft.</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">About This Property</h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
              {property.description || "This stunning property offers modern living at its finest. Featuring spacious rooms, premium finishes, and an unbeatable location."}
            </p>
          </div>
        </div>

        {/* Right Column: Contact Agent */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Contact Agent</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Interested in this property? Fill out the form below.</p>
            
            {/* 👇 Success state */}
            {sent ? (
              <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <div className="rounded-full bg-emerald-500 p-3 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <p className="mt-3 text-sm font-bold text-emerald-900 dark:text-emerald-300">
                  Message sent successfully!
                </p>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400/80">
                  The agent will be in touch shortly.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 text-xs font-semibold text-emerald-700 underline hover:text-emerald-800 dark:text-emerald-400"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="mt-6 space-y-4">
                {formError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Your Name</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe" 
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Email Address</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com" 
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Message</label>
                  <textarea 
                    rows="3"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="I'm interested in this property..." 
                    className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={isSending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-70"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 flex items-center justify-center gap-4 border-t border-gray-100 pt-6 dark:border-slate-800">
              <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400">
                <Phone className="h-4 w-4" /> Call
              </button>
              <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400">
                <Mail className="h-4 w-4" /> Email
              </button>
              <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400">
                <Calendar className="h-4 w-4" /> Tour
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 👇 Status dropdown — portal for proper positioning */}
      {isStatusOpen && createPortal(
        <div
          ref={statusMenuRef}
          style={{
            position: 'fixed',
            top: `${statusPos.top}px`,
            left: `${statusPos.left}px`,
            width: `${statusPos.width}px`,
            zIndex: 9999,
          }}
          className="animate-dropdown-in overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800 dark:ring-black/20"
        >
          <div className="border-b border-gray-50 px-4 py-2 dark:border-slate-700/60">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Change status
            </p>
          </div>
          <div className="py-1">
            {statuses.map((status) => {
              const isSelected = property.type === status;
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${dotColor(status)}`} />
                    {status}
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

export default PropertyDetailPage;