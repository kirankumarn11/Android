import React, { useState } from 'react';
import { AppSettings, ReminderState } from '../types';
import { notificationService } from '../services/notificationService';
import { audioService } from '../services/audioService';
import {
  BellRing,
  Clock,
  Volume2,
  Play,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Sparkles,
  RotateCcw,
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
      <div>
        <h2 className="text-xl font-extrabold text-m3-on-surface flex items-center gap-2">
          <BellRing className="w-5 h-5 text-m3-primary" />
          <span>Hydration Interval Reminders</span>
        </h2>
        <p className="text-xs text-m3-on-surface-variant">
          Set custom intervals, personal snooze times, and missed intake follow-ups
        </p>
      </div>

      {/* Live Timer Status Hero Card */}
      <div className="rounded-3xl bg-gradient-to-br from-sky-500/10 via-m3-surface-container to-m3-surface-container border border-sky-500/30 p-5 shadow-m3-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-m3-primary text-m3-on-primary flex items-center justify-center shadow-m3-1">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-m3-primary">
                {reminderState.isSnoozed ? 'Snooze Mode Active' : 'Interval Tracker'}
              </span>
              <p className="text-2xl font-black text-m3-on-surface tracking-tight mt-0.5">
                {countdownText}
              </p>
              <p className="text-xs text-m3-on-surface-variant">
                {reminderState.isSnoozed
                  ? `Snoozed for ${settings.snoozeDurationMinutes}m. Will remind again soon.`
                  : `Reminding every ${settings.reminderIntervalMinutes} minutes between ${settings.activeHoursStart} and ${settings.activeHoursEnd}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetIntervalTimer}
              className="px-3.5 py-2 rounded-2xl bg-m3-surface-container-high border border-m3-outline-variant/50 text-xs font-semibold text-m3-on-surface hover:bg-m3-surface-container-highest active:scale-95 transition flex items-center gap-1.5"
              title="Reset current interval countdown"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Interval</span>
            </button>
            <button
              onClick={() => {
                setTestNotificationSent(true);
                onTriggerTestReminder();
                setTimeout(() => setTestNotificationSent(false), 3000);
              }}
              className="px-4 py-2 rounded-2xl bg-m3-primary text-m3-on-primary text-xs font-bold shadow-m3-1 hover:brightness-110 active:scale-95 transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testNotificationSent ? 'Sent!' : 'Test Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 p-6 space-y-6 shadow-xs">
        {/* Master Enabled Switch */}
        <div className="flex items-center justify-between pb-5 border-b border-m3-outline-variant/30">
          <div>
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
            <div className="w-11 h-6 bg-m3-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-m3-primary"></div>
          </label>
        </div>

        {/* Interval Selection */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface-variant block">
                Reminder Interval
              </label>
              <span className="text-xs text-m3-on-surface-variant">
                How often should HydroFlow remind you to drink water?
              </span>
            </div>
            <span className="text-base font-extrabold text-m3-primary">
              Every {settings.reminderIntervalMinutes} min
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {intervalPresets.map((mins) => (
              <button
                key={mins}
                onClick={() => onUpdateSettings({ reminderIntervalMinutes: mins })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  settings.reminderIntervalMinutes === mins
                    ? 'bg-m3-primary text-m3-on-primary font-bold shadow-xs'
                    : 'bg-m3-surface-container-high text-m3-on-surface border border-m3-outline-variant/30 hover:bg-m3-surface-container-highest'
                }`}
              >
                {mins < 60 ? `${mins} min` : `${mins / 60} hr`}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-m3-on-surface-variant">Custom:</span>
            <input
              type="range"
              min="15"
              max="240"
              step="5"
              value={settings.reminderIntervalMinutes}
              onChange={(e) => onUpdateSettings({ reminderIntervalMinutes: Number(e.target.value) })}
              className="w-full accent-m3-primary"
            />
          </div>
        </div>

        {/* Snooze Preference Setting */}
        <div className="pt-4 border-t border-m3-outline-variant/30">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface-variant block">
                Personal Snooze Duration
              </label>
              <span className="text-xs text-m3-on-surface-variant">
                How long to delay the reminder when you choose to snooze
              </span>
            </div>
            <span className="text-base font-extrabold text-m3-primary">
              {settings.snoozeDurationMinutes} min
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {snoozePresets.map((mins) => (
              <button
                key={mins}
                onClick={() => onUpdateSettings({ snoozeDurationMinutes: mins })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  settings.snoozeDurationMinutes === mins
                    ? 'bg-m3-secondary-container text-m3-on-secondary-container font-bold ring-2 ring-m3-outline'
                    : 'bg-m3-surface-container-high text-m3-on-surface border border-m3-outline-variant/30 hover:bg-m3-surface-container-highest'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-m3-on-surface-variant">Custom:</span>
            <input
              type="range"
              min="2"
              max="60"
              step="1"
              value={settings.snoozeDurationMinutes}
              onChange={(e) => onUpdateSettings({ snoozeDurationMinutes: Number(e.target.value) })}
              className="w-full accent-m3-primary"
            />
          </div>
        </div>

        {/* Remind Once Again If No Input Detected */}
        <div className="pt-4 border-t border-m3-outline-variant/30 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-sm font-bold text-m3-on-surface block">
              Auto-Snooze & Remind Once Again
            </span>
            <p className="text-xs text-m3-on-surface-variant leading-relaxed">
              If a reminder notification is triggered and no cup or bottle intake is detected, automatically snooze and alert you once more after your personal snooze duration.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={settings.autoSnoozeIfNoInput}
              onChange={(e) => onUpdateSettings({ autoSnoozeIfNoInput: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-m3-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-m3-primary"></div>
          </label>
        </div>

        {/* Active Hours Range */}
        <div className="pt-4 border-t border-m3-outline-variant/30">
          <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface-variant block mb-1">
            Active Hours (Do Not Disturb outside)
          </label>
          <span className="text-xs text-m3-on-surface-variant block mb-3">
            Reminders will only ring between these hours to protect your sleep
          </span>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            <div>
              <span className="text-[10px] font-bold text-m3-on-surface-variant uppercase">Wake / Start</span>
              <input
                type="time"
                value={settings.activeHoursStart}
                onChange={(e) => onUpdateSettings({ activeHoursStart: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-m3-surface-container-high border border-m3-outline-variant text-xs font-bold text-m3-on-surface"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-m3-on-surface-variant uppercase">Sleep / End</span>
              <input
                type="time"
                value={settings.activeHoursEnd}
                onChange={(e) => onUpdateSettings({ activeHoursEnd: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-m3-surface-container-high border border-m3-outline-variant text-xs font-bold text-m3-on-surface"
              />
            </div>
          </div>
        </div>

        {/* Audio Synthesizer Chimes */}
        <div className="pt-4 border-t border-m3-outline-variant/30 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-m3-on-surface block">
                Offline Audio Chimes
              </span>
              <span className="text-xs text-m3-on-surface-variant">
                Synthesized sound alerts generated via Web Audio API (works 100% offline)
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundChimeEnabled}
                onChange={(e) => onUpdateSettings({ soundChimeEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-m3-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-m3-primary"></div>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {(
              [
                { id: 'droplet', label: 'Water Drop', icon: '💧' },
                { id: 'gentle', label: 'Gentle Tones', icon: '🎵' },
                { id: 'bell', label: 'Harmonic Bell', icon: '🔔' },
                { id: 'marimba', label: 'Warm Marimba', icon: '🪵' },
              ] as const
            ).map((tone) => (
              <div
                key={tone.id}
                className={`p-2.5 rounded-2xl border flex items-center justify-between transition ${
                  settings.soundType === tone.id
                    ? 'bg-m3-primary-container border-m3-primary text-m3-on-primary-container'
                    : 'bg-m3-surface-container-high border-m3-outline-variant/30 text-m3-on-surface'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings({ soundType: tone.id });
                    handlePlaySound(tone.id);
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-left flex-1"
                >
                  <span>{tone.icon}</span>
                  <span className="truncate">{tone.label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePlaySound(tone.id)}
                  className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                  title="Preview tone"
                >
                  <Play className="w-3 h-3 fill-current" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Web Browser Notification Permission Card */}
        <div className="pt-4 border-t border-m3-outline-variant/30">
          <div className="rounded-2xl bg-m3-surface-container-high p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-m3-surface-container-highest text-m3-primary mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-m3-on-surface">Browser Notifications</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      permissionStatus === 'granted'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : permissionStatus === 'denied'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {permissionStatus}
                  </span>
                </div>
                <p className="text-[11px] text-m3-on-surface-variant mt-0.5">
                  {permissionStatus === 'granted'
                    ? 'System notifications enabled. You will receive hydration reminders even if HydroFlow is running in background.'
                    : 'Allow notification permissions to receive prompts while working or browsing.'}
                </p>
              </div>
            </div>

            {permissionStatus !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="px-4 py-2 rounded-full bg-m3-primary text-m3-on-primary text-xs font-bold shadow-xs hover:brightness-110 active:scale-95 transition flex-shrink-0"
              >
                Allow Notifications
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
