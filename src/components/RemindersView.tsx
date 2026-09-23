import React, { useState } from 'react';
import { AppSettings, ReminderState } from '../types';
import { notificationService } from '../services/notificationService';
import { audioService } from '../services/audioService';
import {
  BellRing,
  Clock,
  Volume2,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  ShieldCheck,
  Moon,
} from 'lucide-react';

interface RemindersViewProps {
  settings: AppSettings;
  reminderState: ReminderState;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onTriggerTestReminder: () => void;
  onResetIntervalTimer: () => void;
  countdownText: string;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  settings,
  reminderState,
  onUpdateSettings,
  onTriggerTestReminder,
  onResetIntervalTimer,
  countdownText,
}) => {
  const [permissionStatus, setPermissionStatus] = useState(
    notificationService.getPermissionStatus()
  );
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  const handleRequestPermission = async () => {
    const res = await notificationService.requestPermission();
    setPermissionStatus(res);
    if (res === 'granted') {
      onUpdateSettings({ notificationsAllowed: true });
    }
  };

  const handlePlaySound = (type: AppSettings['soundType']) => {
    audioService.playSound(type);
  };

  const intervalPresets = [30, 45, 60, 90, 120, 180];
  const snoozePresets = [5, 10, 15, 20, 30];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="px-1">
        <h2 className="text-xl font-extrabold text-m3-on-surface flex items-center gap-2">
          <BellRing className="w-5 h-5 text-m3-primary" />
          <span>Interval Reminders</span>
        </h2>
        <p className="text-xs text-m3-on-surface-variant mt-0.5">
          Custom intervals, smart auto-snooze, and gentle chimes
        </p>
      </div>

      {/* Live Timer Status Hero Card */}
      <div className="rounded-[28px] bg-m3-surface-container-low border border-m3-outline-variant/35 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-m3-primary text-m3-on-primary flex items-center justify-center shadow-xs shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-m3-primary block">
                {reminderState.isSnoozed ? 'Snooze Mode Active' : 'Countdown to Next Drink'}
              </span>
              <p className="text-2xl font-black text-m3-on-surface tracking-tight mt-0.5">
                {countdownText}
              </p>
              <p className="text-xs text-m3-on-surface-variant">
                {reminderState.isSnoozed
                  ? `Snoozed for ${settings.snoozeDurationMinutes}m.`
                  : `Interval: ${settings.reminderIntervalMinutes}m · Active: ${settings.activeHoursStart} - ${settings.activeHoursEnd}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetIntervalTimer}
              className="px-3.5 py-2 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/30 text-xs font-semibold text-m3-on-surface hover:bg-m3-surface-container-high transition it-squircle-button flex items-center gap-1.5"
              title="Reset current interval"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={() => {
                setTestNotificationSent(true);
                onTriggerTestReminder();
                setTimeout(() => setTestNotificationSent(false), 3000);
              }}
              className="px-4 py-2 rounded-2xl bg-m3-primary text-m3-on-primary text-xs font-bold shadow-xs hover:brightness-105 transition it-squircle-button flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testNotificationSent ? 'Sent!' : 'Test'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Group Card */}
      <div className="rounded-[28px] bg-m3-surface-container-low border border-m3-outline-variant/35 p-5 sm:p-6 space-y-6 shadow-xs">
        {/* Master Enabled Switch */}
        <div className="flex items-center justify-between pb-5 border-b border-m3-outline-variant/20">
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-m3-on-surface block">
              Enable Interval Notifications
            </span>
            <span className="text-xs text-m3-on-surface-variant">
              Keep reminders active throughout the day to meet your goal
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.reminderEnabled}
              onChange={(e) => onUpdateSettings({ reminderEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-7 bg-m3-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-m3-primary shadow-inner"></div>
          </label>
        </div>

        {/* Interval Duration */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-m3-primary block">
                Reminder Interval
              </label>
              <span className="text-xs text-m3-on-surface-variant">
                Time between consecutive reminders
              </span>
            </div>
            <span className="text-sm font-extrabold text-m3-on-surface">
              Every {settings.reminderIntervalMinutes} min
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {intervalPresets.map((mins) => (
              <button
                key={mins}
                onClick={() => onUpdateSettings({ reminderIntervalMinutes: mins })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition it-squircle-button ${
                  settings.reminderIntervalMinutes === mins
                    ? 'bg-m3-primary text-m3-on-primary font-bold shadow-xs'
                    : 'bg-m3-surface-container text-m3-on-surface border border-m3-outline-variant/30 hover:bg-m3-surface-container-high'
                }`}
              >
                {mins < 60 ? `${mins} min` : `${mins / 60} hr`}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min="15"
              max="240"
              step="5"
              value={settings.reminderIntervalMinutes}
              onChange={(e) => onUpdateSettings({ reminderIntervalMinutes: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Personal Snooze Duration */}
        <div className="pt-4 border-t border-m3-outline-variant/20">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-m3-primary block">
                Personal Snooze Duration
              </label>
              <span className="text-xs text-m3-on-surface-variant">
                Delay time when you tap snooze
              </span>
            </div>
            <span className="text-sm font-extrabold text-m3-on-surface">
              {settings.snoozeDurationMinutes} min
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {snoozePresets.map((mins) => (
              <button
                key={mins}
                onClick={() => onUpdateSettings({ snoozeDurationMinutes: mins })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition it-squircle-button ${
                  settings.snoozeDurationMinutes === mins
                    ? 'bg-m3-primary text-m3-on-primary font-bold shadow-xs'
                    : 'bg-m3-surface-container text-m3-on-surface border border-m3-outline-variant/30 hover:bg-m3-surface-container-high'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min="2"
              max="60"
              step="1"
              value={settings.snoozeDurationMinutes}
              onChange={(e) => onUpdateSettings({ snoozeDurationMinutes: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Remind Once Again If No Input Detected */}
        <div className="pt-4 border-t border-m3-outline-variant/20 flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-m3-on-surface block">
              Auto-Snooze & Remind Once More
            </span>
            <p className="text-xs text-m3-on-surface-variant leading-relaxed">
              If an alert is triggered and no drink is logged within your snooze duration, HydroFlow alerts you once more.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={settings.autoSnoozeIfNoInput}
              onChange={(e) => onUpdateSettings({ autoSnoozeIfNoInput: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-7 bg-m3-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-m3-primary shadow-inner"></div>
          </label>
        </div>

        {/* Active Hours */}
        <div className="pt-4 border-t border-m3-outline-variant/20">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-4 h-4 text-m3-primary" />
            <label className="text-xs font-bold uppercase tracking-wider text-m3-primary">
              Active Hours (Do Not Disturb at Night)
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="p-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/30">
              <span className="text-[11px] text-m3-on-surface-variant block mb-1">Start Time</span>
              <input
                type="time"
                value={settings.activeHoursStart}
                onChange={(e) => onUpdateSettings({ activeHoursStart: e.target.value })}
                className="w-full px-2 py-1 rounded-xl bg-m3-surface-container-highest font-bold text-m3-on-surface text-sm border-none focus:outline-none"
              />
            </div>
            <div className="p-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/30">
              <span className="text-[11px] text-m3-on-surface-variant block mb-1">End Time</span>
              <input
                type="time"
                value={settings.activeHoursEnd}
                onChange={(e) => onUpdateSettings({ activeHoursEnd: e.target.value })}
                className="w-full px-2 py-1 rounded-xl bg-m3-surface-container-highest font-bold text-m3-on-surface text-sm border-none focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Audio Chime Selection */}
        <div className="pt-4 border-t border-m3-outline-variant/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-m3-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-m3-primary">
                Sound Chime
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundChimeEnabled}
                onChange={(e) => onUpdateSettings({ soundChimeEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-m3-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-m3-primary"></div>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(
              [
                { id: 'droplet', label: 'Water Drop' },
                { id: 'gentle', label: 'Gentle Ripple' },
                { id: 'bell', label: 'Crystal Bell' },
                { id: 'marimba', label: 'Warm Marimba' },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onUpdateSettings({ soundType: s.id });
                  handlePlaySound(s.id);
                }}
                className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-between transition it-squircle-button ${
                  settings.soundType === s.id
                    ? 'bg-m3-primary text-m3-on-primary font-bold shadow-xs'
                    : 'bg-m3-surface-container text-m3-on-surface border-m3-outline-variant/30 hover:bg-m3-surface-container-high'
                }`}
              >
                <span>{s.label}</span>
                <Play className="w-3 h-3 fill-current opacity-80" />
              </button>
            ))}
          </div>
        </div>

        {/* System Permission Button */}
        {permissionStatus !== 'granted' && (
          <div className="pt-4 border-t border-m3-outline-variant/20 p-4 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-m3-primary shrink-0" />
              <p className="text-xs text-m3-on-surface-variant">
                Enable browser notifications to receive alerts even when the tab is backgrounded.
              </p>
            </div>
            <button
              onClick={handleRequestPermission}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-m3-primary text-m3-on-primary text-xs font-bold hover:brightness-105 active:scale-95 transition shrink-0"
            >
              Grant Permission
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
