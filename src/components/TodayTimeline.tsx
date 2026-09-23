import React from 'react';
import { WaterLog, AppSettings } from '../types';
import { Trash2, Clock, Droplets } from 'lucide-react';

interface TodayTimelineProps {
  logs: WaterLog[];
  settings: AppSettings;
  onDeleteLog: (id: string) => void;
}

export const TodayTimeline: React.FC<TodayTimelineProps> = ({
  logs,
  settings,
  onDeleteLog,
}) => {
  // Sort reverse chronological (newest first)
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getContainerEmoji = (type: WaterLog['containerType']) => {
    switch (type) {
      case 'cup':
        return '☕';
      case 'bottle':
        return '🍶';
      case 'large_bottle':
        return '🧊';
      default:
        return '🥤';
    }
  };

  const getBeverageBadge = (type: WaterLog['beverageType']) => {
    switch (type) {
      case 'lemon':
        return { label: 'Lemon Infused', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' };
      case 'sparkling':
        return { label: 'Sparkling', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' };
      case 'tea':
        return { label: 'Herbal Tea', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' };
      case 'electrolyte':
        return { label: 'Electrolyte', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' };
      case 'coffee':
        return { label: 'Coffee', color: 'bg-amber-600/10 text-amber-700 dark:text-amber-400' };
      default:
        return { label: 'Pure Water', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' };
    }
  };

  return (
    <div className="rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-m3-outline-variant/30">
        <h3 className="text-sm font-bold uppercase tracking-wider text-m3-on-surface flex items-center gap-2">
          <Clock className="w-4 h-4 text-m3-primary" />
          <span>Today's Hydration Timeline</span>
        </h3>
        <span className="text-xs text-m3-on-surface-variant font-medium">
          {logs.length} {logs.length === 1 ? 'drink' : 'drinks'} logged
        </span>
      </div>

      {sortedLogs.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-m3-surface-container-high flex items-center justify-center text-m3-on-surface-variant mb-2">
            <Droplets className="w-6 h-6 stroke-1" />
          </div>
          <p className="text-sm font-bold text-m3-on-surface">No water logged yet today</p>
          <p className="text-xs text-m3-on-surface-variant mt-1 max-w-xs">
            Start your day fresh by logging a standard cup or bottle above!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-m3-outline-variant/20 max-h-80 overflow-y-auto pr-1 mt-2">
          {sortedLogs.map((log) => {
            const badge = getBeverageBadge(log.beverageType);
            return (
              <div
                key={log.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-m3-surface-container-high/50 px-2 rounded-2xl transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-m3-surface-container-highest flex items-center justify-center text-xl shadow-xs">
                    {getContainerEmoji(log.containerType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-m3-on-surface">
                        +{log.amount} {settings.unit}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-m3-on-surface-variant mt-0.5">
                      <span>{formatTime(log.timestamp)}</span>
                      <span>•</span>
                      <span className="capitalize">{log.containerType.replace('_', ' ')}</span>
                      {log.note && (
                        <>
                          <span>•</span>
                          <span className="italic text-m3-on-surface/70 truncate max-w-[120px]">{log.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteLog(log.id)}
                  className="p-2 rounded-xl text-m3-on-surface-variant opacity-40 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition"
                  title="Delete log"
                  aria-label="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
