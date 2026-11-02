'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Lock,
  Mail,
  Key,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchRole } = useApp();

  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<'RESIDENT' | 'PROVIDER'>('RESIDENT');
  const [email, setEmail] = useState('rahul.sharma@gmail.com');
  const [password, setPassword] = useState('Password123!');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.user);
      router.push('/');
    } catch (e: any) {
      setError(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      setError('Please fill out all registration fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          role,
          block: 'Tower C',
          flatNumber: '402',
          businessName: role === 'PROVIDER' ? `${name} Professional Services` : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      login(data.token, data.user);
      router.push(role === 'PROVIDER' ? '/provider/dashboard' : '/');
    } catch (e: any) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPersona = async (targetRole: 'RESIDENT' | 'PROVIDER' | 'MANAGEMENT' | 'ADMIN') => {
    try {
      setLoading(true);
      await switchRole(targetRole);
      router.push('/');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      
      {/* Full-Screen Premium Residential Photograph */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-ken-burns scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1800&q=80')`,
          filter: 'brightness(0.55) contrast(1.15)'
        }}
      />

      {/* Elegant Dark Glass Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/60" />

      {/* Glass-Style Login Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/15 p-6 sm:p-8 shadow-2xl text-white space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 mx-auto flex items-center justify-center text-white shadow-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Palm Heights Residences
          </h1>
          <p className="text-xs text-slate-300">
            Sign in to access your apartment community services
          </p>
        </div>

        {/* Demo Persona Quick Login Strip */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 text-center">
            One-Tap Instant Demo Login
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickPersona('RESIDENT')}
              className="px-2.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/30 text-emerald-200 text-xs font-bold transition-all text-left"
            >
              <div>Resident</div>
              <div className="text-[10px] font-normal text-slate-300">Rahul (B-304)</div>
            </button>

            <button
              onClick={() => handleQuickPersona('PROVIDER')}
              className="px-2.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 text-blue-200 text-xs font-bold transition-all text-left"
            >
              <div>Provider</div>
              <div className="text-[10px] font-normal text-slate-300">Ramesh (Plumbing)</div>
            </button>

            <button
              onClick={() => handleQuickPersona('MANAGEMENT')}
              className="px-2.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-purple-200 text-xs font-bold transition-all text-left"
            >
              <div>Management</div>
              <div className="text-[10px] font-normal text-slate-300">Sunita Deshmukh</div>
            </button>

            <button
              onClick={() => handleQuickPersona('ADMIN')}
              className="px-2.5 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/30 text-amber-200 text-xs font-bold transition-all text-left"
            >
              <div>Admin</div>
              <div className="text-[10px] font-normal text-slate-300">Vikramaditya Rao</div>
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

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={isRegister ? handleRegister : handleCustomLogin} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  I am registering as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('RESIDENT')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      role === 'RESIDENT'
                        ? 'bg-emerald-600/40 border-emerald-400 text-white'
                        : 'border-white/10 text-slate-400'
                    }`}
                  >
                    Resident
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('PROVIDER')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      role === 'PROVIDER'
                        ? 'bg-blue-600/40 border-blue-400 text-white'
                        : 'border-white/10 text-slate-400'
                    }`}
                  >
                    Service Provider
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Kulkarni"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98450 00000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@society.com"
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
            {loading ? 'Authenticating...' : isRegister ? 'Complete Registration' : 'Sign In to Campus Portal'}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-400 pt-1">
          By signing in, you agree to Palm Heights Condominium Society by-laws and zero phone leakage communication standards.
        </div>

      </div>

    </div>
  );
}
