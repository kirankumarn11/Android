import React, { useState } from 'react';
import { AppSettings, ThemeMode } from '../types';
import { storageService } from '../services/storageService';
import {
  SlidersHorizontal,
  Calculator,
  Moon,
  Sun,
  Sparkles,
  Monitor,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  HelpCircle,
  CupSoda,
  Info,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onDataReset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onDataReset,
}) => {
  // Goal calculator state
  const [weightKg, setWeightKg] = useState(70);
  const [activityLevel, setActivityLevel] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [climate, setClimate] = useState<'moderate' | 'hot'>('moderate');
  const [calculatedGoal, setCalculatedGoal] = useState<number | null>(null);

  // Backup state
  const [backupCopied, setBackupCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const calculateHydrationGoal = () => {
    // Standard rule: ~35ml per kg of body weight
    let base = weightKg * 35;
    if (activityLevel === 'moderate') base += 350;
    if (activityLevel === 'high') base += 750;
    if (climate === 'hot') base += 500;
    // Round to nearest 50ml
    const rounded = Math.round(base / 50) * 50;
    setCalculatedGoal(rounded);
  };

  const handleApplyCalculatedGoal = () => {
    if (calculatedGoal) {
      onUpdateSettings({ dailyGoal: calculatedGoal });
    }
  };

  const handleExportBackup = () => {
    const json = storageService.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydroflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupCopied(true);
    setTimeout(() => setBackupCopied(false), 2000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importBackup(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
        window.location.reload();
      } else {
        setImportStatus('Failed to import backup file. Invalid format.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-m3-on-surface flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-m3-primary" />
          <span>App Preferences & Target</span>
        </h2>
        <p className="text-xs text-m3-on-surface-variant">
          Adjust standard container sizes, calculate your ideal intake, and customize theme
        </p>
      </div>

      {/* Container Volumes Customization */}
      <div className="rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-m3-outline-variant/30">
          <CupSoda className="w-5 h-5 text-m3-primary" />
          <div>
            <h3 className="text-sm font-bold text-m3-on-surface">Standard Container Volumes</h3>
            <p className="text-xs text-m3-on-surface-variant">
              Customize the default amount logged when selecting Cup or Bottle
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Cup Volume */}
          <div className="p-4 rounded-2xl bg-m3-surface-container-high border border-m3-outline-variant/40">
            <span className="text-xl block mb-1">☕</span>
            <label className="text-xs font-bold text-m3-on-surface block">Standard Cup</label>
            <span className="text-[11px] text-m3-on-surface-variant block mb-2">Default glass or mug</span>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                min="50"
                max="1000"
                step="10"
                value={settings.cupVolume}
                onChange={(e) => onUpdateSettings({ cupVolume: Number(e.target.value) })}
                className="w-24 px-2 py-1 rounded-xl bg-m3-surface-container border border-m3-outline-variant font-bold text-m3-on-surface text-sm"
              />
              <span className="text-xs font-semibold text-m3-on-surface-variant">{settings.unit}</span>
            </div>
          </div>

          {/* Bottle Volume */}
          <div className="p-4 rounded-2xl bg-m3-surface-container-high border border-m3-outline-variant/40">
            <span className="text-xl block mb-1">🍶</span>
            <label className="text-xs font-bold text-m3-on-surface block">Water Bottle</label>
            <span className="text-[11px] text-m3-on-surface-variant block mb-2">Standard reusable bottle</span>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                min="100"
                max="2000"
                step="25"
                value={settings.bottleVolume}
                onChange={(e) => onUpdateSettings({ bottleVolume: Number(e.target.value) })}
                className="w-24 px-2 py-1 rounded-xl bg-m3-surface-container border border-m3-outline-variant font-bold text-m3-on-surface text-sm"
              />
              <span className="text-xs font-semibold text-m3-on-surface-variant">{settings.unit}</span>
            </div>
          </div>

          {/* Large Bottle Volume */}
          <div className="p-4 rounded-2xl bg-m3-surface-container-high border border-m3-outline-variant/40">
            <span className="text-xl block mb-1">🧊</span>
            <label className="text-xs font-bold text-m3-on-surface block">Large Bottle</label>
            <span className="text-[11px] text-m3-on-surface-variant block mb-2">Fitness flask / gym bottle</span>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                min="200"
                max="3000"
                step="50"
                value={settings.largeBottleVolume}
                onChange={(e) => onUpdateSettings({ largeBottleVolume: Number(e.target.value) })}
                className="w-24 px-2 py-1 rounded-xl bg-m3-surface-container border border-m3-outline-variant font-bold text-m3-on-surface text-sm"
              />
              <span className="text-xs font-semibold text-m3-on-surface-variant">{settings.unit}</span>
            </div>
          </div>
        </div>

        {/* Unit Selector */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-bold text-m3-on-surface">Measurement Unit</span>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-m3-surface-container-high border border-m3-outline-variant/40">
            <button
              onClick={() => onUpdateSettings({ unit: 'ml' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                settings.unit === 'ml'
                  ? 'bg-m3-primary text-m3-on-primary'
                  : 'text-m3-on-surface-variant'
              }`}
            >
              Milliliters (ml)
            </button>
            <button
              onClick={() => onUpdateSettings({ unit: 'oz' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                settings.unit === 'oz'
                  ? 'bg-m3-primary text-m3-on-primary'
                  : 'text-m3-on-surface-variant'
              }`}
            >
              Fluid Ounces (oz)
            </button>
          </div>
        </div>
      </div>

      {/* Hydration Goal Calculator */}
      <div className="rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-m3-outline-variant/30">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-m3-primary" />
            <div>
              <h3 className="text-sm font-bold text-m3-on-surface">Personal Hydration Calculator</h3>
              <p className="text-xs text-m3-on-surface-variant">
                Scientific recommendation based on your weight and activity level
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-m3-on-surface-variant block">Current Target</span>
            <span className="text-base font-black text-m3-primary">{settings.dailyGoal} {settings.unit}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Weight */}
          <div>
            <label className="text-xs font-bold text-m3-on-surface block mb-1">
              Body Weight ({weightKg} kg)
            </label>
            <input
              type="range"
              min="40"
              max="140"
              step="1"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full accent-m3-primary"
            />
            <span className="text-[11px] text-m3-on-surface-variant">≈ {Math.round(weightKg * 2.20462)} lbs</span>
          </div>

          {/* Activity Level */}
          <div>
            <label className="text-xs font-bold text-m3-on-surface block mb-1">
              Daily Activity
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as 'low' | 'moderate' | 'high')}
              className="w-full px-3 py-1.5 rounded-xl bg-m3-surface-container-high border border-m3-outline-variant text-xs font-semibold text-m3-on-surface"
            >
              <option value="low">Sedentary (Desk work)</option>
              <option value="moderate">Moderate (30-60m workout)</option>
              <option value="high">Intense (Athlete / Heavy exercise)</option>
            </select>
          </div>

          {/* Climate */}
          <div>
            <label className="text-xs font-bold text-m3-on-surface block mb-1">
              Environment / Weather
            </label>
            <select
              value={climate}
              onChange={(e) => setClimate(e.target.value as 'moderate' | 'hot')}
              className="w-full px-3 py-1.5 rounded-xl bg-m3-surface-container-high border border-m3-outline-variant text-xs font-semibold text-m3-on-surface"
            >
              <option value="moderate">Temperate / Air-conditioned</option>
              <option value="hot">Warm / Humid / Summer</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={calculateHydrationGoal}
            className="w-full sm:w-auto px-5 py-2 rounded-full bg-m3-secondary-container text-m3-on-secondary-container text-xs font-bold hover:brightness-105 active:scale-95 transition"
          >
            Calculate Optimal Goal
          </button>

          {calculatedGoal && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-m3-on-surface">
                Recommended: <strong className="text-m3-primary text-sm">{calculatedGoal} {settings.unit}</strong>
              </span>
              <button
                onClick={handleApplyCalculatedGoal}
                className="px-4 py-1.5 rounded-full bg-m3-primary text-m3-on-primary text-xs font-bold shadow-xs hover:brightness-110 active:scale-95 transition"
              >
                Apply to My Target
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Theme Modes */}
      <div className="rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 p-6 space-y-4 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-m3-on-surface">Appearance & Dark Mode</h3>
          <p className="text-xs text-m3-on-surface-variant">
            Support for dynamic light, dark, and pure OLED / AMOLED black modes
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              { id: 'light', name: 'Light', icon: Sun, desc: 'Clean high contrast' },
              { id: 'dark', name: 'Dark', icon: Moon, desc: 'Material 3 Slate' },
              { id: 'amoled', name: 'AMOLED', icon: Sparkles, desc: 'Pure true black' },
              { id: 'system', name: 'Auto', icon: Monitor, desc: 'Sync with system' },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const isCurrent = settings.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onUpdateSettings({ theme: t.id })}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  isCurrent
                    ? 'bg-m3-primary-container border-m3-primary text-m3-on-primary-container shadow-xs'
                    : 'bg-m3-surface-container-high border-m3-outline-variant/30 text-m3-on-surface hover:bg-m3-surface-container-highest'
                }`}
              >
                <Icon className="w-5 h-5 mb-2" />
                <span className="text-xs font-bold block">{t.name}</span>
                <span className="text-[10px] opacity-75">{t.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Android & Mobile App / APK Guide */}
      <div className="rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-m3-outline-variant/30">
          <span className="text-xl">🤖</span>
          <div>
            <h3 className="text-sm font-bold text-m3-on-surface">Install on Android & APK Options</h3>
            <p className="text-xs text-m3-on-surface-variant">
              How to install HydroFlow as an Android app or export a standalone APK
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-m3-on-surface-variant">
          <div className="p-3.5 rounded-2xl bg-m3-surface-container-high border border-m3-outline-variant/30 space-y-1.5">
            <span className="font-bold text-m3-on-surface text-sm flex items-center gap-2">
              <span>⚡</span> Option 1: Direct WebAPK Install (No download required)
            </span>
            <p>
              On your Android device, open this app in Google Chrome. Tap the <strong>three dots menu (⋮)</strong> in Chrome and tap <strong>&quot;Install app&quot;</strong> (or <strong>&quot;Add to Home screen&quot;</strong>). Android automatically compiles and installs a genuine <strong>WebAPK</strong> onto your device with app icon, splash screen, and offline support.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-m3-surface-container-high border border-m3-outline-variant/30 space-y-1.5">
            <span className="font-bold text-m3-on-surface text-sm flex items-center gap-2">
              <span>📦</span> Option 2: Generate Standalone .APK File (for sideloading / Play Store)
            </span>
            <p>
              Because this app is a fully compliant Progressive Web App with service worker and web manifest, you can generate a signed <code>.apk</code> or <code>.aab</code> in 1 click:
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] text-m3-on-surface">
              <li>Click the <strong>Share</strong> button in AI Studio to publish your shared app link.</li>
              <li>Visit <strong>PWABuilder.com</strong> on your computer.</li>
              <li>Enter your published app URL.</li>
              <li>Click <strong>&quot;Package for Stores&quot; &rarr; &quot;Android&quot;</strong> to download the ready-to-install <strong>.apk</strong> or Google Play <strong>.aab</strong> package!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Offline Storage & Data Management */}
      <div className="rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-m3-outline-variant/30">
          <Info className="w-5 h-5 text-m3-primary" />
          <div>
            <h3 className="text-sm font-bold text-m3-on-surface">Data Storage & Offline Backup</h3>
            <p className="text-xs text-m3-on-surface-variant">
              All your logs and settings are stored locally on your device for total privacy and 100% offline access
            </p>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 rounded-2xl bg-m3-primary-container text-m3-on-primary-container text-xs font-bold">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="px-4 py-2 rounded-2xl bg-m3-surface-container-high border border-m3-outline-variant text-xs font-bold text-m3-on-surface hover:bg-m3-surface-container-highest active:scale-95 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-m3-primary" />
            <span>{backupCopied ? 'Exported!' : 'Export JSON Backup'}</span>
          </button>

          <label className="px-4 py-2 rounded-2xl bg-m3-surface-container-high border border-m3-outline-variant text-xs font-bold text-m3-on-surface hover:bg-m3-surface-container-highest active:scale-95 transition flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-sky-500" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all data and clear your logs?')) {
                onDataReset();
              }
            }}
            className="px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 active:scale-95 transition flex items-center gap-2 ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
