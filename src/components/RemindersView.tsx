import React, { useState } from 'react';
import { AppSettings, ReminderState } from '../types';
import { notificationService } from '../services/notificationService';
import { audioService, SOUND_PRESETS } from '../services/audioService';
import {
  BellRing,
  Clock,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  Moon,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

/**
 * Bulletproof, high-contrast Material 3 Switch
 * Eliminates fragile Tailwind pseudo-element classes that fail to render knobs.
 */
export const M3Switch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  ariaLabel?: string;
}> = ({ checked, onChange, id, ariaLabel }) => {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-m3-primary focus:ring-offset-2 ${
        checked
          ? 'bg-m3-primary'
          : 'bg-m3-surface-container-highest border border-m3-outline-variant/60'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

interface RemindersViewProps {
  settings: AppSettings;
  reminderState: ReminderState;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onTriggerTestReminder: () => void;
  onResetIntervalTimer: () => void;
  onSnooze?: (customMinutes?: number) => void;
  countdownText: string;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  settings,
  reminderState,
  onUpdateSettings,
  onTriggerTestReminder,
  onResetIntervalTimer,
  onSnooze,
  countdownText,
}) => {
  const [permissionStatus, setPermissionStatus] = useState(
    notificationService.getPermissionStatus()
  );
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [soundPlaying, setSoundPlaying] = useState<string | null>(null);

  const handleRequestPermission = async () => {
    const res = await notificationService.requestPermission();
    setPermissionStatus(res);
    if (res === 'granted') {
      onUpdateSettings({ notificationsAllowed: true });
      audioService.playDroplet();
      await notificationService.showHydrationNotification({
        title: '💧 Notification Test Successful!',
        body: `HydroFlow is now active with ${settings.reminderIntervalMinutes}m reminders. Stay refreshed!`,
      });
    }
  };

  const handlePlaySound = (type: AppSettings['soundType']) => {
    setSoundPlaying(type);
    audioService.playSound(type);
    setTimeout(() => setSoundPlaying(null), 1200);
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
          Custom intervals, smart auto-snooze, and gentle hydration chimes
        </p>
      </div>

      {/* Live Timer Status Hero Card */}
      <div className="rounded-[28px] bg-m3-surface-container-low border border-m3-outline-variant/35 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs shrink-0 ${
                reminderState.isSnoozed
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-m3-primary text-m3-on-primary'
              }`}
            >
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    reminderState.isSnoozed
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-black'
                      : 'bg-m3-primary-container text-m3-on-primary-container'
                  }`}
                >
                  {reminderState.isSnoozed ? 'Snooze Active' : 'Next Hydration'}
                </span>
                <span className="text-[11px] text-m3-on-surface-variant">
                  {settings.reminderEnabled ? 'Timer Active' : 'Notifications Paused'}
                </span>
              </div>
              <p className="text-3xl font-black text-m3-on-surface tracking-tight mt-1">
                {countdownText}
              </p>
              <p className="text-xs text-m3-on-surface-variant mt-0.5">
                {reminderState.isSnoozed
                  ? `Snoozed for ${settings.snoozeDurationMinutes}m.`
                  : `Interval: ${settings.reminderIntervalMinutes}m · Active: ${settings.activeHoursStart} - ${settings.activeHoursEnd}`}
              </p>
            </div>
          </div>

          {/* Primary Action Buttons: SNOOZE BUTTON, RESET BUTTON, TEST NOTIFICATION BUTTON */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-m3-outline-variant/20">
            {/* Snooze Button */}
            {onSnooze && (
              <button
                type="button"
                onClick={() => onSnooze(settings.snoozeDurationMinutes)}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold shadow-xs transition it-squircle-button flex items-center gap-1.5 cursor-pointer"
                title={`Snooze reminder for ${settings.snoozeDurationMinutes} minutes`}
              >
                <Clock className="w-4 h-4" />
                <span>Snooze (+{settings.snoozeDurationMinutes}m)</span>
              </button>
            )}

            {/* Reset Timer Button */}
            <button
              type="button"
              onClick={onResetIntervalTimer}
              className="px-3.5 py-2.5 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/40 text-xs font-bold text-m3-on-surface hover:bg-m3-surface-container-high active:scale-95 transition it-squircle-button flex items-center gap-1.5 cursor-pointer"
              title="Reset current countdown interval"
            >
              <RotateCcw className="w-4 h-4 text-m3-on-surface-variant" />
              <span>Reset</span>
            </button>

            {/* Test Notification Button */}
            <button
              type="button"
              onClick={() => {
                setTestNotificationSent(true);
                onTriggerTestReminder();
                setTimeout(() => setTestNotificationSent(false), 3000);
              }}
              className="px-4 py-2.5 rounded-2xl bg-m3-primary text-m3-on-primary text-xs font-bold shadow-xs hover:brightness-105 active:scale-95 transition it-squircle-button flex items-center gap-1.5 cursor-pointer"
              title="Trigger a test reminder alert immediately"
            >
              <Send className="w-4 h-4" />
              <span>{testNotificationSent ? 'Sent!' : 'Test Alert'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Group Card */}
      <div className="rounded-[28px] bg-m3-surface-container-low border border-m3-outline-variant/35 p-5 sm:p-6 space-y-6 shadow-xs">
        {/* 1. NOTIFICATION BUTTON & CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-m3-outline-variant/20 gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-m3-on-surface block">
                Enable Interval Notifications
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  settings.reminderEnabled
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : 'bg-m3-surface-container-highest text-m3-on-surface-variant'
                }`}
              >
                {settings.reminderEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
            <span className="text-xs text-m3-on-surface-variant block">
              Keep reminders active throughout the day to meet your goal
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct Test Notification Button */}
            <button
              type="button"
              onClick={() => {
                setTestNotificationSent(true);
                onTriggerTestReminder();
                setTimeout(() => setTestNotificationSent(false), 3000);
              }}
              className="px-3 py-1.5 rounded-xl bg-m3-surface-container border border-m3-outline-variant/40 text-xs font-bold text-m3-primary hover:bg-m3-surface-container-high transition flex items-center gap-1.5 cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Test Notification</span>
            </button>

            {/* Notification Switch Button */}
            <M3Switch
              checked={settings.reminderEnabled}
              onChange={(checked) => onUpdateSettings({ reminderEnabled: checked })}
              ariaLabel="Toggle Interval Notifications"
            />
          </div>
        </div>

        {/* 2. INTERVAL DURATION CONTROLS */}
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
                type="button"
                onClick={() => onUpdateSettings({ reminderIntervalMinutes: mins })}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition it-squircle-button cursor-pointer ${
                  settings.reminderIntervalMinutes === mins
                    ? 'bg-m3-primary text-m3-on-primary shadow-xs'
                    : 'bg-m3-surface-container text-m3-on-surface border border-m3-outline-variant/40 hover:bg-m3-surface-container-high'
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

        {/* 3. SNOOZE BUTTON & CONTROLS */}
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

          {/* Snooze Presets Buttons */}
          <div className="flex flex-wrap gap-2 mt-2">
            {snoozePresets.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => onUpdateSettings({ snoozeDurationMinutes: mins })}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition it-squircle-button cursor-pointer flex items-center gap-1.5 ${
                  settings.snoozeDurationMinutes === mins
                    ? 'bg-amber-500 text-white font-black shadow-xs ring-2 ring-amber-500/40'
                    : 'bg-m3-surface-container text-m3-on-surface border border-m3-outline-variant/40 hover:bg-m3-surface-container-high'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{mins} min</span>
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

        {/* Auto-Snooze & Remind Once More Switch */}
        <div className="pt-4 border-t border-m3-outline-variant/20 flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-m3-on-surface block">
              Auto-Snooze & Remind Once More
            </span>
            <p className="text-xs text-m3-on-surface-variant leading-relaxed">
              If an alert is triggered and no drink is logged within your snooze duration, HydroFlow alerts you once more.
            </p>
          </div>
          <div className="shrink-0 pt-1">
            <M3Switch
              checked={settings.autoSnoozeIfNoInput}
              onChange={(checked) => onUpdateSettings({ autoSnoozeIfNoInput: checked })}
              ariaLabel="Toggle Auto-Snooze"
            />
          </div>
        </div>

        {/* 4. SOUND BUTTON & CHIME CONTROLS */}
        <div className="pt-4 border-t border-m3-outline-variant/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {settings.soundChimeEnabled ? (
                <Volume2 className="w-4 h-4 text-m3-primary" />
              ) : (
                <VolumeX className="w-4 h-4 text-m3-on-surface-variant" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-m3-primary">
                Sound Chime
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  settings.soundChimeEnabled
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : 'bg-m3-surface-container-highest text-m3-on-surface-variant'
                }`}
              >
                {settings.soundChimeEnabled ? 'SOUND ON' : 'MUTED'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Play Current Sound Button */}
              <button
                type="button"
                onClick={() => handlePlaySound(settings.soundType)}
                className="px-3 py-1.5 rounded-xl bg-m3-surface-container border border-m3-outline-variant/40 text-xs font-bold text-m3-primary hover:bg-m3-surface-container-high transition flex items-center gap-1.5 cursor-pointer"
                title="Play chime preview"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Chime</span>
              </button>

              {/* Sound Toggle Switch Button */}
              <M3Switch
                checked={settings.soundChimeEnabled}
                onChange={(checked) => onUpdateSettings({ soundChimeEnabled: checked })}
                ariaLabel="Toggle Sound Chime"
              />
            </div>
          </div>

          {/* Sound Presets Selection Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
            {SOUND_PRESETS.map((s) => {
              const isSelected = settings.soundType === s.id;
              const isPlaying = soundPlaying === s.id;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onUpdateSettings({ soundType: s.id });
                    handlePlaySound(s.id);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all it-squircle-button cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-m3-primary text-m3-on-primary shadow-xs ring-2 ring-m3-primary/30 border-transparent'
                      : 'bg-m3-surface-container text-m3-on-surface border-m3-outline-variant/40 hover:bg-m3-surface-container-high'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 w-full">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Volume2 className={`w-3.5 h-3.5 shrink-0 ${isPlaying ? 'animate-bounce text-amber-300' : ''}`} />
                      <span className="text-xs font-bold truncate">{s.name}</span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/20' : 'bg-m3-surface-container-high'
                      }`}
                    >
                      <Play className="w-2.5 h-2.5 fill-current opacity-90" />
                    </div>
                  </div>
                  <span
                    className={`text-[10px] leading-tight line-clamp-1 ${
                      isSelected ? 'text-white/80' : 'text-m3-on-surface-variant'
                    }`}
                  >
                    {s.description}
                  </span>
                </button>
              );
            })}
          </div>
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
            <div className="p-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/40">
              <span className="text-[11px] text-m3-on-surface-variant block mb-1">Start Time</span>
              <input
                type="time"
                value={settings.activeHoursStart}
                onChange={(e) => onUpdateSettings({ activeHoursStart: e.target.value })}
                className="w-full px-2 py-1 rounded-xl bg-m3-surface-container-highest font-bold text-m3-on-surface text-sm border-none focus:outline-none"
              />
            </div>
            <div className="p-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/40">
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

        {/* Browser Notification Permission Button */}
        <div className="pt-4 border-t border-m3-outline-variant/20 p-4 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-m3-primary shrink-0" />
            <div>
              <p className="text-xs font-bold text-m3-on-surface">
                Browser System Notifications
              </p>
              <p className="text-[11px] text-m3-on-surface-variant">
                {permissionStatus === 'granted'
                  ? 'System permission is granted. HydroFlow can notify you in the background.'
                  : 'Grant browser permission to receive alerts even when the tab is backgrounded.'}
              </p>
            </div>
          </div>
          {permissionStatus === 'granted' ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Granted</span>
              </span>
              <button
                type="button"
                onClick={async () => {
                  setTestNotificationSent(true);
                  audioService.playDroplet();
                  await notificationService.showHydrationNotification({
                    title: '💧 HydroFlow OS Notification Active',
                    body: `Hydration reminder is active! Daily goal: ${settings.dailyGoal}${settings.unit}.`,
                  });
                  setTimeout(() => setTestNotificationSent(false), 3000);
                }}
                className="px-3 py-1.5 rounded-xl bg-m3-primary text-m3-on-primary text-xs font-bold hover:brightness-105 transition cursor-pointer"
              >
                {testNotificationSent ? 'Sent!' : 'Send Push'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRequestPermission}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-m3-primary text-m3-on-primary text-xs font-bold hover:brightness-105 active:scale-95 transition shrink-0 cursor-pointer shadow-xs"
            >
              Grant Permission
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
