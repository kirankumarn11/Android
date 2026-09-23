import React from 'react';
import { AppSettings, ContainerType, BeverageType } from '../types';
import { Plus, Sparkles, CupSoda } from 'lucide-react';

interface QuickLogSectionProps {
  settings: AppSettings;
  onLogQuick: (amount: number, containerType: ContainerType, beverageType?: BeverageType) => void;
  onOpenCustomModal: () => void;
}

export const QuickLogSection: React.FC<QuickLogSectionProps> = ({
  settings,
  onLogQuick,
  onOpenCustomModal,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-m3-on-surface-variant flex items-center gap-1.5">
          <CupSoda className="w-4 h-4 text-m3-primary" />
          <span>Quick Log</span>
        </h3>
        <span className="text-xs text-m3-on-surface-variant">Tap to record intake</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Standard Cup */}
        <button
          onClick={() => onLogQuick(settings.cupVolume, 'cup')}
          className="relative p-4 rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 hover:border-m3-primary hover:bg-m3-primary-container/20 active:scale-95 transition-all text-left group shadow-xs"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
            ☕
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold text-m3-on-surface block">Standard Cup</span>
            <span className="text-sm font-extrabold text-m3-primary">
              +{settings.cupVolume} {settings.unit}
            </span>
          </div>
          <span className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition text-[10px] font-bold text-m3-primary">
            +Add
          </span>
        </button>

        {/* Standard Bottle */}
        <button
          onClick={() => onLogQuick(settings.bottleVolume, 'bottle')}
          className="relative p-4 rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 hover:border-m3-primary hover:bg-m3-primary-container/20 active:scale-95 transition-all text-left group shadow-xs"
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
            🍶
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold text-m3-on-surface block">Water Bottle</span>
            <span className="text-sm font-extrabold text-m3-primary">
              +{settings.bottleVolume} {settings.unit}
            </span>
          </div>
          <span className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition text-[10px] font-bold text-m3-primary">
            +Add
          </span>
        </button>

        {/* Large Bottle */}
        <button
          onClick={() => onLogQuick(settings.largeBottleVolume, 'large_bottle')}
          className="relative p-4 rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 hover:border-m3-primary hover:bg-m3-primary-container/20 active:scale-95 transition-all text-left group shadow-xs"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
            🧊
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold text-m3-on-surface block">Large Bottle</span>
            <span className="text-sm font-extrabold text-m3-primary">
              +{settings.largeBottleVolume} {settings.unit}
            </span>
          </div>
          <span className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition text-[10px] font-bold text-m3-primary">
            +Add
          </span>
        </button>

        {/* Custom Input */}
        <button
          onClick={onOpenCustomModal}
          className="relative p-4 rounded-3xl bg-m3-surface-container-high border border-dashed border-m3-outline/60 hover:border-m3-primary hover:bg-m3-primary-container/20 active:scale-95 transition-all text-left group shadow-xs flex flex-col justify-between"
        >
          <div className="w-12 h-12 rounded-2xl bg-m3-secondary-container text-m3-on-secondary-container flex items-center justify-center group-hover:rotate-90 transition">
            <Plus className="w-6 h-6" />
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold text-m3-on-surface block">Custom Volume</span>
            <span className="text-[11px] font-semibold text-m3-on-surface-variant flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Any drink
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
