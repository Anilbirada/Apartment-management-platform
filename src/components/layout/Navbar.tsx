'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Building2,
  Wrench,
  UserCheck,
  Bell,
  MessageSquare,
  ShieldAlert,
  Moon,
  Sun,
  Sparkles,
  ChevronDown,
  LogOut,
  PlusCircle,
  Briefcase,
  Store,
  QrCode,
  DollarSign,
  Layers,
  Menu,
  X,
  CheckCircle2,
  User,
  SlidersHorizontal
} from 'lucide-react';
import { themeTokens } from '@/lib/theme';

export function Navbar() {
  const pathname = usePathname();
  const {
    user,
    theme,
    setTheme,
    language,
    setLanguage,
    t,
    unreadNotifications,
    switchRole,
    logout
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/v1/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {}
  };

  const handleToggleNotif = () => {
    if (!notifMenuOpen) {
      fetchNotifications();
    }
    setNotifMenuOpen(!notifMenuOpen);
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/v1/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      });
      fetchNotifications();
    } catch (e) {}
  };

  const roleLabels: Record<string, { label: string; color: string }> = {
    RESIDENT: { label: 'Apartment Resident', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    PROVIDER: { label: 'Service Provider', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    MANAGEMENT: { label: 'Society Management', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
    BUSINESS: { label: 'Local Business', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
    ADMIN: { label: 'Platform Admin', color: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300' },
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200 border-black/5 dark:border-white/10 bg-white/90 dark:bg-[#0a0f1d]/90">
      {/* Festival Top Ribbon if Festival theme is active */}
      {theme === 'festival' && (
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 text-white text-xs py-1 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
          <span>{t.festivalGreeting}</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Community Identity */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-800 to-teal-700 dark:from-emerald-400 dark:to-cyan-300 bg-clip-text text-transparent">
                  Palm Heights
                </span>
                <span className="hidden sm:block text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                  Enterprise Platform
                </span>
              </div>
            </Link>

            {/* Current Community Tag */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/60 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>{user?.community?.name || 'Palm Heights Campus (280 Units)'}</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            <Link
              href="/"
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                pathname === '/'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              {t.home}
            </Link>

            <Link
              href="/services"
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                pathname.startsWith('/services')
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              {t.services}
            </Link>

            {!user ? (
              <>
                <Link
                  href="/#businesses"
                  className="px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all"
                >
                  Local Businesses
                </Link>
                <Link
                  href="/#communities"
                  className="px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all"
                >
                  Communities
                </Link>
                <Link
                  href="/#how-it-works"
                  className="px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all"
                >
                  How It Works
                </Link>
              </>
            ) : (
              <>
                {/* Feature 5: Requirements - Dedicated violet accent */}
                <Link
                  href="/requirements"
                  className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center gap-1 ${
                    pathname.startsWith('/requirements')
                      ? 'bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800'
                      : 'text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Hire Helpers</span>
                </Link>

                <Link
                  href="/requests"
                  className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                    pathname.startsWith('/requests')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {t.requests}
                </Link>

                <Link
                  href="/messages"
                  className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center gap-1 ${
                    pathname.startsWith('/messages')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t.messages}</span>
                </Link>
              </>
            )}

            {/* Role 3: Service Provider Quick Links */}
            {user?.role === 'PROVIDER' && (
              <Link
                href="/provider/dashboard"
                className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-bold flex items-center gap-1 ${
                  pathname.startsWith('/provider')
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                    : 'text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Provider Hub</span>
              </Link>
            )}

            {/* Role 4: Local Business Quick Links */}
            {user?.role === 'BUSINESS' && (
              <Link
                href="/business/dashboard"
                className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-bold flex items-center gap-1 ${
                  pathname.startsWith('/business')
                    ? 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300'
                    : 'text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Business Hub</span>
              </Link>
            )}

            {/* Role 2: Society Management Quick Links */}
            {user?.role === 'MANAGEMENT' && (
              <Link
                href="/management/dashboard"
                className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-bold flex items-center gap-1 ${
                  pathname.startsWith('/management')
                    ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300'
                    : 'text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Society Portal</span>
              </Link>
            )}

            {/* Role 5: Platform Admin Quick Links */}
            {user?.role === 'ADMIN' && (
              <>
                <Link
                  href="/admin"
                  className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-bold flex items-center gap-1 ${
                    pathname === '/admin'
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                      : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>

                <Link
                  href="/admin/monetization"
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                    pathname.startsWith('/admin/monetization')
                      ? 'bg-emerald-100 text-emerald-900 font-bold'
                      : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50'
                  }`}
                  title="Revenue & Subscriptions"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Monetization</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Controls: Role Switcher, Theme, Lang, Notifications, User */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Interactive Demo Role Switcher (5 User Roles) */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold shadow-xs hover:border-slate-400 transition-colors bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                title="Switch between 5 roles: Resident, Provider, Society Management, Local Business, Platform Admin"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Role:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {user?.role || 'RESIDENT'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 py-1">
                    Select Role Persona (5 Roles)
                  </div>
                  {(['RESIDENT', 'PROVIDER', 'MANAGEMENT', 'BUSINESS', 'ADMIN'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                        user?.role === r
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{roleLabels[r]?.label}</div>
                        <div className="text-[10px] font-normal text-slate-400">
                          {r === 'RESIDENT' && 'Rahul Sharma (Tower B-304)'}
                          {r === 'PROVIDER' && 'Ramesh Kumar (Plumber)'}
                          {r === 'MANAGEMENT' && 'Sunita Deshmukh (Estate Office)'}
                          {r === 'BUSINESS' && 'Rohan Singhal (Namaste Fresh)'}
                          {r === 'ADMIN' && 'Vikramaditya Rao (Platform)'}
                        </div>
                      </div>
                      {user?.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="p-1.5 rounded-lg border text-xs font-semibold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Select language"
              >
                {language === 'en' ? 'EN' : language === 'hi' ? 'HI' : 'KN'}
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-1 z-50">
                  <button
                    onClick={() => { setLanguage('en'); setLangMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); setLangMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    हिन्दी
                  </button>
                  <button
                    onClick={() => { setLanguage('kn'); setLangMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    ಕನ್ನಡ
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                if (theme === 'light') setTheme('dark');
                else if (theme === 'dark') setTheme('festival');
                else setTheme('light');
              }}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              title={`Active Theme: ${theme.toUpperCase()}`}
            >
              {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
              {theme === 'dark' && <Moon className="w-4 h-4 text-cyan-400" />}
              {theme === 'festival' && <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={handleToggleNotif}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative"
              >
                <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {notifMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <span className="text-sm font-bold">Notifications</span>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No new notifications
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl text-xs transition-colors ${
                            !n.isRead
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40'
                              : 'bg-slate-50 dark:bg-slate-800/40'
                          }`}
                        >
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {n.title}
                          </div>
                          <div className="text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                            {n.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar & Sign Out or Sign In / Sign Up */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-emerald-500 object-cover"
                />
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login"
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=register"
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-3 space-y-2 bg-white dark:bg-slate-900 shadow-xl">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {t.home}
          </Link>
          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {t.services}
          </Link>

          {!user ? (
            <>
              <Link
                href="/#businesses"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Local Businesses
              </Link>
              <Link
                href="/#communities"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Communities
              </Link>
              <Link
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                How It Works
              </Link>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Sign Up
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/requirements"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40"
              >
                Hire Helpers (Requirements)
              </Link>
              <Link
                href="/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t.requests}
              </Link>
              <Link
                href="/messages"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t.messages}
              </Link>
            </>
          )}
          {user?.role === 'PROVIDER' && (
            <Link
              href="/provider/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40"
            >
              Provider Hub
            </Link>
          )}
          {user?.role === 'BUSINESS' && (
            <Link
              href="/business/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-teal-600 bg-teal-50 dark:bg-teal-950/40"
            >
              Local Business Hub
            </Link>
          )}
          {user?.role === 'MANAGEMENT' && (
            <Link
              href="/management/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/40"
            >
              Society Management Portal
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40"
              >
                Platform Admin Console
              </Link>
              <Link
                href="/admin/monetization"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
              >
                Monetization & Revenue
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
