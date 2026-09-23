import React, { useEffect, useState } from 'react';
import { Droplet, BellRing, Clock, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { AppSettings } from '../types';

interface ReminderBannerProps {
  isOpen: boolean;
  settings: AppSettings;
  isRemindAgain: boolean;
  onLogCup: () => void;
  onLogBottle: () => void;
  onLogLargeBottle: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
  onOpenCustomModal: () => void;
}

export const ReminderBanner: React.FC<ReminderBannerProps> = ({
  isOpen,
  settings,
  isRemindAgain,
  onLogCup,
  onLogBottle,
  onLogLargeBottle,
  onSnooze,
  onDismiss,
  onOpenCustomModal,
}) => {
  // Grace period before auto-snooze kicks in if no input is detected
  const [secondsRemaining, setSecondsRemaining] = useState(
    settings.autoSnoozeGracePeriodMinutes * 60
  );

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(settings.autoSnoozeGracePeriodMinutes * 60);
      return;
    }

    // Reset timer on open
    setSecondsRemaining(settings.autoSnoozeGracePeriodMinutes * 60);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // If auto-snooze is enabled and no input detected, automatically snooze!
          if (settings.autoSnoozeIfNoInput) {
            onSnooze();
          } else {
            onDismiss();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, settings.autoSnoozeGracePeriodMinutes, settings.autoSnoozeIfNoInput, onSnooze, onDismiss]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-m3-surface-container-high border-2 border-m3-primary/30 p-6 shadow-m3-3 text-m3-on-surface">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-m3-1 ${
              isRemindAgain
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-m3-primary text-m3-on-primary'
            }`}>
              {isRemindAgain ? <BellRing className="w-6 h-6" /> : <Droplet className="w-6 h-6 fill-current" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-m3-primary-container text-m3-on-primary-container">
                  {isRemindAgain ? 'Follow-Up Reminder' : 'Hydration Alert'}
                </span>
                <span className="text-[11px] text-m3-on-surface-variant flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Auto-snooze {timeFormatted}
                </span>
              </div>
              <h2 className="text-lg font-bold mt-1 text-m3-on-surface">
                {isRemindAgain
                  ? 'Missed your last glass! Drink up'
                  : 'Time to hydrate! Drink water'}
              </h2>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-full text-m3-on-surface-variant hover:bg-m3-surface-variant transition"
            title="Dismiss reminder"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-3 text-xs text-m3-on-surface-variant leading-relaxed">
          Did you drink a standard cup or a bottle? Logging your intake keeps your hydration streak alive and resets your next interval reminder!
        </p>

        {/* Primary Log Action Cards */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {/* Cup Button */}
          <button
            onClick={onLogCup}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-m3-surface-container-highest border border-m3-outline-variant/60 hover:border-m3-primary hover:bg-m3-primary-container/30 active:scale-95 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-m3-primary/10 dark:bg-m3-primary/20 flex items-center justify-center text-m3-primary group-hover:scale-110 transition">
              <span className="text-xl">☕</span>
            </div>
            <span className="mt-2 text-xs font-bold text-m3-on-surface">Standard Cup</span>
            <span className="text-[11px] font-semibold text-m3-primary">
              {settings.cupVolume} {settings.unit}
            </span>
          </button>

          {/* Bottle Button */}
          <button
            onClick={onLogBottle}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-m3-surface-container-highest border border-m3-outline-variant/60 hover:border-m3-primary hover:bg-m3-primary-container/30 active:scale-95 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-m3-primary/10 dark:bg-m3-primary/20 flex items-center justify-center text-m3-primary group-hover:scale-110 transition">
              <span className="text-xl">🍶</span>
            </div>
            <span className="mt-2 text-xs font-bold text-m3-on-surface">Water Bottle</span>
            <span className="text-[11px] font-semibold text-m3-primary">
              {settings.bottleVolume} {settings.unit}
            </span>
          </button>
        </div>

        {/* Secondary log actions: Large bottle & custom */}
        <div className="mt-2.5 flex items-center gap-2">
          <button
            onClick={onLogLargeBottle}
            className="flex-1 py-2 px-3 rounded-xl bg-m3-surface-container border border-m3-outline-variant/50 text-[11px] font-semibold text-m3-on-surface hover:bg-m3-surface-container-highest active:scale-95 transition flex items-center justify-center gap-1.5"
          >
            <span>Large Bottle ({settings.largeBottleVolume}{settings.unit})</span>
          </button>
          <button
            onClick={() => {
              onDismiss();
              onOpenCustomModal();
            }}
            className="py-2 px-3 rounded-xl bg-m3-surface-container border border-m3-outline-variant/50 text-[11px] font-semibold text-m3-on-surface hover:bg-m3-surface-container-highest active:scale-95 transition flex items-center justify-center gap-1"
          >
            <span>Custom Amount</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Snooze & Delay Controls */}
        <div className="mt-5 pt-4 border-t border-m3-outline-variant/40 flex items-center justify-between gap-3">
          <div className="text-[11px] text-m3-on-surface-variant flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Auto-snooze if idle: {settings.snoozeDurationMinutes}m</span>
          </div>

          <button
            onClick={onSnooze}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-m3-secondary-container text-m3-on-secondary-container text-xs font-bold hover:brightness-105 active:scale-95 transition shadow-xs"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Snooze ({settings.snoozeDurationMinutes}m)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
