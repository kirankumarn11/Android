import { AppSettings, ReminderState, WaterLog } from '../types';

const STORAGE_KEYS = {
  LOGS: 'hydroflow_logs_v1',
  SETTINGS: 'hydroflow_settings_v1',
  REMINDER_STATE: 'hydroflow_reminder_state_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  dailyGoal: 2500,
  cupVolume: 250,
  bottleVolume: 500,
  largeBottleVolume: 750,
  unit: 'ml',
  theme: 'system',
  themeAccent: 'water',
  reminderEnabled: true,
  reminderIntervalMinutes: 60,
  activeHoursStart: '08:00',
  activeHoursEnd: '22:00',
  snoozeDurationMinutes: 10,
  autoSnoozeIfNoInput: true,
  autoSnoozeGracePeriodMinutes: 5,
  soundChimeEnabled: true,
  soundType: 'droplet',
  hapticFeedbackEnabled: true,
  hapticIntensity: 'medium',
  notificationsAllowed: false,
};

export const DEFAULT_REMINDER_STATE: ReminderState = {
  isActive: true,
  nextScheduledTime: Date.now() + 60 * 60 * 1000,
  isSnoozed: false,
  snoozeUntilTime: null,
  waitingForInputSince: null,
  remindAgainTriggered: false,
};

export const storageService = {
  getLogs(): WaterLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (!data) {
        // Pre-seed initial sample data so dashboard isn't completely empty on first launch
        const initial = generateInitialSampleLogs();
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load water logs from localStorage', e);
      return [];
    }
  },

  saveLogs(logs: WaterLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save water logs to localStorage', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error('Failed to load settings', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  getReminderState(): ReminderState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDER_STATE);
      if (!data) return DEFAULT_REMINDER_STATE;
      return { ...DEFAULT_REMINDER_STATE, ...JSON.parse(data) };
    } catch (e) {
      console.error('Failed to load reminder state', e);
      return DEFAULT_REMINDER_STATE;
    }
  },

  saveReminderState(state: ReminderState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDER_STATE, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save reminder state', e);
    }
  },

  exportBackup(): string {
    const backup = {
      app: 'HydroFlow',
      version: 1,
      exportedAt: new Date().toISOString(),
      logs: this.getLogs(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.logs)) {
        this.saveLogs(data.logs);
      }
      if (data.settings && typeof data.settings === 'object') {
        this.saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.REMINDER_STATE);
    localStorage.removeItem('hydroflow_installed_at');
    localStorage.removeItem('hydroflow_notification_prompted');
  },

  isFirstInstall(): boolean {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('hydroflow_installed_at');
  },

  markInstalled(): void {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('hydroflow_installed_at')) {
      localStorage.setItem('hydroflow_installed_at', Date.now().toString());
    }
  },

  hasPromptedNotification(): boolean {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('hydroflow_notification_prompted') === 'true';
  },

  setPromptedNotification(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('hydroflow_notification_prompted', 'true');
  },
};

// Generates 7 days of realistic hydration records for dashboard demo
function generateInitialSampleLogs(): WaterLog[] {
  const logs: WaterLog[] = [];
  const now = new Date();

  // Create entries over the past 7 days
  for (let i = 6; i >= 1; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);

    // Target between 1800 and 2600 ml per day
    const entries = [
      { hour: 8, min: 30, amount: 250, container: 'cup', bev: 'water' },
      { hour: 10, min: 15, amount: 500, container: 'bottle', bev: 'water' },
      { hour: 12, min: 45, amount: 250, container: 'cup', bev: 'lemon' },
      { hour: 15, min: 20, amount: 500, container: 'bottle', bev: 'sparkling' },
      { hour: 18, min: 10, amount: 500, container: 'bottle', bev: 'water' },
      ...(i % 2 === 0 ? [{ hour: 20, min: 40, amount: 250, container: 'cup', bev: 'tea' }] : []),
    ];

    entries.forEach((item, index) => {
      const entryTime = new Date(day);
      entryTime.setHours(item.hour, item.min, 0, 0);
      logs.push({
        id: `seed_${i}_${index}`,
        timestamp: entryTime.getTime(),
        amount: item.amount,
        containerType: item.container as WaterLog['containerType'],
        beverageType: item.bev as WaterLog['beverageType'],
      });
    });
  }

  // Today's early intake (e.g. 1 cup and 1 bottle)
  const today = new Date(now);
  today.setHours(8, 45, 0, 0);
  logs.push({
    id: `seed_today_1`,
    timestamp: today.getTime(),
    amount: 250,
    containerType: 'cup',
    beverageType: 'water',
  });

  today.setHours(10, 15, 0, 0);
  logs.push({
    id: `seed_today_2`,
    timestamp: today.getTime(),
    amount: 500,
    containerType: 'bottle',
    beverageType: 'water',
  });

  return logs;
}
