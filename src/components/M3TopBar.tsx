import React, { useState } from 'react';
import { ThemeMode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { Droplet, Sun, Moon, Sparkles, Monitor, Bell } from 'lucide-react';

interface M3TopBarProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  streak: number;
  onOpenReminders: () => void;
  hasActiveReminder: boolean;
}

export const M3TopBar: React.FC<M3TopBarProps> = ({
  theme,
  onThemeChange,
  streak,
  onOpenReminders,
  hasActiveReminder,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const themeIcons: Record<ThemeMode, React.ReactNode> = {
    light: <Sun className="w-4 h-4 text-amber-500" />,
    dark: <Moon className="w-4 h-4 text-sky-400" />,
    amoled: <Sparkles className="w-4 h-4 text-purple-400" />,
    system: <Monitor className="w-4 h-4 text-m3-on-surface-variant" />,
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-m3-surface-container/80 backdrop-blur-md border-b border-m3-outline-variant/40 px-4 py-3 transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-m3-primary flex items-center justify-center text-m3-on-primary shadow-m3-1">
            <Droplet className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-lg text-m3-on-surface">HydroFlow</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-m3-primary-container text-m3-on-primary-container">
                M3
              </span>
            </div>
            <p className="text-[11px] text-m3-on-surface-variant font-medium -mt-0.5">Hydration & Reminders</p>
          </div>
        </div>

        {/* Center / Right actions */}
        <div className="flex items-center gap-2">
          {/* Streak Chip */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-500/20"
            title="Daily hydration streak"
          >
            <span>🔥</span>
            <span>{streak}d streak</span>
          </div>

          {/* Quick Reminder Bell Indicator */}
          <button
            onClick={onOpenReminders}
            className={`relative p-2 rounded-full transition-all m3-state-layer ${
              hasActiveReminder
                ? 'bg-m3-primary-container text-m3-on-primary-container'
                : 'text-m3-on-surface-variant hover:bg-m3-surface-container-high'
            }`}
            title="Interval Reminders & Snooze"
            aria-label="Interval Reminders"
          >
            <Bell className="w-4 h-4" />
            {hasActiveReminder && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-m3-primary animate-ping" />
            )}
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-full text-m3-on-surface-variant hover:bg-m3-surface-container-high m3-state-layer transition-all"
              title={`Current Theme: ${theme.toUpperCase()}`}
              aria-label="Select theme"
            >
              {themeIcons[theme]}
            </button>

            {showThemeMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowThemeMenu(false)}
                />
                <div className="absolute right-0 mt-2 z-50 w-36 rounded-2xl bg-m3-surface-container-high border border-m3-outline-variant p-1 shadow-m3-3 animate-in fade-in zoom-in-95">
                  {(['light', 'dark', 'amoled', 'system'] as ThemeMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        onThemeChange(mode);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                        theme === mode
                          ? 'bg-m3-primary text-m3-on-primary font-bold'
                          : 'text-m3-on-surface hover:bg-m3-surface-container-highest'
                      }`}
                    >
                      {themeIcons[mode]}
                      <span className="capitalize">{mode === 'amoled' ? 'OLED Dark' : mode}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
