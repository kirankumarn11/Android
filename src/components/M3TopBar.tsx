import React, { useState } from 'react';
import { ThemeAccent, ThemeMode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { MonetPaletteModal } from './MonetPaletteModal';
import { Droplet, Palette, Bell, Flame } from 'lucide-react';

interface M3TopBarProps {
  theme: ThemeMode;
  themeAccent: ThemeAccent;
  onThemeChange: (theme: ThemeMode) => void;
  onAccentChange: (accent: ThemeAccent) => void;
  streak: number;
  onOpenReminders: () => void;
  hasActiveReminder: boolean;
}

export const M3TopBar: React.FC<M3TopBarProps> = ({
  theme,
  themeAccent,
  onThemeChange,
  onAccentChange,
  streak,
  onOpenReminders,
  hasActiveReminder,
}) => {
  const [showPaletteModal, setShowPaletteModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-m3-surface/90 backdrop-blur-md border-b border-m3-outline-variant/25 px-4 py-3 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Brand - Image Toolbox style icon and typography */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-m3-primary text-m3-on-primary flex items-center justify-center shadow-m3-1 shrink-0">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold tracking-tight text-lg text-m3-on-surface">
                  HydroFlow
                </h1>
              </div>
              <p className="text-[11px] text-m3-on-surface-variant font-medium -mt-0.5">
                Simple Water Tracker
              </p>
            </div>
          </div>

          {/* Right actions: Squircle Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Daily Streak Indicator */}
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-m3-surface-container-high border border-m3-outline-variant/30 text-xs font-bold text-m3-on-surface"
              title="Daily hydration streak"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{streak}d</span>
            </div>

            {/* Interval Reminder Bell Button */}
            <button
              onClick={onOpenReminders}
              className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all it-squircle-button ${
                hasActiveReminder
                  ? 'bg-m3-primary-container text-m3-on-primary-container ring-2 ring-m3-primary/40'
                  : 'bg-m3-surface-container-low text-m3-on-surface border border-m3-outline-variant/30 hover:bg-m3-surface-container-high'
              }`}
              title="Hydration Reminders"
              aria-label="Hydration Reminders"
            >
              <Bell className="w-4 h-4" />
              {hasActiveReminder && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-m3-primary animate-ping" />
              )}
            </button>

            {/* Monet Dynamic Palette Switcher Button */}
            <button
              onClick={() => setShowPaletteModal(true)}
              className="w-10 h-10 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 hover:bg-m3-surface-container-high text-m3-on-surface flex items-center justify-center transition-all it-squircle-button"
              title="Change Material You color palette & theme"
              aria-label="Color Palette"
            >
              <Palette className="w-4 h-4 text-m3-primary" />
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Palette / Theme Modal */}
      <MonetPaletteModal
        isOpen={showPaletteModal}
        onClose={() => setShowPaletteModal(false)}
        currentAccent={themeAccent}
        onSelectAccent={onAccentChange}
        currentTheme={theme}
        onSelectTheme={onThemeChange}
      />
    </>
  );
};
