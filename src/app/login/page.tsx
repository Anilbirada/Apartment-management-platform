'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Lock,
  Mail,
  Key,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Sparkles,
  AlertCircle,
  Store,
  Wrench,
  Smartphone
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getDashboardForRole } from '@/lib/roles';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchRole } = useApp();

  const [authMethod, setAuthMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [isRegister, setIsRegister] = useState(false);
  const [registerRole, setRegisterRole] = useState<'GUEST' | 'RESIDENT' | 'PROVIDER' | 'BUSINESS'>('RESIDENT');
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);

  // Login state
  const [identifier, setIdentifier] = useState('rahul.sharma@gmail.com');
  const [password, setPassword] = useState('Password123!');
  
  // OTP state
  const [otpPhone, setOtpPhone] = useState('+91 98860 33441');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('Password123!');
  const [regCommunityId, setRegCommunityId] = useState('');
  const [regBlock, setRegBlock] = useState('Tower B');
  const [regFlat, setRegFlat] = useState('304');
  const [regResidentType, setRegResidentType] = useState('OWNER');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regCategory, setRegCategory] = useState('GROCERY');

  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('mode') === 'register' || searchParams.get('signup') === 'true') {
        setIsRegister(true);
      }
      const roleParam = searchParams.get('role');
      if (roleParam === 'GUEST' || roleParam === 'RESIDENT' || roleParam === 'PROVIDER' || roleParam === 'BUSINESS') {
        setRegisterRole(roleParam as any);
      }
      const redirect = searchParams.get('redirect');
      if (redirect) {
        setRedirectPath(redirect);
      }
      const message = searchParams.get('message');
      if (message) {
        setAccessMessage(message);
      }
    }

    // Fetch available communities for apartment selector
    fetch('/api/v1/apartments')
      .then(res => res.json())
      .then(data => {
        if (data.apartments) {
          setCommunities(data.apartments);
          if (data.apartments.length > 0) {
            setRegCommunityId(data.apartments[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  const routeUserAfterAuth = (user: any) => {
    if (redirectPath) {
      router.push(redirectPath);
      return;
    }
    const targetDashboard = getDashboardForRole(user.role);
    router.push(targetDashboard);
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.user);
      routeUserAfterAuth(data.user);
    } catch (e: any) {
      setError(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const res = await fetch('/api/v1/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: otpPhone })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      setSuccessMsg(data.message || 'OTP dispatched to your registered mobile number.');
      if (data.devOtp) {
        setDevOtpHint(data.devOtp);
        setOtpCode(data.devOtp); // auto-fill for testing ease
      }
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/v1/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: otpPhone, otp: otpCode })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid OTP code');
      }

      login(data.token, data.user);
      routeUserAfterAuth(data.user);
    } catch (e: any) {
      setError(e.message || 'OTP Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regPhone) {
      setError('Please fill out all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone,
          role: registerRole,
          communityId: registerRole === 'GUEST' ? null : regCommunityId,
          block: registerRole === 'RESIDENT' ? regBlock : undefined,
          flatNumber: registerRole === 'RESIDENT' ? regFlat : undefined,
          residentType: registerRole === 'RESIDENT' ? regResidentType : undefined,
          businessName: registerRole === 'BUSINESS' || registerRole === 'PROVIDER' ? (regBusinessName || `${regName} Enterprise`) : undefined,
          businessCategory: registerRole === 'BUSINESS' ? regCategory : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessMsg(data.message || 'Registration successful!');
      login(data.token, data.user);

      setTimeout(() => {
        routeUserAfterAuth(data.user);
      }, 1000);
    } catch (e: any) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPersona = async (targetRole: 'RESIDENT' | 'PROVIDER' | 'MANAGEMENT' | 'BUSINESS' | 'ADMIN' | 'GUEST') => {
    try {
      setLoading(true);
      await switchRole(targetRole);
      if (redirectPath) router.push(redirectPath);
      else router.push(getDashboardForRole(targetRole));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-ken-burns scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1800&q=80')`,
          filter: 'brightness(0.55) contrast(1.15)'
        }}
      />

      {/* Dark Glass Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/60" />

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-slate-900/85 backdrop-blur-xl border border-white/15 p-6 sm:p-8 shadow-2xl text-white space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 mx-auto flex items-center justify-center text-white shadow-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Palm Heights Enterprise
          </h1>
          <p className="text-xs text-slate-300">
            Unified Multi-Apartment & Local Marketplace Platform
          </p>
        </div>

        {/* ACCESS RESTRICTION ALERT (REQUIREMENT 11) */}
        {accessMessage && (
          <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-2.5 shadow-md animate-fadeIn">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="leading-snug">{accessMessage}</span>
          </div>
        )}

        {/* Demo Persona Quick Login Strip (6 Roles) */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 text-center">
            Instant One-Tap Demo Access (6 Roles)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-left">
            <button
              onClick={() => handleQuickPersona('GUEST')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-600/30 hover:bg-slate-600/50 border border-slate-500/30 text-slate-200 text-xs font-bold transition-all"
            >
              <div>Guest</div>
              <div className="text-[10px] font-normal text-slate-300 truncate">Visitor Account</div>
            </button>

            <button
              onClick={() => handleQuickPersona('RESIDENT')}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/30 text-emerald-200 text-xs font-bold transition-all"
            >
              <div>Resident</div>
              <div className="text-[10px] font-normal text-slate-300 truncate">Rahul (B-304)</div>
            </button>

            <button
              onClick={() => handleQuickPersona('PROVIDER')}
              className="px-2.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 text-blue-200 text-xs font-bold transition-all"
            >
              <div>Provider</div>
              <div className="text-[10px] font-normal text-slate-300 truncate">Ramesh (Plumber)</div>
            </button>

            <button
              onClick={() => handleQuickPersona('MANAGEMENT')}
              className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-purple-200 text-xs font-bold transition-all"
            >
              <div>Management</div>
              <div className="text-[10px] font-normal text-slate-300 truncate">Sunita Deshmukh</div>
            </button>

            <button
              onClick={() => handleQuickPersona('BUSINESS')}
              className="px-2.5 py-1.5 rounded-xl bg-teal-600/30 hover:bg-teal-600/50 border border-teal-500/30 text-teal-200 text-xs font-bold transition-all"
            >
              <div>Local Business</div>
              <div className="text-[10px] font-normal text-slate-300 truncate">Namaste Fresh</div>
            </button>

            <button
              onClick={() => handleQuickPersona('ADMIN')}
              className="px-2.5 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/30 text-amber-200 text-xs font-bold transition-all"
            >
              <div>Platform Admin</div>
              <div className="text-[10px] font-normal text-slate-300 truncate">Vikramaditya Rao</div>
            </button>
          </div>
        </div>

        {/* Toggle Sign In / Register */}
        <div className="flex rounded-xl bg-white/5 p-1 text-xs font-bold border border-white/10">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              !isRegister ? 'bg-white/20 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              isRegister ? 'bg-white/20 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* SIGN IN VIEW */}
        {!isRegister ? (
          <div className="space-y-4">
            {/* Sub-toggle: Password vs OTP */}
            <div className="flex border-b border-white/10 pb-2 text-xs font-semibold gap-4">
              <button
                type="button"
                onClick={() => setAuthMethod('PASSWORD')}
                className={`pb-1 border-b-2 transition-all ${
                  authMethod === 'PASSWORD'
                    ? 'border-emerald-400 text-emerald-300 font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Email / Mobile & Password
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('OTP')}
                className={`pb-1 border-b-2 transition-all ${
                  authMethod === 'OTP'
                    ? 'border-emerald-400 text-emerald-300 font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Mobile Number OTP
              </button>
            </div>

            {authMethod === 'PASSWORD' ? (
              <form onSubmit={handleCustomLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Email Address or Mobile Number
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. rahul.sharma@gmail.com or +919886033441"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-emerald-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-emerald-400"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Campus Portal'}
                </button>
              </form>
            ) : (
              /* OTP AUTHENTICATION */
              <div className="space-y-3.5">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Registered Mobile Number</label>
                      <div className="relative">
                        <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={otpPhone}
                          onChange={(e) => setOtpPhone(e.target.value)}
                          placeholder="+91 98860 33441"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-emerald-400"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                        <span>Enter 6-Digit OTP</span>
                        {devOtpHint && (
                          <span className="text-[10px] text-emerald-400 font-bold">Simulator OTP: {devOtpHint}</span>
                        )}
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full text-center tracking-widest text-lg font-black py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="px-3 py-2.5 rounded-xl border border-white/20 text-xs text-slate-300 hover:text-white"
                      >
                        Change Number
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
                      >
                        {loading ? 'Verifying...' : 'Verify OTP & Log In'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          /* REGISTRATION VIEW */
          <form onSubmit={handleRegister} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => setRegisterRole('GUEST')}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all text-center ${
                    registerRole === 'GUEST'
                      ? 'bg-emerald-600/40 border-emerald-400 text-white shadow-xs'
                      : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  Guest
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterRole('RESIDENT')}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all text-center ${
                    registerRole === 'RESIDENT'
                      ? 'bg-emerald-600/40 border-emerald-400 text-white shadow-xs'
                      : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  Resident
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterRole('PROVIDER')}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all text-center ${
                    registerRole === 'PROVIDER'
                      ? 'bg-blue-600/40 border-blue-400 text-white shadow-xs'
                      : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  Provider
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterRole('BUSINESS')}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all text-center ${
                    registerRole === 'BUSINESS'
                      ? 'bg-teal-600/40 border-teal-400 text-white shadow-xs'
                      : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  Local Business
                </button>
              </div>
            </div>

            {/* Apartment Selection (Required only for Resident, Provider, Business) */}
            {registerRole !== 'GUEST' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Target Apartment Community</label>
                <select
                  value={regCommunityId}
                  onChange={(e) => setRegCommunityId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/20 text-white text-xs font-medium"
                >
                  {communities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Anand Kulkarni"
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98450 00000"
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="anand@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Password *</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs"
                required
              />
            </div>

            {/* Role specific inputs */}
            {registerRole === 'RESIDENT' && (
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1">Block / Tower</label>
                  <input
                    type="text"
                    value={regBlock}
                    onChange={(e) => setRegBlock(e.target.value)}
                    placeholder="Tower B"
                    className="w-full px-2 py-1.5 rounded-lg bg-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1">Flat No.</label>
                  <input
                    type="text"
                    value={regFlat}
                    onChange={(e) => setRegFlat(e.target.value)}
                    placeholder="304"
                    className="w-full px-2 py-1.5 rounded-lg bg-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1">Resident Type</label>
                  <select
                    value={regResidentType}
                    onChange={(e) => setRegResidentType(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-800 text-white text-xs"
                  >
                    <option value="OWNER">Owner</option>
                    <option value="TENANT">Tenant</option>
                  </select>
                </div>
              </div>
            )}

            {(registerRole === 'PROVIDER' || registerRole === 'BUSINESS') && (
              <div className="space-y-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1">
                    {registerRole === 'PROVIDER' ? 'Trade / Business Name' : 'Store / Business Name *'}
                  </label>
                  <input
                    type="text"
                    value={regBusinessName}
                    onChange={(e) => setRegBusinessName(e.target.value)}
                    placeholder={registerRole === 'PROVIDER' ? 'e.g. Master Plumbing Works' : 'e.g. Namaste Fresh Mart'}
                    className="w-full px-2 py-1.5 rounded-lg bg-white/10 text-white text-xs"
                  />
                </div>

                {registerRole === 'BUSINESS' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">Business Category</label>
                    <select
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold"
                    >
                      <option value="GROCERY">Grocery & Supermarket</option>
                      <option value="PHARMACY">Pharmacy & Medical Store</option>
                      <option value="RESTAURANT">Restaurant & Eatery</option>
                      <option value="SALON">Salon & Grooming</option>
                      <option value="HARDWARE">Hardware & Electrical Supplies</option>
                      <option value="CLEANING_AGENCY">Cleaning Agency</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Submitting Application...' : 'Complete Registration'}
            </button>
          </form>
        )}

        <div className="text-center text-[11px] text-slate-400 pt-1">
          Zero phone leakage communication standards • Secure encrypted session
        </div>

      </div>

    </div>
  );
}
