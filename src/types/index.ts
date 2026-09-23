export type ContainerType = 'cup' | 'bottle' | 'large_bottle' | 'custom';

export type BeverageType = 'water' | 'sparkling' | 'lemon' | 'tea' | 'electrolyte' | 'coffee';

export interface WaterLog {
  id: string;
  timestamp: number; // Unix epoch in ms
  amount: number; // in milliliters
  containerType: ContainerType;
  beverageType: BeverageType;
  note?: string;
}

export type ThemeMode = 'system' | 'light' | 'dark' | 'amoled';

export interface AppSettings {
  dailyGoal: number; // in ml, default 2500
  cupVolume: number; // in ml, default 250
  bottleVolume: number; // in ml, default 500
  largeBottleVolume: number; // in ml, default 750
  unit: 'ml' | 'oz';
  theme: ThemeMode;
  reminderEnabled: boolean;
  reminderIntervalMinutes: number; // default 60
  activeHoursStart: string; // "08:00"
  activeHoursEnd: string; // "22:00"
  snoozeDurationMinutes: number; // default 10
  autoSnoozeIfNoInput: boolean; // default true: remind once again if no input detected
  autoSnoozeGracePeriodMinutes: number; // default 5 minutes
  soundChimeEnabled: boolean;
  soundType: 'droplet' | 'gentle' | 'bell' | 'marimba';
  notificationsAllowed: boolean;
}

export interface ReminderState {
  isActive: boolean;
  nextScheduledTime: number; // epoch ms
  isSnoozed: boolean;
  snoozeUntilTime: number | null;
  waitingForInputSince: number | null; // epoch ms when notification triggered
  remindAgainTriggered: boolean;
}
