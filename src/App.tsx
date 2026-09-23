import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AppSettings,
  BeverageType,
  ContainerType,
  ReminderState,
  ThemeMode,
  WaterLog,
} from './types';
import {
  storageService,
  DEFAULT_SETTINGS,
  DEFAULT_REMINDER_STATE,
} from './services/storageService';
import { audioService } from './services/audioService';
import { notificationService } from './services/notificationService';
import { M3TopBar } from './components/M3TopBar';
import { M3NavigationBar, NavTab } from './components/M3NavigationBar';
import { WaterHeroGauge } from './components/WaterHeroGauge';
import { QuickLogSection } from './components/QuickLogSection';
import { TodayTimeline } from './components/TodayTimeline';
import { HistoryView } from './components/HistoryView';
import { RemindersView } from './components/RemindersView';
import { SettingsView } from './components/SettingsView';
import { ReminderBanner } from './components/ReminderBanner';
import { CustomLogModal } from './components/CustomLogModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CheckCircle2, RotateCcw } from 'lucide-react';

export default function App() {
  const [logs, setLogs] = useState<WaterLog[]>(() => storageService.getLogs());
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [reminderState, setReminderState] = useState<ReminderState>(() =>
    storageService.getReminderState()
  );

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isReminderBannerOpen, setIsReminderBannerOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastDeletedLog, setLastDeletedLog] = useState<WaterLog | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    storageService.saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    storageService.saveReminderState(reminderState);
  }, [reminderState]);

  // Handle Theme application
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'amoled');

    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'amoled') {
      root.classList.add('dark', 'amoled');
    } else if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
    }
  }, [settings.theme]);

  // Today's logs and volume
  const todayLogs = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return logs.filter((log) => log.timestamp >= startOfToday.getTime());
  }, [logs]);

  const todayTotalMl = useMemo(() => {
    return todayLogs.reduce((sum, item) => sum + item.amount, 0);
  }, [todayLogs]);

  // Streak calculation
  const streak = useMemo(() => {
    const datesWithWater = new Set(
      logs.map((l) => {
        const d = new Date(l.timestamp);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    );

    let count = 0;
    const current = new Date();
    // Check today first
    const todayStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;

    // If no drinks today yet, check starting from yesterday
    if (!datesWithWater.has(todayStr)) {
      current.setDate(current.getDate() - 1);
    }

    while (true) {
      const checkStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      if (datesWithWater.has(checkStr)) {
        count++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }
    return Math.max(1, count);
  }, [logs]);

  // Helper: check if within active hours
  const isWithinActiveHours = useCallback(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = settings.activeHoursStart.split(':').map(Number);
    const [endH, endM] = settings.activeHoursEnd.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }, [settings.activeHoursStart, settings.activeHoursEnd]);

  // Fire reminder event
  const triggerReminderNotification = useCallback(
    (isFollowUp = false) => {
      // Play audio chime
      if (settings.soundChimeEnabled) {
        audioService.playSound(settings.soundType);
      }

      // System notification
      notificationService.showHydrationNotification({
        title: isFollowUp ? '💧 Reminder: Missed water intake!' : '💧 Time to drink water!',
        body: `Have a standard cup (${settings.cupVolume}${settings.unit}) or bottle (${settings.bottleVolume}${settings.unit}) to stay refreshed.`,
        onNotificationClick: () => {
          setIsReminderBannerOpen(true);
        },
      });

      // Show in-app banner
      setIsReminderBannerOpen(true);
      setReminderState((prev) => ({
        ...prev,
        waitingForInputSince: Date.now(),
        remindAgainTriggered: isFollowUp,
      }));
    },
    [settings.soundChimeEnabled, settings.soundType, settings.cupVolume, settings.bottleVolume, settings.unit]
  );

  // Interval timer tick
  useEffect(() => {
    if (!settings.reminderEnabled) return;

    const timer = setInterval(() => {
      const now = Date.now();

      // Check if snoozed
      if (reminderState.isSnoozed && reminderState.snoozeUntilTime) {
        if (now >= reminderState.snoozeUntilTime) {
          // Snooze expired, trigger follow-up reminder!
          setReminderState((prev) => ({
            ...prev,
            isSnoozed: false,
            snoozeUntilTime: null,
            nextScheduledTime: now + settings.reminderIntervalMinutes * 60 * 1000,
          }));
          triggerReminderNotification(true);
        }
        return;
      }

      // Check regular interval
      if (reminderState.nextScheduledTime && now >= reminderState.nextScheduledTime) {
        if (isWithinActiveHours()) {
          triggerReminderNotification(false);
        }
        // Advance schedule
        setReminderState((prev) => ({
          ...prev,
          nextScheduledTime: now + settings.reminderIntervalMinutes * 60 * 1000,
        }));
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [
    settings.reminderEnabled,
    settings.reminderIntervalMinutes,
    reminderState.isSnoozed,
    reminderState.snoozeUntilTime,
    reminderState.nextScheduledTime,
    isWithinActiveHours,
    triggerReminderNotification,
  ]);

  // Log water handler
  const handleLogWater = (
    amount: number,
    containerType: ContainerType,
    beverageType: BeverageType = 'water',
    note?: string
  ) => {
    const wasGoalMet = todayTotalMl >= settings.dailyGoal;
    const newTotal = todayTotalMl + amount;

    const newLog: WaterLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      amount,
      containerType,
      beverageType,
      note,
    };

    setLogs((prev) => [...prev, newLog]);

    // Close reminder banner if open & reset timer
    setIsReminderBannerOpen(false);
    setReminderState({
      isActive: true,
      nextScheduledTime: Date.now() + settings.reminderIntervalMinutes * 60 * 1000,
      isSnoozed: false,
      snoozeUntilTime: null,
      waitingForInputSince: null,
      remindAgainTriggered: false,
    });

    // Provide audio feedback
    if (newTotal >= settings.dailyGoal && !wasGoalMet) {
      audioService.playGoalCelebration();
      showToast(`🎉 Daily goal of ${settings.dailyGoal} ${settings.unit} reached!`);
    } else {
      audioService.playDroplet();
      showToast(`Added +${amount} ${settings.unit} ${containerType}!`);
    }
  };

  // Snooze handler
  const handleSnooze = () => {
    const snoozeUntil = Date.now() + settings.snoozeDurationMinutes * 60 * 1000;
    setReminderState((prev) => ({
      ...prev,
      isSnoozed: true,
      snoozeUntilTime: snoozeUntil,
      waitingForInputSince: null,
    }));
    setIsReminderBannerOpen(false);
    showToast(`Snoozed for ${settings.snoozeDurationMinutes} minutes.`);
  };

  // Dismiss reminder
  const handleDismissReminder = () => {
    setIsReminderBannerOpen(false);
    setReminderState((prev) => ({
      ...prev,
      waitingForInputSince: null,
      nextScheduledTime: Date.now() + settings.reminderIntervalMinutes * 60 * 1000,
    }));
  };

  // Reset interval countdown
  const handleResetInterval = () => {
    setReminderState({
      isActive: true,
      nextScheduledTime: Date.now() + settings.reminderIntervalMinutes * 60 * 1000,
      isSnoozed: false,
      snoozeUntilTime: null,
      waitingForInputSince: null,
      remindAgainTriggered: false,
    });
    showToast(`Interval timer reset to ${settings.reminderIntervalMinutes}m.`);
  };

  // Delete log with undo
  const handleDeleteLog = (id: string) => {
    const logToDelete = logs.find((l) => l.id === id);
    if (!logToDelete) return;
    setLastDeletedLog(logToDelete);
    setLogs((prev) => prev.filter((l) => l.id !== id));
    showToast(`Deleted ${logToDelete.amount} ${settings.unit} entry.`);
  };

  const handleUndoDelete = () => {
    if (lastDeletedLog) {
      setLogs((prev) => [...prev, lastDeletedLog]);
      setLastDeletedLog(null);
      showToast('Entry restored.');
    }
  };

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Live countdown string
  const countdownText = useMemo(() => {
    const now = Date.now();
    let target = reminderState.nextScheduledTime;

    if (reminderState.isSnoozed && reminderState.snoozeUntilTime) {
      target = reminderState.snoozeUntilTime;
    }

    if (!target) return 'Not scheduled';

    const diff = Math.max(0, target - now);
    const totalMinutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hours}h ${mins}m`;
    }

    return `${totalMinutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
  }, [reminderState.nextScheduledTime, reminderState.isSnoozed, reminderState.snoozeUntilTime]);

  return (
    <div className="min-h-screen flex flex-col bg-m3-surface text-m3-on-surface transition-colors duration-200">
      {/* Top Header */}
      <M3TopBar
        theme={settings.theme}
        onThemeChange={(newTheme) => setSettings((s) => ({ ...s, theme: newTheme }))}
        streak={streak}
        onOpenReminders={() => setCurrentTab('reminders')}
        hasActiveReminder={reminderState.isSnoozed || isReminderBannerOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-5 pb-24 md:pb-12">
        {/* Navigation Bar for desktop */}
        <div className="mb-6">
          <M3NavigationBar
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            nextReminderCountdown={countdownText}
            hasPendingAlert={isReminderBannerOpen}
          />
        </div>

        {/* Tab views */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Hero Progress Gauge */}
            <WaterHeroGauge
              currentMl={todayTotalMl}
              goalMl={settings.dailyGoal}
              settings={settings}
              streak={streak}
            />

            {/* Quick Log Buttons (Standard Cup vs Bottle vs Custom) */}
            <QuickLogSection
              settings={settings}
              onLogQuick={(amount, containerType) =>
                handleLogWater(amount, containerType)
              }
              onOpenCustomModal={() => setIsCustomModalOpen(true)}
            />

            {/* Today's Timeline */}
            <TodayTimeline
              logs={todayLogs}
              settings={settings}
              onDeleteLog={handleDeleteLog}
            />
          </div>
        )}

        {currentTab === 'history' && (
          <div className="animate-in fade-in duration-200">
            <HistoryView logs={logs} settings={settings} />
          </div>
        )}

        {currentTab === 'reminders' && (
          <div className="animate-in fade-in duration-200">
            <RemindersView
              settings={settings}
              reminderState={reminderState}
              onUpdateSettings={(newSettings) =>
                setSettings((s) => ({ ...s, ...newSettings }))
              }
              onTriggerTestReminder={() => triggerReminderNotification(false)}
              onResetIntervalTimer={handleResetInterval}
              countdownText={countdownText}
            />
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="animate-in fade-in duration-200">
            <SettingsView
              settings={settings}
              onUpdateSettings={(newSettings) =>
                setSettings((s) => ({ ...s, ...newSettings }))
              }
              onDataReset={() => {
                storageService.clearAllData();
                setLogs([]);
                setSettings(DEFAULT_SETTINGS);
                setReminderState(DEFAULT_REMINDER_STATE);
                showToast('All hydration data reset.');
              }}
            />
          </div>
        )}
      </main>

      {/* Floating Material 3 Action Notification Modal */}
      <ReminderBanner
        isOpen={isReminderBannerOpen}
        settings={settings}
        isRemindAgain={reminderState.remindAgainTriggered}
        onLogCup={() => handleLogWater(settings.cupVolume, 'cup')}
        onLogBottle={() => handleLogWater(settings.bottleVolume, 'bottle')}
        onLogLargeBottle={() => handleLogWater(settings.largeBottleVolume, 'large_bottle')}
        onSnooze={handleSnooze}
        onDismiss={handleDismissReminder}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
      />

      {/* Custom Drink Volume Modal */}
      <CustomLogModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onLog={(amount, container, beverage, note) =>
          handleLogWater(amount, container, beverage, note)
        }
        unit={settings.unit}
      />

      {/* Offline Connectivity Toast */}
      <OfflineIndicator />

      {/* Toast Notification Bar */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-3 bg-m3-surface-container-highest border border-m3-outline-variant text-m3-on-surface px-4 py-2.5 rounded-2xl shadow-m3-3 animate-in fade-in slide-in-from-bottom-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-m3-primary" />
          <span>{toastMessage}</span>
          {lastDeletedLog && (
            <button
              onClick={handleUndoDelete}
              className="ml-2 px-2 py-0.5 rounded-lg bg-m3-primary text-m3-on-primary text-[11px] font-bold hover:brightness-110"
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
