import React, { useState } from 'react';
import { Bell, BellRing, CheckCircle2, ShieldCheck, Sparkles, X, Droplets } from 'lucide-react';
import { notificationService, NotificationPermissionStatus } from '../services/notificationService';
import { hapticService } from '../services/hapticService';
import { audioService } from '../services/audioService';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted: () => void;
  dailyGoal: number;
  unit: string;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose,
  onPermissionGranted,
  dailyGoal,
  unit,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAllowNotifications = async () => {
    setIsRequesting(true);
    setErrorMsg(null);
    hapticService.selection();

    try {
      const status: NotificationPermissionStatus = await notificationService.requestPermission();

      if (status === 'granted') {
        hapticService.celebration();
        audioService.playDroplet();

        // Send a welcoming test notification so the user sees it work immediately!
        notificationService.showHydrationNotification({
          title: '💧 Reminders Activated!',
          body: `HydroFlow will gently remind you throughout the day to hit your ${dailyGoal} ${unit} goal.`,
        });

        onPermissionGranted();
        onClose();
      } else if (status === 'denied') {
        hapticService.medium();
        setErrorMsg('Notifications were declined. You can enable them anytime from your browser or site settings.');
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Failed to request permission:', err);
      onClose();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    hapticService.light();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-[32px] bg-m3-surface-container border border-m3-outline-variant/50 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="permission-modal-title"
      >
        {/* Header Icon and Close Button */}
        <div className="flex items-start justify-between">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-m3-primary/15 text-m3-primary flex items-center justify-center shadow-xs ring-4 ring-m3-primary/10">
              <BellRing className="w-7 h-7 animate-bounce" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-m3-primary text-m3-on-primary flex items-center justify-center shadow-xs">
              <Droplets className="w-3.5 h-3.5" />
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-m3-surface-container-high hover:bg-m3-surface-container-highest text-m3-on-surface-variant flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Stay Hydrated Everyday</span>
          </span>
          <h3 id="permission-modal-title" className="text-xl font-black text-m3-on-surface tracking-tight">
            Enable Water Reminders?
          </h3>
          <p className="text-xs text-m3-on-surface-variant leading-relaxed">
            HydroFlow works best when it can gently remind you to drink throughout the day. Turn on notifications so you never forget your next glass.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="p-3.5 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 space-y-2.5 text-xs text-m3-on-surface">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-m3-primary shrink-0" />
            <span>Regular intervals customized to your routine</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-m3-primary shrink-0" />
            <span>Quick-log a cup directly from the notification tray</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>100% offline & private — no accounts or tracking</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-semibold animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleAllowNotifications}
            disabled={isRequesting}
            className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-m3-primary hover:bg-m3-primary/90 active:scale-98 text-m3-on-primary font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Bell className="w-4 h-4" />
            <span>{isRequesting ? 'Requesting...' : 'Turn On Notifications'}</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-transparent hover:bg-m3-surface-container-high text-m3-on-surface-variant font-bold text-xs transition cursor-pointer text-center"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
