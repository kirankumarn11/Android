import React, { useState } from 'react';
import { AppSettings, HapticIntensity, ThemeAccent, ThemeMode } from '../types';
import { storageService } from '../services/storageService';
import { hapticService, HapticPatternType } from '../services/hapticService';
import { M3Switch } from './RemindersView';
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
  Vibrate,
  Zap,
  Activity,
  Waves,
  CheckCircle2,
  LayoutGrid,
  AppWindow,
  Smartphone,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onDataReset: () => void;
  onOpenWidgetModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onDataReset,
  onOpenWidgetModal,
}) => {
  // Goal calculator state
  const [weightKg, setWeightKg] = useState(70);
  const [activityLevel, setActivityLevel] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [climate, setClimate] = useState<'moderate' | 'hot'>('moderate');
  const [calculatedGoal, setCalculatedGoal] = useState<number | null>(null);

  // Backup state
  const [backupCopied, setBackupCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Haptic feedback testing state
  const [activeHapticTest, setActiveHapticTest] = useState<string | null>(null);

  const handleTestHaptic = (pattern: HapticPatternType) => {
    setActiveHapticTest(pattern);
    hapticService.setConfig(settings.hapticFeedbackEnabled, settings.hapticIntensity);
    hapticService.trigger(pattern);
    setTimeout(() => setActiveHapticTest(null), 700);
  };

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

      {/* Haptic Feedback & Tactile Response Customization */}
      <div className="rounded-[28px] bg-m3-surface-container-low border border-m3-outline-variant/35 p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-m3-outline-variant/20 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center shrink-0">
              <Vibrate className={`w-5 h-5 ${activeHapticTest ? 'animate-bounce text-amber-500' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-m3-on-surface">Haptic Feedback & Tactile Response</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    settings.hapticFeedbackEnabled
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-m3-surface-container-highest text-m3-on-surface-variant'
                  }`}
                >
                  {settings.hapticFeedbackEnabled ? 'HAPTICS ON' : 'DISABLED'}
                </span>
              </div>
              <p className="text-xs text-m3-on-surface-variant">
                Tactile vibrations for drink logging, reminders, and daily goal celebrations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleTestHaptic('water_drop')}
              disabled={!settings.hapticFeedbackEnabled}
              className="px-3 py-1.5 rounded-xl bg-m3-surface-container border border-m3-outline-variant/40 text-xs font-bold text-m3-primary hover:bg-m3-surface-container-high active:scale-95 disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Test droplet vibration"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Test Pulse</span>
            </button>

            <M3Switch
              checked={settings.hapticFeedbackEnabled}
              onChange={(checked) => {
                onUpdateSettings({ hapticFeedbackEnabled: checked });
                hapticService.setConfig(checked, settings.hapticIntensity);
                if (checked) {
                  hapticService.trigger('medium');
                }
              }}
              ariaLabel="Toggle Haptic Feedback"
            />
          </div>
        </div>

        {/* Haptic Intensity Selector */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-m3-primary block">
            Vibration Strength & Feel
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'light' as HapticIntensity,
                label: 'Light Tick',
                desc: '15ms crisp click • Subtle, battery-saving',
                pattern: 'light' as HapticPatternType,
              },
              {
                id: 'medium' as HapticIntensity,
                label: 'Medium Pulse',
                desc: '32ms natural tap • Balanced feel (Recommended)',
                pattern: 'medium' as HapticPatternType,
              },
              {
                id: 'heavy' as HapticIntensity,
                label: 'Heavy Thump',
                desc: '65ms solid thud • Maximum physical impact',
                pattern: 'heavy' as HapticPatternType,
              },
            ].map((item) => {
              const isSelected = settings.hapticIntensity === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onUpdateSettings({ hapticIntensity: item.id });
                    hapticService.setConfig(settings.hapticFeedbackEnabled, item.id);
                    hapticService.trigger(item.pattern);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all it-squircle-button cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-m3-primary text-m3-on-primary shadow-xs ring-2 ring-m3-primary/30 border-transparent'
                      : 'bg-m3-surface-container text-m3-on-surface border-m3-outline-variant/35 hover:bg-m3-surface-container-high'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{item.label}</span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-white text-m3-primary' : 'bg-m3-surface-container-highest text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                  <span
                    className={`text-[11px] leading-tight ${
                      isSelected ? 'text-white/85' : 'text-m3-on-surface-variant'
                    }`}
                  >
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Tactile Test Bench */}
        <div className="pt-2 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Interactive Tactile Patterns</span>
            </span>
            <span className="text-[10px] text-m3-on-surface-variant font-medium">
              Tap any pattern to test vibration
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { id: 'light' as HapticPatternType, label: 'Button Click', sub: 'Single tick' },
              { id: 'water_drop' as HapticPatternType, label: 'Droplet Flutter', sub: 'Double ripple' },
              { id: 'medium' as HapticPatternType, label: 'Cup Logged', sub: 'Standard tap' },
              { id: 'heavy' as HapticPatternType, label: 'Bottle Logged', sub: 'Deep pulse' },
              { id: 'celebration' as HapticPatternType, label: 'Goal Unlocked', sub: 'Fanfare burst' },
              { id: 'warning' as HapticPatternType, label: 'Reminder Nudge', sub: 'Triple buzz' },
            ].map((pat) => {
              const isTesting = activeHapticTest === pat.id;
              return (
                <button
                  key={pat.id}
                  type="button"
                  onClick={() => handleTestHaptic(pat.id)}
                  disabled={!settings.hapticFeedbackEnabled}
                  className={`p-3 rounded-2xl border text-center transition-all it-squircle-button cursor-pointer disabled:opacity-40 ${
                    isTesting
                      ? 'bg-m3-primary text-m3-on-primary border-transparent scale-95 shadow-md ring-2 ring-m3-primary/50'
                      : 'bg-m3-surface-container border-m3-outline-variant/35 text-m3-on-surface hover:bg-m3-surface-container-high'
                  }`}
                >
                  <Waves
                    className={`w-4 h-4 mx-auto mb-1 ${
                      isTesting ? 'animate-ping text-white' : 'text-m3-primary'
                    }`}
                  />
                  <div className="text-[11px] font-bold truncate">{pat.label}</div>
                  <div className="text-[9px] opacity-75 truncate">{pat.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hardware Status & Info */}
        <div className="p-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/30 flex items-center gap-2.5 text-xs text-m3-on-surface-variant">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
          <span>
            {hapticService.isSupported()
              ? 'Web Vibration API hardware active on this device. Physical haptic feedback is ready.'
              : 'Web Vibration API is active for touchscreens & mobile PWAs; visual ripple responses are enabled in this browser.'}
          </span>
        </div>
      </div>

      {/* PWA Home Screen Widget Support */}
      <div className="rounded-[28px] bg-m3-surface-container-low border border-m3-outline-variant/35 p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-m3-outline-variant/20 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center shrink-0">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-m3-on-surface">Home Screen Progress Widgets</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-m3-primary-container text-m3-on-primary-container">
                  PWA Feature
                </span>
              </div>
              <p className="text-xs text-m3-on-surface-variant">
                See your daily water intake and streak without opening the full application
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenWidgetModal && (
              <button
                type="button"
                onClick={onOpenWidgetModal}
                className="px-4 py-2 rounded-xl bg-m3-primary text-m3-on-primary text-xs font-bold hover:brightness-105 active:scale-95 transition it-squircle-button flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Widget Studio</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Card 1: Lockscreen & Mobile */}
          <div className="p-3.5 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/30 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-m3-primary/10 text-m3-primary flex items-center justify-center mb-1">
              <Smartphone className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-m3-on-surface">Mobile & Lock Screen</h4>
            <p className="text-[11px] text-m3-on-surface-variant leading-relaxed">
              Adds dynamic app icon badges and quick-log shortcuts directly on Android & iOS home screens.
            </p>
          </div>

          {/* Card 2: Desktop Floating Widget */}
          <div className="p-3.5 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/30 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-m3-primary/10 text-m3-primary flex items-center justify-center mb-1">
              <AppWindow className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-m3-on-surface">Floating Desktop Widget</h4>
            <p className="text-[11px] text-m3-on-surface-variant leading-relaxed">
              Pop out an always-on-top compact widget window using Document Picture-in-Picture.
            </p>
          </div>

          {/* Card 3: Windows & OS Boards */}
          <div className="p-3.5 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/30 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-m3-primary/10 text-m3-primary flex items-center justify-center mb-1">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-m3-on-surface">PWA Widget Spec</h4>
            <p className="text-[11px] text-m3-on-surface-variant leading-relaxed">
              W3C Adaptive Card templates registered for Windows 11 Widgets Board & Android launchers.
            </p>
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
