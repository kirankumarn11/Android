import React, { useState } from 'react';
import { AppSettings, ThemeAccent, ThemeMode } from '../types';
import { storageService } from '../services/storageService';
import { MONET_PALETTES } from './MonetPaletteModal';
import { Cup250Icon, Bottle500Icon, LargeBottle750Icon } from './ContainerIcons';
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
  CupSoda,
  Palette,
  Check,
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
    let base = weightKg * 35;
    if (activityLevel === 'moderate') base += 350;
    if (activityLevel === 'high') base += 750;
    if (climate === 'hot') base += 500;
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
        setImportStatus('Failed to import backup file.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="px-1">
        <h2 className="text-xl font-extrabold text-m3-on-surface flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-m3-primary" />
          <span>App Preferences & Settings</span>
        </h2>
        <p className="text-xs text-m3-on-surface-variant mt-0.5">
          Material You Monet themes, container sizes, and data backup
        </p>
      </div>

      {/* 1. Image Toolbox Dynamic Monet Palette Customizer */}
      <div className="rounded-[28px] bg-m3-surface-container-low border border-m3-outline-variant/35 p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-m3-outline-variant/20">
          <div className="w-9 h-9 rounded-2xl bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-m3-on-surface">Material You Dynamic Theme</h3>
            <p className="text-xs text-m3-on-surface-variant">
              Image Toolbox dynamic Monet color palettes & dark mode
            </p>
          </div>
        </div>

        {/* Color swatches */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-m3-primary block mb-2">
            Monet Accent Colors
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {MONET_PALETTES.map((p) => {
              const isSelected = settings.themeAccent === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onUpdateSettings({ themeAccent: p.id })}
                  className={`p-3 rounded-2xl border text-left transition-all it-squircle-button flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-m3-surface-container-highest border-m3-primary shadow-xs ring-2 ring-m3-primary/30'
                      : 'bg-m3-surface-container border-m3-outline-variant/30 hover:bg-m3-surface-container-high'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-full relative overflow-hidden shrink-0 border border-black/10"
                    style={{ backgroundColor: p.containerLight }}
                  >
                    <div
                      className="absolute inset-y-0 right-0 w-1/2"
                      style={{ backgroundColor: p.primaryLight }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-m3-on-surface block truncate">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-m3-on-surface-variant block truncate">
                      {p.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dark Mode Selector */}
        <div className="pt-3 border-t border-m3-outline-variant/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-m3-primary block mb-2">
            Appearance
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(
              [
                { id: 'light', name: 'Light', icon: Sun },
                { id: 'dark', name: 'Dark', icon: Moon },
                { id: 'amoled', name: 'AMOLED', icon: Sparkles },
                { id: 'system', name: 'Auto', icon: Monitor },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              const isCurrent = settings.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onUpdateSettings({ theme: t.id })}
                  className={`p-3 rounded-2xl border text-left transition it-squircle-button ${
                    isCurrent
                      ? 'bg-m3-primary text-m3-on-primary font-bold shadow-xs'
                      : 'bg-m3-surface-container text-m3-on-surface border-m3-outline-variant/30 hover:bg-m3-surface-container-high'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-xs block">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Container Volumes Customization */}
      <div className="rounded-[28px] bg-m3-surface-container-low border border-m3-outline-variant/35 p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-m3-outline-variant/20">
          <div className="w-9 h-9 rounded-2xl bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center shrink-0">
            <CupSoda className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-m3-on-surface">Standard Container Volumes</h3>
            <p className="text-xs text-m3-on-surface-variant">
              Quick log sizes for 1-tap entry on the dashboard
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Cup */}
          <div className="p-3.5 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/30">
            <div className="w-8 h-8 rounded-xl bg-m3-primary/10 text-m3-primary flex items-center justify-center mb-2">
              <Cup250Icon className="w-5 h-5" />
            </div>
            <label className="text-xs font-bold text-m3-on-surface block">Standard Cup (250ml)</label>
            <span className="text-[10px] text-m3-on-surface-variant block mb-2">Default glass or mug</span>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                min="50"
                max="1000"
                step="10"
                value={settings.cupVolume}
                onChange={(e) => onUpdateSettings({ cupVolume: Number(e.target.value) })}
                className="w-24 px-2.5 py-1 rounded-xl bg-m3-surface-container-highest font-bold text-m3-on-surface text-sm border-none focus:outline-none"
              />
              <span className="text-xs font-semibold text-m3-on-surface-variant">{settings.unit}</span>
            </div>
          </div>

          {/* Bottle */}
          <div className="p-3.5 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/30">
            <div className="w-8 h-8 rounded-xl bg-m3-primary/10 text-m3-primary flex items-center justify-center mb-2">
              <Bottle500Icon className="w-5 h-5" />
            </div>
            <label className="text-xs font-bold text-m3-on-surface block">Water Bottle (500ml)</label>
            <span className="text-[10px] text-m3-on-surface-variant block mb-2">Reusable everyday bottle</span>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                min="100"
                max="2000"
                step="25"
                value={settings.bottleVolume}
                onChange={(e) => onUpdateSettings({ bottleVolume: Number(e.target.value) })}
                className="w-24 px-2.5 py-1 rounded-xl bg-m3-surface-container-highest font-bold text-m3-on-surface text-sm border-none focus:outline-none"
              />
              <span className="text-xs font-semibold text-m3-on-surface-variant">{settings.unit}</span>
            </div>
          </div>

          {/* Large Bottle */}
          <div className="p-3.5 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/30">
            <div className="w-8 h-8 rounded-xl bg-m3-primary/10 text-m3-primary flex items-center justify-center mb-2">
              <LargeBottle750Icon className="w-5 h-5" />
            </div>
            <label className="text-xs font-bold text-m3-on-surface block">Large Bottle (750ml)</label>
            <span className="text-[10px] text-m3-on-surface-variant block mb-2">Sports bottle or tumbler</span>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                min="200"
                max="3000"
                step="50"
                value={settings.largeBottleVolume}
                onChange={(e) => onUpdateSettings({ largeBottleVolume: Number(e.target.value) })}
                className="w-24 px-2.5 py-1 rounded-xl bg-m3-surface-container-highest font-bold text-m3-on-surface text-sm border-none focus:outline-none"
              />
              <span className="text-xs font-semibold text-m3-on-surface-variant">{settings.unit}</span>
            </div>
          </div>
        </div>

        {/* Unit Selector */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-bold text-m3-on-surface">Measurement Unit</span>
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/30">
            <button
              onClick={() => onUpdateSettings({ unit: 'ml' })}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                settings.unit === 'ml'
                  ? 'bg-m3-primary text-m3-on-primary'
                  : 'text-m3-on-surface-variant hover:text-m3-on-surface'
              }`}
            >
              Milliliters (ml)
            </button>
            <button
              onClick={() => onUpdateSettings({ unit: 'oz' })}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                settings.unit === 'oz'
                  ? 'bg-m3-primary text-m3-on-primary'
                  : 'text-m3-on-surface-variant hover:text-m3-on-surface'
              }`}
            >
              Fluid Ounces (oz)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Hydration Target Calculator */}
      <div className="rounded-[28px] bg-m3-surface-container-low border border-m3-outline-variant/35 p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-m3-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-m3-on-surface">Intake Target Calculator</h3>
              <p className="text-xs text-m3-on-surface-variant">
                Scientific recommendation for your body weight & activity
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-m3-on-surface-variant block">Current Goal</span>
            <span className="text-sm font-black text-m3-primary">{settings.dailyGoal} {settings.unit}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-m3-on-surface block mb-1">
              Weight: {weightKg} kg (≈ {Math.round(weightKg * 2.20462)} lbs)
            </label>
            <input
              type="range"
              min="40"
              max="140"
              step="1"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-m3-on-surface block mb-1">
              Activity Level
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as 'low' | 'moderate' | 'high')}
              className="w-full px-3 py-1.5 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30 text-xs font-semibold text-m3-on-surface focus:outline-none"
            >
              <option value="low">Sedentary (Desk work)</option>
              <option value="moderate">Moderate (30-60m workout)</option>
              <option value="high">Intense (Heavy athletics)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-m3-on-surface block mb-1">
              Climate
            </label>
            <select
              value={climate}
              onChange={(e) => setClimate(e.target.value as 'moderate' | 'hot')}
              className="w-full px-3 py-1.5 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30 text-xs font-semibold text-m3-on-surface focus:outline-none"
            >
              <option value="moderate">Temperate / Indoors</option>
              <option value="hot">Hot / Summer / Humid</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={calculateHydrationGoal}
            className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/30 text-xs font-bold text-m3-on-surface hover:bg-m3-surface-container-high transition it-squircle-button"
          >
            Calculate Optimal Goal
          </button>

          {calculatedGoal && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-m3-on-surface">
                Recommended: <strong className="text-m3-primary">{calculatedGoal} {settings.unit}</strong>
              </span>
              <button
                onClick={handleApplyCalculatedGoal}
                className="px-4 py-1.5 rounded-xl bg-m3-primary text-m3-on-primary text-xs font-bold shadow-xs hover:brightness-105 transition it-squircle-button"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Data Backup & Reset */}
      <div className="rounded-[28px] bg-m3-surface-container-low border border-m3-outline-variant/35 p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-m3-outline-variant/20">
          <div>
            <h3 className="text-sm font-bold text-m3-on-surface">Data Backup & Export</h3>
            <p className="text-xs text-m3-on-surface-variant">
              100% offline storage. Export your hydration history as JSON.
            </p>
          </div>
          {backupCopied && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Downloaded
            </span>
          )}
          {importStatus && (
            <span className="text-xs text-m3-primary font-bold">{importStatus}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="px-4 py-2 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/30 text-xs font-bold text-m3-on-surface hover:bg-m3-surface-container-high transition it-squircle-button flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-m3-primary" />
            <span>Export JSON</span>
          </button>

          <label className="px-4 py-2 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/30 text-xs font-bold text-m3-on-surface hover:bg-m3-surface-container-high transition it-squircle-button flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4 text-m3-primary" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (window.confirm('Reset all water logs and preferences back to initial state?')) {
                onDataReset();
              }
            }}
            className="px-4 py-2 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold border border-red-500/20 transition it-squircle-button flex items-center gap-1.5 ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
