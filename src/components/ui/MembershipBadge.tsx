import React from 'react';
import { Crown, Medal, Shield, Sparkles } from 'lucide-react';

export type MembershipTierType = 'GOLD' | 'SILVER' | 'BRONZE' | string;

interface MembershipBadgeProps {
  tier?: MembershipTierType | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function MembershipBadge({
  tier = 'BRONZE',
  size = 'md',
  showLabel = true,
  className = ''
}: MembershipBadgeProps) {
  const normalizedTier = (tier || 'BRONZE').toUpperCase();

  const configs = {
    GOLD: {
      label: 'Gold Member',
      shortLabel: 'Gold',
      icon: Crown,
      bg: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 border-amber-300 shadow-amber-500/20',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700/60',
      iconClass: 'text-amber-700 dark:text-amber-300 fill-amber-500'
    },
    SILVER: {
      label: 'Silver Partner',
      shortLabel: 'Silver',
      icon: Medal,
      bg: 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-slate-900 border-slate-300 shadow-slate-400/20',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
      iconClass: 'text-slate-600 dark:text-slate-300 fill-slate-400'
    },
    BRONZE: {
      label: 'Bronze Verified',
      shortLabel: 'Bronze',
      icon: Shield,
      bg: 'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-50 border-amber-600 shadow-amber-900/20',
      badgeClass: 'bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950/50 dark:text-orange-200 dark:border-orange-800/60',
      iconClass: 'text-amber-800 dark:text-amber-400'
    }
  };

  const current = configs[normalizedTier as keyof typeof configs] || configs.BRONZE;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-black'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border shadow-xs tracking-wide uppercase ${current.badgeClass} ${sizeClasses[size]} ${className}`}
      title={`${current.label} Tier`}
    >
      <Icon className={`${iconSizes[size]} ${current.iconClass} shrink-0`} />
      {showLabel && <span>{current.label}</span>}
    </span>
  );
}
