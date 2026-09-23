import React from 'react';
import { Droplet, Award, Zap } from 'lucide-react';
import { AppSettings } from '../types';

interface WaterHeroGaugeProps {
  currentMl: number;
  goalMl: number;
  settings: AppSettings;
  streak: number;
}

export const WaterHeroGauge: React.FC<WaterHeroGaugeProps> = ({
  currentMl,
  goalMl,
  settings,
  streak,
}) => {
  const percentage = Math.min(Math.round((currentMl / (goalMl || 1)) * 100), 100);
  const isGoalReached = currentMl >= goalMl;
  const remainingMl = Math.max(0, goalMl - currentMl);

  // SVG wave height offset based on percentage
  // 100% means wave y is at ~10, 0% means wave y is at ~190
  const waveY = Math.max(15, Math.min(185, 190 - (percentage / 100) * 175));

  return (
    <div className="relative overflow-hidden rounded-3xl bg-m3-surface-container border border-m3-outline-variant/40 p-6 shadow-m3-2 transition-all">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-m3-primary/10 blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Fluid Tank Visual */}
        <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
          {/* Circular M3 Container Frame */}
          <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-m3-primary/20 bg-m3-surface-container-lowest shadow-inner">
            {/* Water Wave Canvas SVG */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 200 200"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="fluidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="60%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
                <linearGradient id="fluidBackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Background secondary wave */}
              <g className="animate-wave-slow">
                <path
                  d={`M 0 ${waveY + 4} Q 50 ${waveY - 6} 100 ${waveY + 4} T 200 ${waveY + 4} T 300 ${waveY + 4} T 400 ${waveY + 4} L 400 200 L 0 200 Z`}
                  fill="url(#fluidBackGradient)"
                />
              </g>

              {/* Foreground primary wave */}
              <g className="animate-wave">
                <path
                  d={`M 0 ${waveY} Q 50 ${waveY + 8} 100 ${waveY} T 200 ${waveY} T 300 ${waveY} T 400 ${waveY} L 400 200 L 0 200 Z`}
                  fill="url(#fluidGradient)"
                />
              </g>

              {/* Bubble particle sparkles */}
              {percentage > 10 && (
                <>
                  <circle cx="90" cy={waveY + 25} r="2.5" fill="#ffffff" opacity="0.6" className="animate-pulse" />
                  <circle cx="120" cy={waveY + 45} r="3" fill="#ffffff" opacity="0.4" />
                  <circle cx="70" cy={waveY + 60} r="2" fill="#ffffff" opacity="0.5" />
                </>
              )}
            </svg>

            {/* Inner Center Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none drop-shadow-md">
              <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                {percentage}%
              </span>
              <span className="text-[11px] font-bold text-sky-100 uppercase tracking-widest mt-0.5">
                {isGoalReached ? 'Completed!' : 'Today'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Metrics & Target Details */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 fill-current" /> Daily Hydration
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-m3-on-surface">
                  {currentMl.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-m3-on-surface-variant">
                  / {goalMl.toLocaleString()} {settings.unit}
                </span>
              </div>
            </div>

            {/* Daily badge */}
            {isGoalReached ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-xs">
                <Award className="w-4 h-4" />
                <span>Goal Met!</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-m3-secondary-container text-m3-on-secondary-container text-xs font-semibold">
                <Zap className="w-3.5 h-3.5 text-m3-primary" />
                <span>{remainingMl.toLocaleString()} {settings.unit} left</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-m3-surface-container-highest rounded-full h-3 overflow-hidden p-0.5 border border-m3-outline-variant/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Summary chips */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 text-center">
              <span className="text-[10px] uppercase font-bold text-m3-on-surface-variant">Progress</span>
              <p className="text-sm font-bold text-m3-on-surface mt-0.5">{percentage}%</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 text-center">
              <span className="text-[10px] uppercase font-bold text-m3-on-surface-variant">Remaining</span>
              <p className="text-sm font-bold text-m3-on-surface mt-0.5">{remainingMl} {settings.unit}</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 text-center">
              <span className="text-[10px] uppercase font-bold text-m3-on-surface-variant">Streak</span>
              <p className="text-sm font-bold text-orange-500 mt-0.5">{streak} Days 🔥</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
