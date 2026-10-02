import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Home, MapPin, DollarSign, Layout, Image as ImageIcon, 
  UploadCloud, CheckCircle2, Trash2, Loader2, CheckCircle,
  ChevronDown, Check, Building2, Building, Castle, Hotel,
  Star, ArrowLeft, ArrowRight
} from 'lucide-react';
import CambodiaLocationPicker from '../../components/CambodiaLocationPicker';

const AddPropertyModal = ({ onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('Property Details');
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '', type: '', listingType: 'For Sale', description: '',
    bedrooms: '', bathrooms: '', area: '', location: '', price: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* Custom Property Type dropdown */
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [typePos, setTypePos] = useState({ top: 0, left: 0, width: 0 });
  const typeButtonRef = useRef(null);
  const typeMenuRef = useRef(null);

  const propertyTypeOptions = [
    { value: 'Apartment', label: 'Apartment', icon: Building2, desc: 'Modern multi-unit living' },
    { value: 'House',     label: 'House',     icon: Home,      desc: 'Single-family home' },
    { value: 'Villa',     label: 'Villa',     icon: Castle,    desc: 'Luxury private estate' },
    { value: 'Condo',     label: 'Condo',     icon: Building,  desc: 'Owned unit in a building' },
    { value: 'Studio',    label: 'Studio',    icon: Hotel,     desc: 'Compact open-plan unit' },
  ];

  const selectedType = propertyTypeOptions.find(t => t.value === formData.type);

  const tabs = [{ name: 'Property Details', icon: Home }];

  /* Position type dropdown */
  useLayoutEffect(() => {
    if (!isTypeOpen || !typeButtonRef.current) return;
    const rect = typeButtonRef.current.getBoundingClientRect();
    const padding = 12;
    const width = rect.width;
    let left = Math.max(padding, Math.min(rect.left, window.innerWidth - width - padding));
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < 300 && rect.top > 300 ? rect.top - 8 - 300 : rect.bottom + 8;
    setTypePos({ top, left, width });
  }, [isTypeOpen]);

  useEffect(() => {
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!isTypeOpen) return;
    const handleClickOutside = (e) => {
      if (
        typeButtonRef.current && !typeButtonRef.current.contains(e.target) &&
        typeMenuRef.current && !typeMenuRef.current.contains(e.target)
      ) setIsTypeOpen(false);
    };
    const close = () => setIsTypeOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', close, true);
    };
  }, [isTypeOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* Convert files to base64 (persists in localStorage) */
  const filesToBase64 = (files) => {
    return Promise.all(
      files.map((file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ 
          file, 
          base64: reader.result, 
          id: Math.random().toString(36).substr(2, 9),
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }))
    );
  };

  const handleFiles = async (files) => {
    setIsUploading(true);
    try {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => 
        ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      );

      const oversized = validFiles.filter(f => f.size > 2 * 1024 * 1024);
      if (oversized.length > 0) {
        if (!window.confirm(
          `${oversized.length} image(s) are larger than 2MB and may slow down your app. Continue anyway?`
        )) {
          setIsUploading(false);
          return;
        }
      }

      const remaining = 20 - images.length;
      const filesToProcess = validFiles.slice(0, remaining);
      const newImages = await filesToBase64(filesToProcess);
      setImages((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error('Failed to read files:', error);
      alert('Failed to read one or more files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = '';
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  const setAsCover = (id) => {
    setImages((prev) => {
      const target = prev.find(i => i.id === id);
      if (!target) return prev;
      return [target, ...prev.filter(i => i.id !== id)];
    });
  };

  const moveImage = (id, direction) => {
    setImages((prev) => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === 'left' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  };

  const handleSave = () => {
    if (!formData.title || !formData.price || !formData.location) {
      alert("Please fill in the Property Title, Location, and Price.");
      return;
    }

    setIsSaving(true);
    setIsTypeOpen(false);

    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);

      const newProperty = {
        id: Date.now(),
        title: formData.title,
        location: formData.location,
        price: `$${Number(formData.price).toLocaleString()}`,
        beds: Number(formData.bedrooms) || 0,
        baths: Number(formData.bathrooms) || 0,
        sqft: Number(formData.area) || 0,
        type: formData.listingType,
        propertyType: formData.type || 'Apartment',
        tag: 'New',
        description: formData.description || 'No description provided.',
        image: images.length > 0 
          ? images[0].base64 
          : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop',
        images: images.map(img => img.base64),
      };

      if (onSave) onSave(newProperty);

      setTimeout(() => {
        setShowSuccess(false);
        onClose(); 
      }, 2000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-0 backdrop-blur-sm sm:p-4">
      
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-1000 flex items-center gap-3 rounded-lg border border-emerald-200 bg-white px-5 py-4 shadow-xl dark:border-emerald-500/30 dark:bg-slate-800">
          <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-500/20">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Property Added Successfully!</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Your listing is now live on the dashboard.</p>
          </div>
        </div>
      )}

      <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300 dark:bg-slate-900 sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-slate-800 sm:px-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">Add New Property</h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-100 px-2 dark:border-slate-800 sm:px-6 [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-medium whitespace-nowrap sm:gap-2 sm:px-5 sm:py-4 sm:text-sm ${
                activeTab === tab.name
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400'
              }`}
            >
              <tab.icon className="h-4 w-4" /> {tab.name}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* Property Details */}
          <div className="mb-6 sm:mb-8">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white sm:mb-4">Property Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Property Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter property title" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900" />
              </div>

              {/* Custom Property Type Dropdown */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Property Type *</label>
                <button
                  ref={typeButtonRef}
                  type="button"
                  onClick={() => setIsTypeOpen(v => !v)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-all ${
                    isTypeOpen
                      ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 dark:border-emerald-500/60 dark:bg-slate-800'
                      : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {selectedType ? (
                      <>
                        <selectedType.icon className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span className="font-medium text-gray-900 dark:text-white">{selectedType.label}</span>
                      </>
                    ) : (
                      <span className="text-gray-400 dark:text-slate-500">Select type</span>
                    )}
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isTypeOpen ? 'rotate-180 text-emerald-500' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>

            {/* 👇 CAMBODIA LOCATION PICKER */}
            <div className="mt-4">
              <CambodiaLocationPicker
                value={formData.location}
                onChange={(location) => setFormData(prev => ({ ...prev, location }))}
              />
            </div>

            {/* Area */}
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Area (sq.ft.)</label>
              <input 
                type="number" 
                name="area" 
                value={formData.area} 
                onChange={handleInputChange} 
                placeholder="e.g. 1850" 
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900" 
              />
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Listing Type *</label>
              <div className="flex flex-wrap gap-6 pt-1">
                {['For Sale', 'For Rent', 'Sold'].map((type) => (
                  <label key={type} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                    <input type="radio" name="listingType" value={type} checked={formData.listingType === type} onChange={handleInputChange} className="h-4 w-4 text-emerald-500 focus:ring-emerald-500" /> 
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Description *</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Enter property description" className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"></textarea>
            </div>
          </div>

          {/* Features & Pricing */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Bedrooms</label>
              <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} placeholder="e.g. 3" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Bathrooms</label>
              <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} placeholder="e.g. 2" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Price *</label>
              <input type="text" name="price" value={formData.price} onChange={handleInputChange} placeholder="Enter price" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900" />
            </div>
          </div>

          {/* Upload Images */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white sm:mb-4">
              Upload Images * {images.length > 0 && <span className="font-normal text-gray-400">({images.length}/20)</span>}
            </h3>
            
            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <input type="file" ref={fileInputRef} onChange={handleFileInput} multiple accept="image/*" className="hidden" />

                <div 
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  className={`flex h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all sm:h-44 sm:p-6 ${
                    isDragging 
                      ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-500/20 scale-[1.01]' 
                      : 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:hover:bg-emerald-500/10'
                  } ${isUploading ? 'cursor-wait opacity-80' : 'cursor-pointer'}`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-500" />
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Processing images...</p>
                    </>
                  ) : (
                    <>
                      <div className="mb-2 rounded-full bg-emerald-100 p-2.5 dark:bg-emerald-500/20 sm:mb-3 sm:p-3">
                        <UploadCloud className="h-5 w-5 text-emerald-600 dark:text-emerald-400 sm:h-6 sm:w-6" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        {isDragging ? 'Drop images here!' : 'Drag & drop images here'}
                      </p>
                      <p className="mb-3 text-xs text-gray-500 dark:text-slate-400 sm:mb-4">or click to browse</p>
                      <button type="button" className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600">
                        Browse Files
                      </button>
                    </>
                  )}
                </div>
                
                {/* Preview grid */}
                {images.length > 0 && (
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                        Uploaded ({images.length})
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500">
                        First image is the <span className="font-semibold text-emerald-600 dark:text-emerald-400">cover</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {images.map((img, index) => (
                        <div 
                          key={img.id} 
                          className={`
                            group relative aspect-square overflow-hidden rounded-xl border-2 transition-all
                            ${index === 0 
                              ? 'border-emerald-500 shadow-md shadow-emerald-500/20' 
                              : 'border-gray-200 dark:border-slate-700'
                            }
                          `}
                        >
                          <img src={img.base64} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />

                          {index === 0 && (
                            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-md">
                              <Star className="h-2.5 w-2.5 fill-current" />
                              Cover
                            </div>
                          )}

                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                            {index !== 0 && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setAsCover(img.id); }}
                                className="flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-semibold text-white hover:bg-emerald-600"
                                title="Set as cover"
                              >
                                <Star className="h-3 w-3" /> Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                              className="flex items-center gap-1 rounded-md bg-red-500 px-2 py-1 text-[10px] font-semibold text-white hover:bg-red-600"
                              title="Remove"
                            >
                              <Trash2 className="h-3 w-3" /> Remove
                            </button>
                            <div className="flex gap-1">
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); moveImage(img.id, 'left'); }}
                                  className="rounded-md bg-white/20 p-1 text-white backdrop-blur-sm hover:bg-white/30"
                                  title="Move left"
                                >
                                  <ArrowLeft className="h-3 w-3" />
                                </button>
                              )}
                              {index < images.length - 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); moveImage(img.id, 'right'); }}
                                  className="rounded-md bg-white/20 p-1 text-white backdrop-blur-sm hover:bg-white/30"
                                  title="Move right"
                                >
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-bold text-white backdrop-blur-sm">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 sm:p-5">
                <h4 className="mb-2 text-xs font-semibold text-gray-900 dark:text-white sm:mb-3">Tips for great photos</h4>
                <ul className="space-y-2 text-[11px] text-gray-500 dark:text-slate-400">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Use high resolution images</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Good lighting is important</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Show multiple angles</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Include exterior & interior</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6 sm:py-5">
          <button onClick={onClose} className="w-full rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:w-auto">
            Cancel
          </button>
          <button className="w-full rounded-lg border border-emerald-200 bg-white px-6 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-transparent dark:text-emerald-400 sm:w-auto">
            Save Draft
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-70 sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </button>
        </div>

      </div>

      {/* Property Type Dropdown */}
      {isTypeOpen && createPortal(
        <div
          ref={typeMenuRef}
          style={{
            position: 'fixed',
            top: `${typePos.top}px`,
            left: `${typePos.left}px`,
            width: `${typePos.width}px`,
            zIndex: 9999,
          }}
          className="animate-dropdown-in overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800 dark:ring-black/20"
        >
          <div className="border-b border-gray-50 px-4 py-2 dark:border-slate-700/60">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Select property type
            </p>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {propertyTypeOptions.map((option) => {
              const isSelected = formData.type === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => { setFormData({ ...formData, type: option.value }); setIsTypeOpen(false); }}
                  className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-500/10'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isSelected
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    <option.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${
                      isSelected
                        ? 'font-semibold text-emerald-700 dark:text-emerald-400'
                        : 'font-medium text-gray-900 dark:text-white'
                    }`}>
                      {option.label}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-gray-500 dark:text-slate-400">
                      {option.desc}
                    </p>
                  </div>
                  {isSelected && <Check className="mt-1.5 h-4 w-4 shrink-0 text-emerald-500" />}
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

export default AddPropertyModal;