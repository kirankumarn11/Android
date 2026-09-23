import React, { useEffect, useState } from 'react';
import { Droplet, BellRing, Clock, ChevronRight, X } from 'lucide-react';
import { AppSettings } from '../types';
import { Cup250Icon, Bottle500Icon, LargeBottle750Icon } from './ContainerIcons';

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
  const [secondsRemaining, setSecondsRemaining] = useState(
    settings.autoSnoozeGracePeriodMinutes * 60
  );

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(settings.autoSnoozeGracePeriodMinutes * 60);
      return;
    }

    setSecondsRemaining(settings.autoSnoozeGracePeriodMinutes * 60);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
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
      <div className="w-full max-w-md rounded-[28px] bg-m3-surface-container border border-m3-outline-variant/40 p-5 sm:p-6 shadow-m3-3 text-m3-on-surface space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs shrink-0 ${
              isRemindAgain
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-m3-primary text-m3-on-primary'
            }`}>
              {isRemindAgain ? <BellRing className="w-6 h-6" /> : <Droplet className="w-6 h-6 fill-current" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-m3-primary-container text-m3-on-primary-container">
                  {isRemindAgain ? 'Follow-Up' : 'Hydration Alert'}
                </span>
                <span className="text-[11px] text-m3-on-surface-variant flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Auto-snooze {timeFormatted}
                </span>
              </div>
              <h2 className="text-base font-bold mt-0.5 text-m3-on-surface">
                {isRemindAgain
                  ? 'Missed your last glass! Drink up'
                  : 'Time to drink water!'}
              </h2>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="w-8 h-8 rounded-full flex items-center justify-center text-m3-on-surface-variant hover:bg-m3-surface-container-high transition"
            title="Dismiss reminder"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-m3-on-surface-variant leading-relaxed">
          Log a cup or bottle now to maintain your daily streak and reset the timer.
        </p>

        {/* Primary Log Action Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Cup Button */}
          <button
            onClick={onLogCup}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 hover:border-m3-primary hover:bg-m3-surface-container text-center transition-all it-squircle-button group"
          >
            <div className="w-10 h-10 rounded-2xl bg-m3-surface-container-high text-m3-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <Cup250Icon className="w-6 h-6" />
            </div>
            <span className="mt-2 text-xs font-bold text-m3-on-surface">Cup</span>
            <span className="text-[11px] font-bold text-m3-primary">
              +{settings.cupVolume} {settings.unit}
            </span>
          </button>

          {/* Bottle Button */}
          <button
            onClick={onLogBottle}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 hover:border-m3-primary hover:bg-m3-surface-container text-center transition-all it-squircle-button group"
          >
            <div className="w-10 h-10 rounded-2xl bg-m3-surface-container-high text-m3-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <Bottle500Icon className="w-6 h-6" />
            </div>
            <span className="mt-2 text-xs font-bold text-m3-on-surface">Bottle</span>
            <span className="text-[11px] font-bold text-m3-primary">
              +{settings.bottleVolume} {settings.unit}
            </span>
          </button>
        </div>

        {/* Secondary log actions: Large bottle & custom */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLogLargeBottle}
            className="flex-1 py-2 px-3 rounded-xl bg-m3-surface-container-low border border-m3-outline-variant/30 text-[11px] font-semibold text-m3-on-surface hover:bg-m3-surface-container-high transition it-squircle-button flex items-center justify-center gap-1.5"
          >
            <LargeBottle750Icon className="w-4 h-4 text-m3-primary" />
            <span>Large ({settings.largeBottleVolume} {settings.unit})</span>
          </button>
          <button
            onClick={() => {
              onDismiss();
              onOpenCustomModal();
            }}
            className="py-2 px-3 rounded-xl bg-m3-surface-container-low border border-m3-outline-variant/30 text-[11px] font-semibold text-m3-on-surface hover:bg-m3-surface-container-high transition it-squircle-button flex items-center justify-center gap-1"
          >
            <span>Custom</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Snooze & Delay Controls */}
        <div className="pt-3 border-t border-m3-outline-variant/20 flex items-center justify-between gap-3">
          <div className="text-[11px] text-m3-on-surface-variant flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Idle delay: {settings.snoozeDurationMinutes}m</span>
          </div>

          <button
            onClick={onSnooze}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-m3-primary text-m3-on-primary text-xs font-bold shadow-xs hover:brightness-105 transition it-squircle-button"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Snooze ({settings.snoozeDurationMinutes}m)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
