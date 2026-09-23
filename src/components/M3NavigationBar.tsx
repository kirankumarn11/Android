import React from 'react';
import { LayoutDashboard, History, BellRing, SlidersHorizontal } from 'lucide-react';

export type NavTab = 'dashboard' | 'history' | 'reminders' | 'settings';

interface M3NavigationBarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  nextReminderCountdown?: string;
  hasPendingAlert?: boolean;
}

export const M3NavigationBar: React.FC<M3NavigationBarProps> = ({
  currentTab,
  onTabChange,
  nextReminderCountdown,
  hasPendingAlert,
}) => {
  const tabs = [
    {
      id: 'dashboard' as NavTab,
      label: 'Track',
      icon: LayoutDashboard,
    },
    {
      id: 'history' as NavTab,
      label: 'History',
      icon: History,
    },
    {
      id: 'reminders' as NavTab,
      label: 'Reminders',
      icon: BellRing,
      badge: hasPendingAlert ? '!' : nextReminderCountdown,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <>
      {/* Mobile / Bottom Navigation Bar (Image Toolbox Jetpack Compose style) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-m3-surface-container/95 backdrop-blur-lg border-t border-m3-outline-variant/30 px-3 py-2 md:hidden">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center py-1 group focus:outline-none"
              >
                <div
                  className={`relative h-8 px-5 rounded-full transition-all duration-200 flex items-center justify-center ${
                    isActive
                      ? 'bg-m3-primary text-m3-on-primary shadow-xs'
                      : 'text-m3-on-surface-variant hover:bg-m3-surface-container-high'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.badge && !isActive && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-m3-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-m3-primary"></span>
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] mt-1 font-medium transition-colors ${
                    isActive
                      ? 'font-bold text-m3-on-surface'
                      : 'text-m3-on-surface-variant'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop / Large Screen Header Pill Bar */}
      <div className="hidden md:flex justify-center items-center py-1">
        <div className="flex items-center gap-1 p-1.5 rounded-full bg-m3-surface-container-low border border-m3-outline-variant/30 shadow-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-150 it-squircle-button ${
                  isActive
                    ? 'bg-m3-primary text-m3-on-primary shadow-xs font-bold'
                    : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-m3-primary-container text-m3-on-primary-container'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
