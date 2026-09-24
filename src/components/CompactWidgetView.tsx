import React, { useState, useEffect } from 'react';
import { AppSettings, WaterLog } from '../types';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';
import { widgetService, WidgetData } from '../services/widgetService';
import { Droplet, Flame, Clock, Maximize2, Check, Sparkles, Plus } from 'lucide-react';
import { Cup250Icon, Bottle500Icon } from './ContainerIcons';

interface CompactWidgetViewProps {
  initialSettings?: AppSettings;
  initialLogs?: WaterLog[];
  isStandalone?: boolean;
  onExpandToFullApp?: () => void;
}

export const CompactWidgetView: React.FC<CompactWidgetViewProps> = ({
  initialSettings,
  initialLogs,
  isStandalone = false,
  onExpandToFullApp,
}) => {
  const [settings, setSettings] = useState<AppSettings>(
    () => initialSettings || storageService.getSettings()
  );
  const [logs, setLogs] = useState<WaterLog[]>(
    () => initialLogs || storageService.getLogs()
  );
  const [justLogged, setJustLogged] = useState<string | null>(null);

  // Sync with storage / cross-tab broadcast
  useEffect(() => {
    const unsubscribe = widgetService.onWidgetUpdate((data) => {
      // Refresh local logs
      setLogs(storageService.getLogs());
      setSettings(storageService.getSettings());
    });
    return unsubscribe;
  }, []);

  // Today's logs
  const todayLogs = logs.filter((log) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return log.timestamp >= startOfToday.getTime();
  });

  const todayTotalMl = todayLogs.reduce((sum, item) => sum + item.amount, 0);
  const percentage = Math.min(100, Math.round((todayTotalMl / (settings.dailyGoal || 2500)) * 100));
  const remainingMl = Math.max(0, settings.dailyGoal - todayTotalMl);

  // Calculate streak
  const streak = React.useMemo(() => {
    const dates = new Set(
      logs.map((l) => {
        const d = new Date(l.timestamp);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    );
    let count = 0;
    const cur = new Date();
    const todayStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    if (!dates.has(todayStr)) {
      cur.setDate(cur.getDate() - 1);
    }
    while (true) {
      const checkStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      if (dates.has(checkStr)) {
        count++;
        cur.setDate(cur.getDate() - 1);
      } else {
        break;
      }
    }
    return Math.max(1, count);
  }, [logs]);

  // Quick 1-tap log in widget
  const handleQuickLog = (amount: number, type: 'cup' | 'bottle') => {
    const newLog: WaterLog = {
      id: `widget_log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: Date.now(),
      amount,
      containerType: type,
      beverageType: 'water',
    };

    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);
    storageService.saveLogs(updatedLogs);

    // Audio & App Badge
    audioService.playDroplet();
    widgetService.updateAppBadge(todayTotalMl + amount, settings.dailyGoal, settings.cupVolume);

    // Sync widget cache
    widgetService.syncWidgetData({
      todayTotalMl: todayTotalMl + amount,
      dailyGoal: settings.dailyGoal,
      percentage: Math.min(100, Math.round(((todayTotalMl + amount) / settings.dailyGoal) * 100)),
      remainingMl: Math.max(0, settings.dailyGoal - (todayTotalMl + amount)),
      streak,
      unit: settings.unit,
      lastLogTime: Date.now(),
      themeAccent: settings.themeAccent,
    });

    setJustLogged(`+${amount} ${settings.unit}`);
    setTimeout(() => setJustLogged(null), 1500);
  };

  const handleOpenApp = () => {
    if (onExpandToFullApp) {
      onExpandToFullApp();
    } else {
      window.location.href = '/?mode=full';
    }
  };

  // SVG Circular Gauge calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-full h-full min-h-[340px] max-w-sm mx-auto p-4 flex flex-col justify-between select-none bg-m3-surface-container-low text-m3-on-surface rounded-[28px] border border-m3-outline-variant/35 shadow-m3-2">
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-2 border-b border-m3-outline-variant/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-m3-primary text-m3-on-primary flex items-center justify-center shadow-xs">
            <Droplet className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-wider text-m3-on-surface">
              HydroFlow Widget
            </h1>
            <span className="text-[10px] text-m3-on-surface-variant font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Home Progress
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold"
            title="Current hydration streak"
          >
            <Flame className="w-3 h-3 fill-current" />
            <span>{streak}d</span>
          </div>

          {isStandalone && (
            <button
              onClick={handleOpenApp}
              className="p-1 rounded-lg text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-high transition cursor-pointer"
              title="Expand to Full HydroFlow App"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Circular Progress Hero */}
      <div className="flex items-center justify-center gap-4 py-3">
        {/* SVG Progress Circle */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="9"
              fill="transparent"
              className="text-m3-surface-container-highest"
            />
            {/* Foreground Fill */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="text-m3-primary transition-all duration-700 ease-out"
            />
          </svg>

          {/* Centered Percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-m3-on-surface tracking-tight">
              {percentage}%
            </span>
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-m3-on-surface-variant -mt-0.5">
              Goal
            </span>
          </div>
        </div>

        {/* Volume Stats */}
        <div className="flex-1 space-y-1">
          <div className="text-lg font-black text-m3-on-surface tracking-tight leading-none">
            {todayTotalMl}{' '}
            <span className="text-xs font-bold text-m3-on-surface-variant">
              / {settings.dailyGoal} {settings.unit}
            </span>
          </div>

          <p className="text-xs text-m3-on-surface-variant font-medium">
            {remainingMl > 0 ? (
              <span>
                <strong className="text-m3-primary">{remainingMl} {settings.unit}</strong> to reach goal
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Daily goal complete!
              </span>
            )}
          </p>

          {justLogged && (
            <div className="text-[11px] font-extrabold text-m3-primary animate-bounce">
              ✓ Logged {justLogged}
            </div>
          )}
        </div>
      </div>

      {/* Quick 1-Tap Drink Log Buttons */}
      <div className="space-y-1.5 pt-2 border-t border-m3-outline-variant/20">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider font-bold text-m3-on-surface-variant">
            Quick 1-Tap Log
          </span>
          <span className="text-[10px] text-m3-on-surface-variant font-semibold">
            {todayLogs.length} drinks today
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Cup Button */}
          <button
            type="button"
            onClick={() => handleQuickLog(settings.cupVolume, 'cup')}
            className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/35 hover:bg-m3-primary hover:text-m3-on-primary hover:border-transparent active:scale-95 transition-all text-xs font-bold it-squircle-button group cursor-pointer shadow-xs"
            title={`Log ${settings.cupVolume} ${settings.unit} cup`}
          >
            <div className="w-6 h-6 rounded-lg bg-m3-primary-container text-m3-on-primary-container group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition">
              <Cup250Icon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-extrabold leading-none">Cup</div>
              <div className="text-[9px] opacity-80">+{settings.cupVolume} {settings.unit}</div>
            </div>
          </button>

          {/* Bottle Button */}
          <button
            type="button"
            onClick={() => handleQuickLog(settings.bottleVolume, 'bottle')}
            className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/35 hover:bg-m3-primary hover:text-m3-on-primary hover:border-transparent active:scale-95 transition-all text-xs font-bold it-squircle-button group cursor-pointer shadow-xs"
            title={`Log ${settings.bottleVolume} ${settings.unit} bottle`}
          >
            <div className="w-6 h-6 rounded-lg bg-m3-primary-container text-m3-on-primary-container group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition">
              <Bottle500Icon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-extrabold leading-none">Bottle</div>
              <div className="text-[9px] opacity-80">+{settings.bottleVolume} {settings.unit}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Widget Footer */}
      <div className="pt-2 flex items-center justify-between text-[10px] text-m3-on-surface-variant font-medium">
        <span>HydroFlow PWA Widget</span>
        <button
          onClick={handleOpenApp}
          className="text-m3-primary font-bold hover:underline cursor-pointer"
        >
          Open App →
        </button>
      </div>
    </div>
  );
};
