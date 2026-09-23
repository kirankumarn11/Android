import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-600 dark:bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-m3-3 animate-bounce">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — All logs & reminders saved locally</span>
    </div>
  );
};
