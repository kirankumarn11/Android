import React from 'react';
import { WaterLog, AppSettings } from '../types';
import { Trash2, Clock, Droplets } from 'lucide-react';
import { ContainerSymbol } from './ContainerIcons';

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

  const getBeverageName = (type: WaterLog['beverageType']) => {
    switch (type) {
      case 'lemon':
        return 'Lemon Infused';
      case 'sparkling':
        return 'Sparkling Water';
      case 'tea':
        return 'Herbal Tea';
      case 'electrolyte':
        return 'Electrolyte';
      case 'coffee':
        return 'Coffee';
      default:
        return 'Pure Water';
    }
  };

  return (
    <div className="rounded-[28px] bg-m3-surface-container-low border border-m3-outline-variant/35 p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-m3-outline-variant/20">
        <h3 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Today's Activity</span>
        </h3>
        <span className="text-xs text-m3-on-surface-variant font-medium">
          {logs.length} {logs.length === 1 ? 'drink' : 'drinks'} logged
        </span>
      </div>

      {sortedLogs.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-m3-surface-container-high flex items-center justify-center text-m3-on-surface-variant mb-2">
            <Droplets className="w-6 h-6 stroke-1" />
          </div>
          <p className="text-sm font-bold text-m3-on-surface">No water logged yet today</p>
          <p className="text-xs text-m3-on-surface-variant mt-1 max-w-xs">
            Tap any of the quick log cards above to record your first drink.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-m3-outline-variant/15 max-h-80 overflow-y-auto pr-1 mt-2">
          {sortedLogs.map((log) => {
            return (
              <div
                key={log.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-m3-surface-container/60 px-2 rounded-2xl transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-m3-surface-container-high flex items-center justify-center shrink-0 shadow-xs text-m3-primary">
                    <ContainerSymbol type={log.containerType} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-m3-on-surface">
                        +{log.amount} {settings.unit}
                      </span>
                      <span className="text-xs text-m3-on-surface-variant truncate">
                        {getBeverageName(log.beverageType)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-m3-on-surface-variant/80 mt-0.5">
                      <span>{formatTime(log.timestamp)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{log.containerType.replace('_', ' ')}</span>
                      {log.note && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="italic truncate">{log.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteLog(log.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-m3-on-surface-variant/60 hover:text-red-500 hover:bg-red-500/10 transition shrink-0"
                  title="Delete entry"
                  aria-label="Delete entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
