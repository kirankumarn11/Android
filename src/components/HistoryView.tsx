import React, { useState } from 'react';
import { WaterLog, AppSettings } from '../types';
import {
  Calendar,
  BarChart2,
  TrendingUp,
  Award,
  Droplet,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface HistoryViewProps {
  logs: WaterLog[];
  settings: AppSettings;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ logs, settings }) => {
  const [selectedDaysBack, setSelectedDaysBack] = useState<number>(7);
  const [selectedDayTimestamp, setSelectedDayTimestamp] = useState<number | null>(null);

  // Group logs by local date string YYYY-MM-DD
  const logsByDate = logs.reduce<Record<string, WaterLog[]>>((acc, log) => {
    const d = new Date(log.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {});

  // Compute stats for past 7 days
  const now = new Date();
  const pastDays = Array.from({ length: selectedDaysBack }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (selectedDaysBack - 1 - i));
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLogs = logsByDate[dateKey] || [];
    const totalMl = dayLogs.reduce((sum, l) => sum + l.amount, 0);
    const cupCount = dayLogs.filter((l) => l.containerType === 'cup').length;
    const bottleCount = dayLogs.filter((l) => l.containerType === 'bottle' || l.containerType === 'large_bottle').length;
    return {
      date: d,
      dateKey,
      dayName: d.toLocaleDateString([], { weekday: 'short' }),
      formattedDate: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      totalMl,
      percentage: Math.min(Math.round((totalMl / settings.dailyGoal) * 100), 100),
      cupCount,
      bottleCount,
      logs: dayLogs,
    };
  });

  // Analytics Metrics
  const totalMlLogged = logs.reduce((sum, l) => sum + l.amount, 0);
  const daysWithGoalMet = pastDays.filter((d) => d.totalMl >= settings.dailyGoal).length;
  const goalAchievementRate = Math.round((daysWithGoalMet / pastDays.length) * 100) || 0;
  const averageDailyMl = Math.round(
    pastDays.reduce((sum, d) => sum + d.totalMl, 0) / (pastDays.length || 1)
  );

  let bestDay = { dateStr: 'N/A', amount: 0 };
  Object.entries(logsByDate).forEach(([dateStr, dLogs]) => {
    const total = dLogs.reduce((s, l) => s + l.amount, 0);
    if (total > bestDay.amount) {
      bestDay = { dateStr, amount: total };
    }
  });

  const maxChartMl = Math.max(settings.dailyGoal * 1.2, ...pastDays.map((d) => d.totalMl), 1000);

  // Active selected day breakdown
  const activeDayData = selectedDayTimestamp
    ? pastDays.find((d) => d.date.getTime() === selectedDayTimestamp) || pastDays[pastDays.length - 1]
    : pastDays[pastDays.length - 1];

  return (
    <div className="space-y-6">
      {/* Title & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-m3-on-surface flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-m3-primary" />
            <span>Hydration Analytics & History</span>
          </h2>
          <p className="text-xs text-m3-on-surface-variant">
            Track daily water intake patterns and container consumption
          </p>
        </div>

        {/* 7 vs 14 vs 30 days selector */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/40 self-start sm:self-auto">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setSelectedDaysBack(days)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                selectedDaysBack === days
                  ? 'bg-m3-primary text-m3-on-primary shadow-xs'
                  : 'text-m3-on-surface-variant hover:text-m3-on-surface'
              }`}
            >
              Last {days}d
            </button>
          ))}
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-m3-on-surface-variant flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-sky-500" /> Daily Average
          </span>
          <p className="text-2xl font-black text-m3-on-surface mt-1.5">
            {averageDailyMl.toLocaleString()}{' '}
            <span className="text-xs font-normal text-m3-on-surface-variant">{settings.unit}</span>
          </p>
          <span className="text-[10px] text-m3-on-surface-variant">Past {selectedDaysBack} days</span>
        </div>

        <div className="p-4 rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-m3-on-surface-variant flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-500" /> Goal Rate
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
            {goalAchievementRate}%
          </p>
          <span className="text-[10px] text-m3-on-surface-variant">
            {daysWithGoalMet} of {pastDays.length} days achieved
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-m3-on-surface-variant flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-indigo-500" /> Total Logged
          </span>
          <p className="text-2xl font-black text-m3-on-surface mt-1.5">
            {(totalMlLogged / 1000).toFixed(1)}{' '}
            <span className="text-xs font-normal text-m3-on-surface-variant">Liters</span>
          </p>
          <span className="text-[10px] text-m3-on-surface-variant">{logs.length} logged drinks</span>
        </div>

        <div className="p-4 rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-m3-on-surface-variant flex items-center gap-1.5">
            <span>🏆</span> Best Record
          </span>
          <p className="text-2xl font-black text-m3-on-surface mt-1.5">
            {bestDay.amount.toLocaleString()}{' '}
            <span className="text-xs font-normal text-m3-on-surface-variant">{settings.unit}</span>
          </p>
          <span className="text-[10px] text-m3-on-surface-variant truncate block">
            {bestDay.dateStr !== 'N/A' ? bestDay.dateStr : 'Log your first drink!'}
          </span>
        </div>
      </div>

      {/* Main Bar Chart Container */}
      <div className="rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 p-6 shadow-m3-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-m3-outline-variant/30 gap-2">
          <div>
            <h3 className="text-base font-bold text-m3-on-surface">Daily Progress Chart</h3>
            <p className="text-xs text-m3-on-surface-variant">
              Horizontal line indicates daily target ({settings.dailyGoal} {settings.unit})
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-gradient-to-t from-sky-600 to-sky-400" />
              <span>Goal Reached</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-sky-200 dark:bg-sky-900/60" />
              <span>In Progress</span>
            </div>
          </div>
        </div>

        {/* Bars */}
        <div className="mt-6">
          <div className="relative h-56 flex items-end justify-between gap-1.5 sm:gap-3 pt-6 pb-2">
            {/* Target Goal Dotted Line */}
            <div
              className="absolute left-0 right-0 border-b-2 border-dashed border-sky-500/50 z-10 pointer-events-none flex items-center justify-end"
              style={{
                bottom: `${Math.min(95, (settings.dailyGoal / maxChartMl) * 100)}%`,
              }}
            >
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-m3-surface-container px-1.5 py-0.5 rounded-md -translate-y-3">
                Target {settings.dailyGoal} {settings.unit}
              </span>
            </div>

            {pastDays.map((day) => {
              const heightPercent = Math.min(100, Math.max(6, (day.totalMl / maxChartMl) * 100));
              const isMet = day.totalMl >= settings.dailyGoal;
              const isSelected = activeDayData?.dateKey === day.dateKey;

              return (
                <div
                  key={day.dateKey}
                  onClick={() => setSelectedDayTimestamp(day.date.getTime())}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4 pointer-events-none bg-m3-surface-container-highest px-2 py-1 rounded-lg text-[10px] font-bold text-m3-on-surface shadow-xs z-30">
                    {day.totalMl} {settings.unit}
                  </div>

                  {/* The Bar */}
                  <div
                    className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 relative ${
                      isMet
                        ? 'bg-gradient-to-t from-sky-600 to-sky-400 shadow-xs'
                        : 'bg-sky-300/60 dark:bg-sky-900/50'
                    } ${
                      isSelected
                        ? 'ring-2 ring-m3-primary ring-offset-2 ring-offset-m3-surface'
                        : ''
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {isMet && (
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/90" />
                    )}
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-[11px] font-semibold mt-2 transition ${
                      isSelected
                        ? 'text-m3-primary font-bold'
                        : 'text-m3-on-surface-variant'
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <span className="text-[9px] text-m3-on-surface-variant/70 -mt-0.5 hidden sm:block">
                    {day.date.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Breakdown Card */}
      {activeDayData && (
        <div className="rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-m3-outline-variant/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center font-bold text-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-m3-on-surface">
                  Details for {activeDayData.formattedDate} ({activeDayData.dayName})
                </h4>
                <p className="text-xs text-m3-on-surface-variant">
                  {activeDayData.totalMl} {settings.unit} consumed ({activeDayData.percentage}% of goal)
                </p>
              </div>
            </div>

            {/* Cup & Bottle Counts for this day */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-m3-surface-container-high text-xs font-semibold text-m3-on-surface flex items-center gap-1.5">
                <span>☕</span>
                <span>{activeDayData.cupCount} cups</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-m3-surface-container-high text-xs font-semibold text-m3-on-surface flex items-center gap-1.5">
                <span>🍶</span>
                <span>{activeDayData.bottleCount} bottles</span>
              </div>
            </div>
          </div>

          {/* List of logs for this selected day */}
          {activeDayData.logs.length === 0 ? (
            <p className="text-xs text-m3-on-surface-variant py-4 text-center">
              No hydration logs recorded on this date.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {activeDayData.logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/20 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {log.containerType === 'cup' ? '☕' : '🍶'}
                    </span>
                    <div>
                      <span className="font-bold text-m3-on-surface block">
                        +{log.amount} {settings.unit}
                      </span>
                      <span className="text-[10px] text-m3-on-surface-variant capitalize">
                        {log.beverageType} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
