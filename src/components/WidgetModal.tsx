import React, { useState } from 'react';
import { AppSettings, WaterLog } from '../types';
import { widgetService } from '../services/widgetService';
import { CompactWidgetView } from './CompactWidgetView';
import { Cup250Icon, Bottle500Icon } from './ContainerIcons';
import {
  X,
  LayoutGrid,
  ExternalLink,
  Flame,
  CheckCircle2,
  Smartphone,
  Monitor,
  Apple,
  AppWindow,
  Bell,
  Sparkles,
  Droplet,
  Layers,
  Share2,
} from 'lucide-react';

interface WidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  logs: WaterLog[];
  todayTotalMl: number;
  streak: number;
}

export const WidgetModal: React.FC<WidgetModalProps> = ({
  isOpen,
  onClose,
  settings,
  logs,
  todayTotalMl,
  streak,
}) => {
  const [selectedWidgetSize, setSelectedWidgetSize] = useState<'small' | 'medium' | 'lockscreen'>('medium');
  const [badgeStatus, setBadgeStatus] = useState<string | null>(null);
  const [floatingStatus, setFloatingStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const percentage = Math.min(100, Math.round((todayTotalMl / (settings.dailyGoal || 2500)) * 100));
  const remainingMl = Math.max(0, settings.dailyGoal - todayTotalMl);
  const remainingGlasses = Math.ceil(remainingMl / (settings.cupVolume || 250));

  const handleTestBadge = () => {
    if (widgetService.isAppBadgingSupported()) {
      widgetService.updateAppBadge(todayTotalMl, settings.dailyGoal, settings.cupVolume);
      setBadgeStatus(`Badge updated to "${remainingGlasses}" remaining glasses!`);
      setTimeout(() => setBadgeStatus(null), 3500);
    } else {
      setBadgeStatus('App Badging is active when installed as a PWA on your home screen!');
      setTimeout(() => setBadgeStatus(null), 3500);
    }
  };

  const handleLaunchFloating = async () => {
    setFloatingStatus('Launching widget...');
    const ok = await widgetService.launchFloatingWidget();
    if (ok) {
      setFloatingStatus('Floating widget opened!');
      setTimeout(() => setFloatingStatus(null), 3000);
    } else {
      setFloatingStatus('Opened standalone widget view');
      setTimeout(() => setFloatingStatus(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-m3-surface-container border border-m3-outline-variant/40 p-5 sm:p-7 shadow-m3-4 text-m3-on-surface space-y-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-m3-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-m3-primary text-m3-on-primary flex items-center justify-center shadow-m3-1 shrink-0">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-m3-primary-container text-m3-on-primary-container">
                  PWA Widget Support
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <h2 className="text-lg font-black text-m3-on-surface tracking-tight mt-0.5">
                Home Screen Progress Widgets
              </h2>
              <p className="text-xs text-m3-on-surface-variant">
                Glance at your daily hydration progress without opening the full application
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-m3-on-surface-variant hover:bg-m3-surface-container-high transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Widget Previews Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Widget Sizes</span>
            </span>

            {/* Size Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30">
              <button
                type="button"
                onClick={() => setSelectedWidgetSize('small')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedWidgetSize === 'small'
                    ? 'bg-m3-primary text-m3-on-primary shadow-xs'
                    : 'text-m3-on-surface-variant hover:text-m3-on-surface'
                }`}
              >
                Small (2x2)
              </button>
              <button
                type="button"
                onClick={() => setSelectedWidgetSize('medium')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedWidgetSize === 'medium'
                    ? 'bg-m3-primary text-m3-on-primary shadow-xs'
                    : 'text-m3-on-surface-variant hover:text-m3-on-surface'
                }`}
              >
                Medium (4x2)
              </button>
              <button
                type="button"
                onClick={() => setSelectedWidgetSize('lockscreen')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedWidgetSize === 'lockscreen'
                    ? 'bg-m3-primary text-m3-on-primary shadow-xs'
                    : 'text-m3-on-surface-variant hover:text-m3-on-surface'
                }`}
              >
                Lock Screen
              </button>
            </div>
          </div>

          {/* Widget Preview Container */}
          <div className="p-4 sm:p-6 rounded-[28px] bg-m3-surface-container-lowest border border-m3-outline-variant/30 flex items-center justify-center relative overflow-hidden">
            {/* Background phone/desktop wallpaper illusion */}
            <div className="absolute inset-0 bg-gradient-to-br from-m3-primary/5 via-transparent to-m3-primary/10 pointer-events-none" />

            {/* 1. Small (2x2) Widget Preview */}
            {selectedWidgetSize === 'small' && (
              <div className="w-48 h-48 rounded-[28px] bg-m3-surface-container-high border border-m3-outline-variant/40 p-4 shadow-m3-2 flex flex-col justify-between relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-m3-primary fill-current" />
                    <span className="text-[11px] font-extrabold uppercase text-m3-on-surface">HydroFlow</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500 font-extrabold text-[10px]">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>{streak}d</span>
                  </div>
                </div>

                <div className="text-center my-auto">
                  <div className="text-3xl font-black text-m3-on-surface tracking-tight">
                    {percentage}%
                  </div>
                  <div className="text-[11px] font-bold text-m3-primary">
                    {todayTotalMl} / {settings.dailyGoal} {settings.unit}
                  </div>
                  <div className="text-[10px] text-m3-on-surface-variant">
                    {remainingMl} {settings.unit} left
                  </div>
                </div>

                <div className="pt-2 border-t border-m3-outline-variant/25 flex items-center justify-between">
                  <span className="text-[9px] text-m3-on-surface-variant font-medium">Quick Log</span>
                  <div className="px-2 py-0.5 rounded-lg bg-m3-primary text-m3-on-primary text-[10px] font-bold">
                    +{settings.cupVolume}{settings.unit}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Medium (4x2) Banner Widget Preview */}
            {selectedWidgetSize === 'medium' && (
              <div className="w-full max-w-md rounded-[28px] bg-m3-surface-container-high border border-m3-outline-variant/40 p-5 shadow-m3-2 relative z-10 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-m3-primary text-m3-on-primary flex items-center justify-center shadow-xs">
                      <Droplet className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-m3-on-surface">
                        Daily Hydration
                      </h4>
                      <p className="text-[10px] text-m3-on-surface-variant">
                        {streak} day streak · {remainingGlasses} glasses remaining
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-m3-on-surface block leading-tight">
                      {percentage}%
                    </span>
                    <span className="text-[10px] font-bold text-m3-primary">
                      {todayTotalMl} / {settings.dailyGoal} {settings.unit}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-m3-surface-container-highest overflow-hidden">
                  <div
                    className="h-full bg-m3-primary transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Action Buttons inside widget */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 py-1.5 px-2.5 rounded-xl bg-m3-surface-container border border-m3-outline-variant/35 text-[11px] font-bold flex items-center justify-center gap-1.5 text-m3-on-surface shadow-xs">
                    <Cup250Icon className="w-3.5 h-3.5 text-m3-primary" />
                    <span>+{settings.cupVolume} {settings.unit} Cup</span>
                  </div>
                  <div className="flex-1 py-1.5 px-2.5 rounded-xl bg-m3-surface-container border border-m3-outline-variant/35 text-[11px] font-bold flex items-center justify-center gap-1.5 text-m3-on-surface shadow-xs">
                    <Bottle500Icon className="w-3.5 h-3.5 text-m3-primary" />
                    <span>+{settings.bottleVolume} {settings.unit} Bottle</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Lock Screen / Compact Pill Widget Preview */}
            {selectedWidgetSize === 'lockscreen' && (
              <div className="px-5 py-3 rounded-full bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-xl flex items-center gap-3 relative z-10">
                <Droplet className="w-5 h-5 text-sky-400 fill-sky-400 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-black flex items-center gap-1.5">
                    <span>{todayTotalMl} / {settings.dailyGoal} {settings.unit}</span>
                    <span className="text-sky-300">({percentage}%)</span>
                  </div>
                  <span className="text-[10px] text-gray-300 block">
                    {remainingMl} {settings.unit} left to reach daily goal
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls: POP OUT FLOATING WIDGET & APP BADGE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Floating Widget Button */}
          <button
            type="button"
            onClick={handleLaunchFloating}
            className="p-3.5 rounded-2xl bg-m3-primary text-m3-on-primary font-bold text-xs shadow-xs hover:brightness-105 active:scale-98 transition it-squircle-button flex items-center justify-center gap-2 cursor-pointer"
          >
            <AppWindow className="w-4 h-4" />
            <span>Launch Floating Desktop Widget</span>
          </button>

          {/* Test PWA Badge Button */}
          <button
            type="button"
            onClick={handleTestBadge}
            className="p-3.5 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/40 hover:bg-m3-surface-container-high text-xs font-bold text-m3-on-surface transition it-squircle-button flex items-center justify-center gap-2 cursor-pointer"
          >
            <Bell className="w-4 h-4 text-m3-primary" />
            <span>Test App Icon Badge ({remainingGlasses} Left)</span>
          </button>
        </div>

        {badgeStatus && (
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{badgeStatus}</span>
          </div>
        )}

        {floatingStatus && (
          <div className="p-3 rounded-xl bg-m3-primary/15 text-m3-primary text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{floatingStatus}</span>
          </div>
        )}

        {/* Step-by-Step Platform Guides */}
        <div className="rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>How to Use PWA Widgets on Your Device</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Android Guide */}
            <div className="p-3 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-m3-on-surface">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Android</span>
              </div>
              <p className="text-[11px] text-m3-on-surface-variant leading-relaxed">
                1. Install HydroFlow from the browser menu (<strong>Add to Home Screen</strong>).<br />
                2. Long-press home screen → tap <strong>Widgets</strong> → choose HydroFlow.<br />
                3. Long-press the app icon for 1-tap <strong>Log Cup</strong> & <strong>Log Bottle</strong> shortcuts.
              </p>
            </div>

            {/* iOS Guide */}
            <div className="p-3 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-m3-on-surface">
                <Apple className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
                <span>iPhone & iPad</span>
              </div>
              <p className="text-[11px] text-m3-on-surface-variant leading-relaxed">
                1. In Safari, tap the <strong>Share</strong> button.<br />
                2. Tap <strong>Add to Home Screen</strong>.<br />
                3. The home icon badge dynamically shows remaining glasses to drink today without opening the app!
              </p>
            </div>

            {/* Desktop Guide */}
            <div className="p-3 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-m3-on-surface">
                <Monitor className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Windows & Mac</span>
              </div>
              <p className="text-[11px] text-m3-on-surface-variant leading-relaxed">
                1. Click <strong>Install App</strong> in address bar.<br />
                2. Tap <strong>Launch Floating Desktop Widget</strong> above for an always-on-top compact tracker on your desktop.<br />
                3. Windows 11 Widgets Board integration active.
              </p>
            </div>
          </div>
        </div>

        {/* Standalone Widget Link */}
        <div className="flex items-center justify-between pt-2 border-t border-m3-outline-variant/20">
          <a
            href="/?mode=widget"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-m3-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open Standalone Widget URL in New Window</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-m3-surface-container border border-m3-outline-variant/40 text-xs font-bold text-m3-on-surface hover:bg-m3-surface-container-high transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
