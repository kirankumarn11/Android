import React from 'react';
import { AppSettings, ContainerType, BeverageType } from '../types';
import { Plus, CupSoda } from 'lucide-react';
import { Cup250Icon, Bottle500Icon, LargeBottle750Icon } from './ContainerIcons';
import { hapticService } from '../services/hapticService';

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
  const tools = [
    {
      id: 'cup' as ContainerType,
      title: 'Cup / Glass',
      amount: settings.cupVolume,
      iconComponent: Cup250Icon,
      desc: 'Glass or mug',
      onClick: () => onLogQuick(settings.cupVolume, 'cup'),
    },
    {
      id: 'bottle' as ContainerType,
      title: 'Water Bottle',
      amount: settings.bottleVolume,
      iconComponent: Bottle500Icon,
      desc: 'Standard bottle',
      onClick: () => onLogQuick(settings.bottleVolume, 'bottle'),
    },
    {
      id: 'large_bottle' as ContainerType,
      title: 'Large Bottle',
      amount: settings.largeBottleVolume,
      iconComponent: LargeBottle750Icon,
      desc: 'Gym & sports bottle',
      onClick: () => onLogQuick(settings.largeBottleVolume, 'large_bottle'),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
          <CupSoda className="w-4 h-4" />
          <span>Quick Log Drink</span>
        </h2>
        <span className="text-[11px] text-m3-on-surface-variant font-medium">1-tap recording</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tools.map((tool) => {
          const Icon = tool.iconComponent;
          return (
            <button
              key={tool.id}
              onClick={tool.onClick}
              className="p-4 rounded-[24px] bg-m3-surface-container-low border border-m3-outline-variant/30 hover:border-m3-primary/60 hover:bg-m3-surface-container text-left transition-all it-squircle-button group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between w-full">
                <div className="w-12 h-12 rounded-2xl bg-m3-surface-container-high text-m3-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Icon className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-m3-primary-container text-m3-on-primary-container">
                  +{tool.amount}
                </span>
              </div>

              <div className="mt-3">
                <span className="text-xs font-bold text-m3-on-surface block truncate">
                  {tool.title}
                </span>
                <span className="text-[11px] text-m3-on-surface-variant block truncate mt-0.5">
                  {tool.amount} {settings.unit}
                </span>
              </div>
            </button>
          );
        })}

        {/* Custom Drink Volume Tile (Image Toolbox dashed utility style) */}
        <button
          onClick={() => {
            hapticService.light();
            onOpenCustomModal();
          }}
          className="p-4 rounded-[24px] bg-m3-surface-container-low border border-dashed border-m3-outline-variant/60 hover:border-m3-primary hover:bg-m3-surface-container text-left transition-all it-squircle-button group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between w-full">
            <div className="w-12 h-12 rounded-2xl bg-m3-primary text-m3-on-primary flex items-center justify-center shadow-xs group-hover:rotate-90 transition-transform">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-m3-surface-container-highest text-m3-on-surface-variant">
              Any
            </span>
          </div>

          <div className="mt-3">
            <span className="text-xs font-bold text-m3-on-surface block">
              Custom Entry
            </span>
            <span className="text-[11px] text-m3-on-surface-variant block mt-0.5">
              Specify ml & drink type
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
