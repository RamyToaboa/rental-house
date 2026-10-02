import React, { useState, useEffect, useRef } from 'react';
import { 
  X, User, Lock, Shield, Bell, SlidersHorizontal, Palette, 
  Globe, Puzzle, CreditCard, Users, Camera, Loader2, 
  CheckCircle, Upload, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SettingsModal = ({ onClose }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef(null);

  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 👇 Profile State — every field is guaranteed to be a string
  const [profile, setProfile] = useState(() => {
    const fallback = {
      name: user?.name || 'Be Confidence',
      email: user?.email || 'helloconfidence@gmail.com',
      phone: '+1 123 456 7890',
      jobTitle: 'Real Estate Agent',
      about: 'Passionate real estate professional with 8+ years of experience helping clients find their dream properties.',
      avatar: user?.avatar || '',
    };

    try {
      const saved = localStorage.getItem('realEstateProfile');
      if (!saved) return fallback;
      const parsed = JSON.parse(saved);
      // 👇 Merge with fallback so missing fields don't break the UI
      return {
        name:     typeof parsed.name === 'string' ? parsed.name : fallback.name,
        email:    typeof parsed.email === 'string' ? parsed.email : fallback.email,
        phone:    typeof parsed.phone === 'string' ? parsed.phone : fallback.phone,
        jobTitle: typeof parsed.jobTitle === 'string' ? parsed.jobTitle : fallback.jobTitle,
        about:    typeof parsed.about === 'string' ? parsed.about : fallback.about,
        avatar:   typeof parsed.avatar === 'string' ? parsed.avatar : fallback.avatar,
      };
    } catch {
      return fallback;
    }
  });

  // 👇 Notifications State — every field guaranteed boolean
  const [notifications, setNotifications] = useState(() => {
    const fallback = {
      emailPayments: true,
      emailMaintenance: true,
      emailMessages: false,
      pushAll: true,
      weeklyReport: true,
    };
    try {
      const saved = localStorage.getItem('realEstateNotifications');
      if (!saved) return fallback;
      const parsed = JSON.parse(saved);
      return {
        emailPayments:    typeof parsed.emailPayments === 'boolean' ? parsed.emailPayments : fallback.emailPayments,
        emailMaintenance: typeof parsed.emailMaintenance === 'boolean' ? parsed.emailMaintenance : fallback.emailMaintenance,
        emailMessages:    typeof parsed.emailMessages === 'boolean' ? parsed.emailMessages : fallback.emailMessages,
        pushAll:          typeof parsed.pushAll === 'boolean' ? parsed.pushAll : fallback.pushAll,
        weeklyReport:     typeof parsed.weeklyReport === 'boolean' ? parsed.weeklyReport : fallback.weeklyReport,
      };
    } catch {
      return fallback;
    }
  });

  useEffect(() => { 
    try { localStorage.setItem('realEstateProfile', JSON.stringify(profile)); } catch {} 
  }, [profile]);

  useEffect(() => { 
    try { localStorage.setItem('realEstateNotifications', JSON.stringify(notifications)); } catch {} 
  }, [notifications]);

  const handleAvatarUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { alert('Image too large (max 2MB)'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setProfile(p => ({ ...p, avatar: reader.result }));
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  const removeAvatar = () => setProfile(p => ({ ...p, avatar: '' }));

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 700);
  };

  const sections = [
    { id: 'profile',       label: 'Profile',              icon: User },
    { id: 'account',       label: 'Account',              icon: Lock },
    { id: 'security',      label: 'Security',             icon: Shield },
    { id: 'notifications', label: 'Notifications',        icon: Bell },
    { id: 'preferences',   label: 'Preferences',          icon: SlidersHorizontal },
    { id: 'appearance',    label: 'Appearance',           icon: Palette },
    { id: 'language',      label: 'Language & Region',    icon: Globe },
    { id: 'integrations',  label: 'Integrations',         icon: Puzzle },
    { id: 'billing',       label: 'Billing',              icon: CreditCard },
    { id: 'team',          label: 'Team',                 icon: Users },
  ];

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-0 backdrop-blur-sm sm:p-4">
      
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-1001 flex items-center gap-3 rounded-lg border border-emerald-200 bg-white px-5 py-4 shadow-xl dark:border-emerald-500/30 dark:bg-slate-800">
          <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-500/20">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Settings Saved!</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Your changes have been applied.</p>
          </div>
        </div>
      )}

      {/* Modal Container */}
      <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900 sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
          
          {/* Sidebar nav */}
          <nav className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto border-b border-gray-100 p-3 dark:border-slate-800 md:w-64 md:flex-col md:overflow-x-visible md:overflow-y-auto md:border-r md:border-b-0 md:p-4 [&::-webkit-scrollbar]:hidden">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap md:w-full ${
                  activeSection === s.id
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                }`}
              >
                <s.icon className={`h-4 w-4 shrink-0 ${
                  activeSection === s.id
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-400 dark:text-slate-500'
                }`} />
                {s.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Information</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    Manage your personal information and how it appears on your account.
                  </p>
                </div>

                {/* Avatar Section */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="relative shrink-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <div className="relative">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-purple-100 to-indigo-100 dark:from-purple-500/20 dark:to-indigo-500/20"
                      >
                        {profile.avatar ? (
                          <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {profile.name?.charAt(0)?.toUpperCase() || 'B'}
                          </span>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-800 text-white transition-colors hover:bg-gray-700 dark:border-slate-900"
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{profile.name}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{profile.email}</p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                      JPG, PNG or GIF. Max size of 2MB.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        Change Photo
                      </button>
                      {profile.avatar && (
                        <button
                          onClick={removeAvatar}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name || ''}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={profile.jobTitle || ''}
                        onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
                      About You
                    </label>
                    <textarea
                      rows="3"
                      maxLength={250}
                      value={profile.about || ''}
                      onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                      className="w-full resize-none rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <p className="mt-1 text-right text-[11px] text-gray-400 dark:text-slate-500">
                      {(profile.about || '').length}/250
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Account Settings</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    Manage your account and login credentials.
                  </p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Username</label>
                    <input type="text" defaultValue="beconfidence" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Account Type</label>
                    <input type="text" value="Premium" readOnly className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    Keep your account secure with a strong password.
                  </p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Confirm Password</label>
                      <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/5">
                    <div className="flex items-start gap-3">
                      <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-400">Two-Factor Authentication</p>
                        <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400/80">Add an extra layer of security to your account.</p>
                        <button className="mt-3 rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-600">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notification Preferences</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    Choose what updates you want to receive.
                  </p>
                </div>
                <div className="space-y-1">
                  {[
                    { key: 'emailPayments',    label: 'Payment Notifications', desc: 'Get notified when rent is due or paid' },
                    { key: 'emailMaintenance', label: 'Maintenance Updates',   desc: 'Receive maintenance request updates' },
                    { key: 'emailMessages',    label: 'New Messages',          desc: 'Get notified for new messages' },
                    { key: 'pushAll',          label: 'Push Notifications',    desc: 'Enable browser push notifications' },
                    { key: 'weeklyReport',     label: 'Weekly Report',         desc: 'Receive a weekly summary email' },
                  ].map((n) => (
                    <div key={n.key} className="flex items-center justify-between border-b border-gray-100 py-4 last:border-0 dark:border-slate-800">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{n.label}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{n.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [n.key]: !notifications[n.key] })}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                          notifications[n.key] ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-700'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          notifications[n.key] ? 'translate-x-5' : ''
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Preferences</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Customize your dashboard experience.</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Default Currency</label>
                    <select className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                      <option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option><option>KHR (៛)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Date Format</label>
                    <select className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                      <option>MM/DD/YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Appearance</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Choose how the app looks for you.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => theme === 'dark' && toggleTheme()}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      theme === 'light'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10'
                        : 'border-gray-200 hover:border-gray-300 dark:border-slate-700'
                    }`}
                  >
                    <div className="mb-3 h-20 rounded-md bg-white shadow-inner ring-1 ring-gray-200">
                      <div className="h-4 border-b border-gray-100" />
                      <div className="p-2">
                        <div className="h-2 w-3/4 rounded bg-gray-200" />
                        <div className="mt-1 h-2 w-1/2 rounded bg-gray-100" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Light Mode</p>
                  </button>
                  <button
                    onClick={() => theme === 'light' && toggleTheme()}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      theme === 'dark'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10'
                        : 'border-gray-200 hover:border-gray-300 dark:border-slate-700'
                    }`}
                  >
                    <div className="mb-3 h-20 rounded-md bg-slate-900 shadow-inner ring-1 ring-slate-700">
                      <div className="h-4 border-b border-slate-800" />
                      <div className="p-2">
                        <div className="h-2 w-3/4 rounded bg-slate-700" />
                        <div className="mt-1 h-2 w-1/2 rounded bg-slate-800" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Dark Mode</p>
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'language' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Language & Region</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Set your preferred language and timezone.</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Language</label>
                    <select className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                      <option>English</option><option>Khmer</option><option>Spanish</option><option>French</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Timezone</label>
                    <select className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                      <option>UTC+07:00 — Phnom Penh</option><option>UTC-05:00 — New York</option><option>UTC+00:00 — London</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'integrations' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Integrations</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Connect your favorite tools.</p>
                </div>
                <div className="space-y-3">
                  {['Stripe', 'QuickBooks', 'Google Calendar', 'Slack'].map((app) => (
                    <div key={app} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-700 dark:bg-slate-700 dark:text-slate-200">
                          {app.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{app}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">Not connected</p>
                        </div>
                      </div>
                      <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Billing</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Manage your subscription and payment methods.</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-teal-50 p-5 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-teal-500/5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Current Plan</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">Premium</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">$49/month · Renews June 15, 2025</p>
                  <button className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
                    Manage Subscription
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'team' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Team Members</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Manage who has access to your workspace.</p>
                  </div>
                  <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
                    Invite Member
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Admin', avatar: 'https://i.pravatar.cc/150?u=sarah' },
                    { name: 'Michael Brown', email: 'michael@example.com', role: 'Manager', avatar: 'https://i.pravatar.cc/150?u=michael' },
                    { name: 'Emily Davis', email: 'emily@example.com', role: 'Agent', avatar: 'https://i.pravatar.cc/150?u=emily' },
                  ].map((m) => (
                    <div key={m.email} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <img src={m.avatar} alt={m.name} className="h-10 w-10 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{m.email}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-slate-700 dark:text-slate-300">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-200 transition-colors hover:bg-emerald-600 disabled:opacity-70 dark:shadow-none sm:w-auto"
          >
            {isSaving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;