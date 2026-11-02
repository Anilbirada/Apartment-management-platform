'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Search,
  Mic,
  MicOff,
  Sparkles,
  Briefcase,
  Wrench,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  MapPin
} from 'lucide-react';

export function ApartmentHero({
  onPostRequirement,
  onOfferService
}: {
  onPostRequirement: () => void;
  onOfferService: () => void;
}) {
  const router = useRouter();
  const { t, theme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEveningMode, setIsEveningMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);

  const handleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser. Please type your search.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      router.push(`/services?q=${encodeURIComponent(transcript)}`);
    };

    recognition.start();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isDarkAtmosphere = theme === 'dark' || isEveningMode;

  return (
    <div className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 mb-8 shadow-2xl transition-all duration-700 bg-slate-900 border border-slate-800">
      
      {/* Background Architectural Visual with Ken Burns Zoom & Sky Layers */}
      <div className="relative h-[480px] sm:h-[520px] lg:h-[560px] w-full overflow-hidden">
        
        {/* Layer 1: Sky Gradient (Day vs Evening lighting) */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            isDarkAtmosphere
              ? 'bg-gradient-to-b from-[#050a18] via-[#0d1630] to-[#162347]'
              : 'bg-gradient-to-b from-sky-400 via-sky-200 to-amber-100'
          }`}
        />

        {/* Layer 2: Drifting Clouds (CSS animated keyframe drift) */}
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen overflow-hidden">
          <div className="absolute top-6 left-0 w-[200%] h-32 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/60 via-white/20 to-transparent animate-cloud-drift" />
        </div>

        {/* Layer 3: Modern Indian High-Rise Apartment Building Image (Ken Burns Zoom) */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 animate-ken-burns scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80')`,
            filter: isDarkAtmosphere ? 'brightness(0.68) contrast(1.15) saturate(1.1)' : 'brightness(0.92) contrast(1.05)'
          }}
        />

        {/* Layer 4: Softly Illuminated Apartment Windows (Pulse effect in evening mode) */}
        {isDarkAtmosphere && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Illuminated window coordinates overlaid onto high-rise facade */}
            <div className="absolute top-[34%] left-[48%] w-3 h-4 bg-amber-300 rounded-[1px] animate-window-glow" />
            <div className="absolute top-[42%] left-[44%] w-3 h-4 bg-amber-200 rounded-[1px] animate-window-glow delay-300" />
            <div className="absolute top-[50%] left-[52%] w-3 h-4 bg-amber-400 rounded-[1px] animate-window-glow delay-700" />
            <div className="absolute top-[38%] left-[56%] w-3 h-4 bg-yellow-200 rounded-[1px] animate-window-glow delay-500" />
            <div className="absolute top-[58%] left-[46%] w-3 h-4 bg-amber-300 rounded-[1px] animate-window-glow delay-1000" />
            <div className="absolute top-[62%] left-[53%] w-3 h-4 bg-amber-100 rounded-[1px] animate-window-glow delay-200" />
          </div>
        )}

        {/* Layer 5: Foreground Decorative Leaves for Realistic Depth */}
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-950/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-teal-950/30 rounded-full blur-3xl pointer-events-none" />

        {/* Layer 6: Rich Gradient Overlay for Crisp Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/35" />

        {/* Top Controls: Evening / Day Lighting Switch & Community RERA Chip */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-xs text-white">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold tracking-wide">Palm Heights • Tower A, B, C, D</span>
          </div>

          <button
            onClick={() => setIsEveningMode(!isEveningMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-xs text-white hover:bg-black/60 transition-colors shadow-sm"
            title="Toggle between Day & Evening lighting mode"
          >
            {isDarkAtmosphere ? (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Evening Mode (Illuminated)</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Daylight Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Main Content: 1.2s First Load Reveal Animation */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-14 z-20 animate-hero-reveal">
          <div className="max-w-3xl space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Admin & Police Verified Community Providers</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {t.appName}
            </h1>

            <p className="text-sm sm:text-base text-slate-200 font-normal max-w-2xl leading-relaxed">
              {t.tagline}
            </p>

            {/* Smart Search Bar with Simulated Voice Input */}
            <form onSubmit={handleSearchSubmit} className="pt-2">
              <div className="relative flex items-center max-w-2xl">
                <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-12 pr-28 sm:pr-32 py-3.5 sm:py-4 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base font-medium shadow-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all border border-white/20"
                />

                <div className="absolute right-2 sm:right-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-2 rounded-xl transition-colors ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={isListening ? 'Listening...' : 'Voice Search (Tap & Speak)'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    type="submit"
                    className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
                  >
                    Find
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Action Entry Points: Offer a Service & Post a Requirement */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onOfferService}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-semibold transition-all hover:scale-102"
              >
                <Wrench className="w-4 h-4 text-emerald-400" />
                <span>{t.offerService}</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/60" />
              </button>

              {/* Requirement is strictly distinct (purple/indigo) */}
              <button
                onClick={onPostRequirement}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 backdrop-blur-md border border-purple-400/40 text-purple-200 text-xs sm:text-sm font-bold transition-all hover:scale-102"
              >
                <Briefcase className="w-4 h-4 text-purple-300" />
                <span>{t.postRequirement} (Hire)</span>
                <ChevronRight className="w-3.5 h-3.5 text-purple-300/60" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
