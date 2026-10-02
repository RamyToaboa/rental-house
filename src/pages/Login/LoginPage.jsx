import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, 
  Zap, TrendingUp, Shield, ArrowRight, Check, Sparkles
} from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 👇 Full viewport background — no gap at bottom
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-slate-950">
      
      {/* ============================================ */}
      {/* LEFT PANEL — Brand Showcase                  */}
      {/* ============================================ */}
      <div className="relative hidden w-1/2 overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        
        <div className="absolute inset-0 bg-linear-to-br from-emerald-600 via-teal-700 to-emerald-900" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-400/30 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />

        <div 
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-white/20">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">RealEstate Pro</h1>
              <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-200/80">
                Rental Management
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
            <div className="flex h-1.5 w-1.5 items-center justify-center">
              <span className="absolute h-1.5 w-1.5 animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            </div>
            <span className="text-xs font-medium text-white">
              Trusted by 2,000+ property managers
            </span>
          </div>

          <h2 className="text-4xl font-bold leading-[1.15] tracking-tight text-white xl:text-5xl">
            Manage your properties with
            <span className="relative ml-2 inline-block">
              <span className="relative z-10">confidence.</span>
              <span className="absolute bottom-1 left-0 h-3 w-full origin-left scale-x-0 animate-[scale-x_1s_ease-out_0.8s_forwards] bg-emerald-400/40" />
            </span>
          </h2>

          <p className="mt-5 text-base leading-relaxed text-emerald-50/80">
            Track tenants, leases, payments, and maintenance — all in one beautiful dashboard built for modern property managers.
          </p>

          <div className="mt-8 space-y-3.5">
            {[
              { icon: Zap, text: 'Real-time tenant management' },
              { icon: TrendingUp, text: 'Automated rent & payment tracking' },
              { icon: Shield, text: 'Enterprise-grade security' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-medium text-emerald-50">{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-6 border-t border-white/15 pt-6">
            <div>
              <p className="text-2xl font-bold text-white">4.9/5</p>
              <p className="text-[11px] font-medium text-emerald-200/70">Average rating</p>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div>
              <p className="text-2xl font-bold text-white">$2.4M</p>
              <p className="text-[11px] font-medium text-emerald-200/70">Rent processed</p>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div>
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="text-[11px] font-medium text-emerald-200/70">Uptime</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-emerald-100/60">
          <span>© {new Date().getFullYear()} RealEstate Pro</span>
          <div className="flex items-center gap-4">
            <button className="transition-colors hover:text-white">Privacy</button>
            <button className="transition-colors hover:text-white">Terms</button>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* RIGHT PANEL — Login Form                     */}
      {/* ============================================ */}
      <div className="relative flex w-full flex-col bg-gray-50 lg:w-1/2 dark:bg-slate-950">
        
        {/* 👇 Added bg-white/dark:bg-slate-900 to solidly cover the right side */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl dark:bg-teal-500/10" />

        {/* Top navigation */}
        <div className="relative flex items-center justify-between border-b border-gray-100/80 bg-white/60 px-6 py-5 backdrop-blur-sm sm:px-10 dark:border-slate-800/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900 dark:text-white">
              RealEstate Pro
            </span>
          </div>
          <p className="ml-auto text-xs text-gray-500 dark:text-slate-400">
            Don't have an account?{' '}
            <button className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
              Sign up
            </button>
          </p>
        </div>

        {/* Form Container */}
        <div className="relative flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-20">
          <div className="w-full max-w-105">
            
            {/* Heading */}
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-3 py-1 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Welcome back
                </span>
              </div>
              <h2 className="text-[28px] font-bold tracking-tight text-gray-900 dark:text-white">
                Sign in to your account
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                Please enter your details to continue managing your properties.
              </p>
            </div>

            {/* Demo Hint Box */}
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200/60 bg-linear-to-br from-emerald-50 to-teal-50/50 p-3.5 dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-teal-500/5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                  Demo credentials
                </p>
                <p className="mt-0.5 font-mono text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-400/90">
                  admin@example.com / admin123
                </p>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 dark:border-red-500/30 dark:bg-red-500/10">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <p className="text-xs font-medium text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-11 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Password
                  </label>
                  <button type="button" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-11 pl-11 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-slate-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <span className="text-sm text-gray-600 dark:text-slate-400">
                    Keep me signed in
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70 dark:shadow-emerald-500/10"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-slate-700/60" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gray-50 px-3 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:bg-slate-950 dark:text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>

            {/* Legal footer */}
            <p className="mt-10 text-center text-xs text-gray-400 dark:text-slate-500">
              By signing in, you agree to our{' '}
              <button className="font-medium text-gray-600 hover:underline dark:text-slate-400">Terms of Service</button>
              {' '}and{' '}
              <button className="font-medium text-gray-600 hover:underline dark:text-slate-400">Privacy Policy</button>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;