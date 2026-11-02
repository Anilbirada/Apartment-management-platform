export type ThemeMode = 'light' | 'dark' | 'festival';

export interface ThemeConfig {
  mode: ThemeMode;
  bgClass: string;
  cardClass: string;
  textClass: string;
  primaryClass: string;
  borderClass: string;
  accentClass: string;
}

export const themeTokens: Record<ThemeMode, ThemeConfig> = {
  light: {
    mode: 'light',
    bgClass: 'bg-[#faf8f5]',
    cardClass: 'bg-white border-[#e8e4dc] shadow-sm',
    textClass: 'text-slate-900',
    primaryClass: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    borderClass: 'border-slate-200',
    accentClass: 'text-amber-600',
  },
  dark: {
    mode: 'dark',
    bgClass: 'bg-[#0a0f1d]',
    cardClass: 'bg-[#111827] border-slate-800 shadow-md',
    textClass: 'text-slate-100',
    primaryClass: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    borderClass: 'border-slate-800',
    accentClass: 'text-amber-400',
  },
  festival: {
    mode: 'festival',
    bgClass: 'bg-[#4a0419]',
    cardClass: 'bg-[#5c0921] border-[#881337] shadow-lg text-amber-50',
    textClass: 'text-amber-100',
    primaryClass: 'bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold',
    borderClass: 'border-amber-500/30',
    accentClass: 'text-amber-300',
  },
};
