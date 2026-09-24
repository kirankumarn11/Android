import React, { useEffect, useState } from 'react';
import { Droplet, BellRing, Clock, ChevronRight, X, Volume2 } from 'lucide-react';
import { AppSettings } from '../types';
import { audioService, SOUND_PRESETS } from '../services/audioService';
import { notificationService } from '../services/notificationService';
import { Cup250Icon, Bottle500Icon, LargeBottle750Icon } from './ContainerIcons';

interface ReminderBannerProps {
  isOpen: boolean;
  settings: AppSettings;
  isRemindAgain: boolean;
  onLogCup: () => void;
  onLogBottle: () => void;
  onLogLargeBottle: () => void;
  onSnooze: (customMinutes?: number) => void;
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
  const [soundPlaying, setSoundPlaying] = useState(false);

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
            onSnooze(settings.snoozeDurationMinutes);
          } else {
            onDismiss();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, settings.autoSnoozeGracePeriodMinutes, settings.autoSnoozeIfNoInput, onSnooze, onDismiss, settings.snoozeDurationMinutes]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handlePlaySound = () => {
    setSoundPlaying(true);
    audioService.playSound(settings.soundType);
    setTimeout(() => setSoundPlaying(false), 1200);
  };

  const handleSendNotification = () => {
    notificationService.showNotification({
      title: '💧 HydroFlow Reminder',
      body: 'Time to drink water! Keep your hydration streak alive.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-[28px] bg-m3-surface-container border border-m3-outline-variant/40 p-5 sm:p-6 shadow-m3-3 text-m3-on-surface space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs shrink-0 ${
                isRemindAgain
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-m3-primary text-m3-on-primary'
              }`}
            >
              {isRemindAgain ? <BellRing className="w-6 h-6" /> : <Droplet className="w-6 h-6 fill-current" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-m3-primary-container text-m3-on-primary-container">
                  {isRemindAgain ? 'Follow-Up' : 'Hydration Alert'}
                </span>
                <span className="text-[11px] text-m3-on-surface-variant flex items-center gap-1 font-semibold">
                  <Clock className="w-3 h-3 text-amber-500" /> Auto-snooze {timeFormatted}
                </span>
              </div>
              <h2 className="text-base font-extrabold mt-0.5 text-m3-on-surface">
                {isRemindAgain
                  ? 'Missed your last glass! Drink up'
                  : 'Time to drink water!'}
              </h2>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="w-8 h-8 rounded-full flex items-center justify-center text-m3-on-surface-variant hover:bg-m3-surface-container-high transition cursor-pointer"
            title="Dismiss reminder"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Toolbar: NOTIFICATION BUTTON & SOUND BUTTON */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 gap-2">
          {/* Notification Button */}
          <button
            type="button"
            onClick={handleSendNotification}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-m3-surface-container border border-m3-outline-variant/40 hover:bg-m3-surface-container-high active:scale-95 text-xs font-bold text-m3-on-surface flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Send notification to device"
          >
            <BellRing className="w-3.5 h-3.5 text-m3-primary shrink-0" />
            <span>Notification</span>
          </button>

          {/* Sound Button */}
          <button
            type="button"
            onClick={handlePlaySound}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-m3-surface-container border border-m3-outline-variant/40 hover:bg-m3-surface-container-high active:scale-95 text-xs font-bold text-m3-on-surface flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Play reminder chime sound"
          >
            <Volume2 className={`w-3.5 h-3.5 text-m3-primary shrink-0 ${soundPlaying ? 'animate-bounce' : ''}`} />
            <span>
              Sound ({SOUND_PRESETS.find((s) => s.id === settings.soundType)?.name || settings.soundType})
            </span>
          </button>
        </div>

        <p className="text-xs text-m3-on-surface-variant leading-relaxed">
          Log a drink now to maintain your hydration streak and reset the timer:
        </p>

        {/* Primary Log Action Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Cup Button */}
          <button
            onClick={onLogCup}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 hover:border-m3-primary hover:bg-m3-surface-container text-center transition-all it-squircle-button group cursor-pointer"
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
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 hover:border-m3-primary hover:bg-m3-surface-container text-center transition-all it-squircle-button group cursor-pointer"
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
            className="flex-1 py-2 px-3 rounded-xl bg-m3-surface-container-low border border-m3-outline-variant/30 text-[11px] font-bold text-m3-on-surface hover:bg-m3-surface-container-high transition it-squircle-button flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LargeBottle750Icon className="w-4 h-4 text-m3-primary" />
            <span>Large ({settings.largeBottleVolume} {settings.unit})</span>
          </button>
          <button
            onClick={() => {
              onDismiss();
              onOpenCustomModal();
            }}
            className="py-2 px-3 rounded-xl bg-m3-surface-container-low border border-m3-outline-variant/30 text-[11px] font-bold text-m3-on-surface hover:bg-m3-surface-container-high transition it-squircle-button flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Custom</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SNOOZE SECTION: Highly Visible Snooze Button & Quick Snooze Options */}
        <div className="pt-3 border-t border-m3-outline-variant/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-m3-on-surface-variant flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Snooze Alert Options:</span>
            </span>

            {/* Quick snooze presets */}
            <div className="flex items-center gap-1">
              {[5, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => onSnooze(mins)}
                  className="px-2 py-0.5 rounded-lg bg-m3-surface-container-low border border-m3-outline-variant/40 hover:bg-amber-500 hover:text-white hover:border-transparent text-[10px] font-bold text-m3-on-surface transition cursor-pointer"
                  title={`Snooze for ${mins} minutes`}
                >
                  +{mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Primary High-Contrast Snooze Button */}
          <button
            type="button"
            onClick={() => onSnooze(settings.snoozeDurationMinutes)}
            className="w-full py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-extrabold text-xs shadow-xs transition it-squircle-button flex items-center justify-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Snooze for {settings.snoozeDurationMinutes} Minutes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
