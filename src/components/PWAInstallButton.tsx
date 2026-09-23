import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-m3-primary text-m3-on-primary shadow-m3-1 hover:brightness-110 active:scale-95 transition-all"
        title="Install HydroFlow as App"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-m3-secondary-container text-m3-on-secondary-container hover:brightness-105 active:scale-95 transition-all"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-m3-surface-container-high p-6 shadow-m3-3 border border-m3-outline-variant text-m3-on-surface">
              <div className="flex items-center justify-between pb-3 border-b border-m3-outline-variant">
                <h3 className="text-base font-bold">Install on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full hover:bg-m3-surface-variant transition text-m3-on-surface-variant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 text-xs space-y-3 leading-relaxed text-m3-on-surface-variant">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-m3-primary text-m3-on-primary flex items-center justify-center font-bold text-[10px]">1</span>
                  <span>Tap the <strong>Share</strong> icon in the Safari toolbar (square with upward arrow).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-m3-primary text-m3-on-primary flex items-center justify-center font-bold text-[10px]">2</span>
                  <span>Scroll down the action sheet and select <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-m3-primary text-m3-on-primary flex items-center justify-center font-bold text-[10px]">3</span>
                  <span>Tap <strong>Add</strong> in the top-right corner to launch HydroFlow offline anytime.</span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-full bg-m3-primary py-2.5 text-xs font-bold text-m3-on-primary active:scale-95 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
