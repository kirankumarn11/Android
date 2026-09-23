import React from 'react';
import { ThemeAccent, ThemeMode } from '../types';
import { Palette, Check, X, Sparkles, Sun, Moon, Monitor } from 'lucide-react';

interface MonetPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccent: ThemeAccent;
  onSelectAccent: (accent: ThemeAccent) => void;
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
}

export const MONET_PALETTES: {
  id: ThemeAccent;
  name: string;
  subtitle: string;
  primaryLight: string;
  containerLight: string;
  primaryDark: string;
  containerDark: string;
}[] = [
  {
    id: 'water',
    name: 'Ocean Water',
    subtitle: 'Crisp Azure',
    primaryLight: '#006495',
    containerLight: '#cbe6ff',
    primaryDark: '#8ecdff',
    containerDark: '#004b72',
  },
  {
    id: 'mint',
    name: 'Forest Mint',
    subtitle: 'Emerald Botanical',
    primaryLight: '#006b54',
    containerLight: '#8bf7d2',
    primaryDark: '#6fdaaf',
    containerDark: '#00513e',
  },
  {
    id: 'rose',
    name: 'Sakura Rose',
    subtitle: 'Blush Pastel',
    primaryLight: '#984061',
    containerLight: '#ffd9e2',
    primaryDark: '#ffb0ca',
    containerDark: '#7b2949',
  },
  {
    id: 'violet',
    name: 'Amethyst',
    subtitle: 'Material Lavender',
    primaryLight: '#6750a4',
    containerLight: '#eaddff',
    primaryDark: '#d0bcff',
    containerDark: '#4f378b',
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    subtitle: 'Warm Terracotta',
    primaryLight: '#8b5000',
    containerLight: '#ffdcbe',
    primaryDark: '#ffb870',
    containerDark: '#6b3b00',
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    subtitle: 'Minimal Slate',
    primaryLight: '#475569',
    containerLight: '#e2e8f0',
    primaryDark: '#cbd5e1',
    containerDark: '#334155',
  },
];

export const MonetPaletteModal: React.FC<MonetPaletteModalProps> = ({
  isOpen,
  onClose,
  currentAccent,
  onSelectAccent,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm rounded-[28px] bg-m3-surface-container border border-m3-outline-variant/40 p-5 shadow-m3-3 space-y-4 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-m3-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-m3-on-surface">Material Palette</h3>
              <p className="text-[11px] text-m3-on-surface-variant">Image Toolbox dynamic Monet colors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-m3-on-surface-variant hover:bg-m3-surface-container-high transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Accent Colors Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {MONET_PALETTES.map((palette) => {
            const isSelected = currentAccent === palette.id;
            return (
              <button
                key={palette.id}
                onClick={() => onSelectAccent(palette.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-m3-surface-container-highest border-m3-primary shadow-xs ring-2 ring-m3-primary/30'
                    : 'bg-m3-surface-container-low border-m3-outline-variant/30 hover:bg-m3-surface-container-high'
                }`}
              >
                {/* Dual-color swatch circle */}
                <div
                  className="w-8 h-8 rounded-full relative flex-shrink-0 overflow-hidden shadow-xs border border-black/10"
                  style={{ backgroundColor: palette.containerLight }}
                >
                  <div
                    className="absolute inset-y-0 right-0 w-1/2"
                    style={{ backgroundColor: palette.primaryLight }}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-m3-on-surface block truncate">
                    {palette.name}
                  </span>
                  <span className="text-[10px] text-m3-on-surface-variant block truncate">
                    {palette.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Theme Mode Segmented Selector */}
        <div className="pt-2 border-t border-m3-outline-variant/20">
          <span className="text-[11px] font-bold text-m3-on-surface-variant uppercase tracking-wider block mb-2 px-1">
            Display Mode
          </span>
          <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-m3-surface-container-lowest border border-m3-outline-variant/30">
            {[
              { id: 'light' as ThemeMode, label: 'Light', icon: Sun },
              { id: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
              { id: 'amoled' as ThemeMode, label: 'AMOLED', icon: Sparkles },
              { id: 'system' as ThemeMode, label: 'Auto', icon: Monitor },
            ].map((t) => {
              const Icon = t.icon;
              const isCurrent = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTheme(t.id)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition ${
                    isCurrent
                      ? 'bg-m3-primary text-m3-on-primary shadow-xs font-bold'
                      : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-high'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-m3-primary text-m3-on-primary font-bold text-xs shadow-xs hover:brightness-105 active:scale-98 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};
