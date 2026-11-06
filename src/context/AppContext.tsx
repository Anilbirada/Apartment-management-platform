'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, Translations } from '@/lib/i18n';
import { themeTokens, ThemeMode } from '@/lib/theme';

export type RoleType =
  | 'GUEST'
  | 'RESIDENT'
  | 'PROVIDER'
  | 'MANAGEMENT'
  | 'BUSINESS'
  | 'ADMIN'
  | 'SERVICE_PROVIDER'
  | 'SOCIETY_MANAGEMENT'
  | 'LOCAL_BUSINESS'
  | 'PLATFORM_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: RoleType;
  avatar?: string;
  phone?: string;
  status?: string;
  isVerified: boolean;
  communityId?: string;
  community?: any;
  apartment?: any;
  residentProfile?: any;
  providerProfile?: any;
  businessProfile?: any;
  communityMembers?: any[];
  subscriptions?: any[];
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  language: Language;
  theme: ThemeMode;
  t: Translations;
  unreadNotifications: number;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: ThemeMode) => void;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  switchRole: (role: RoleType) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const t = translations[language];

  // Initialize from storage or default
  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'hi' || savedLang === 'kn')) {
      setLanguageState(savedLang);
    }

    const savedTheme = localStorage.getItem('app_theme') as ThemeMode;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'festival')) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('light');
    }

    refreshUser();
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    root.classList.remove('dark', 'festival-theme');
    if (mode === 'dark') {
      root.classList.add('dark');
    } else if (mode === 'festival') {
      root.classList.add('festival-theme');
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('app_theme', mode);
    applyTheme(mode);
  };

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/v1/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        refreshNotifications();
      } else {
        // Public visitor mode: user remains null without forced authentication
        setUser(null);
      }
    } catch (e) {
      console.error('Failed to fetch current user', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = async () => {
    try {
      const res = await fetch('/api/v1/notifications');
      if (res.ok) {
        const data = await res.json();
        setUnreadNotifications(data.unreadCount || 0);
      }
    } catch (e) {
      // Ignore background notification fetch errors
    }
  };

  const login = (token: string, newUser: User) => {
    setUser(newUser);
    refreshNotifications();
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/login';
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  const switchRole = async (targetRole: RoleType) => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        refreshNotifications();
      }
    } catch (e) {
      console.error('Switch role error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        language,
        theme,
        t,
        unreadNotifications,
        setLanguage,
        setTheme,
        login,
        logout,
        switchRole,
        refreshUser,
        refreshNotifications,
      }}
    >
      <div className={`${themeTokens[theme].bgClass} min-h-screen ${themeTokens[theme].textClass} transition-colors duration-300 font-sans`}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
