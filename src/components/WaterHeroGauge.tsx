import React, { useEffect, useState, useRef } from 'react';
import { Droplet, Target, ArrowDownRight, Award, Sparkles } from 'lucide-react';
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
  const targetPercentage = Math.min(Math.round((currentMl / (goalMl || 1)) * 100), 100);
  const isGoalReached = currentMl >= goalMl;
  const remainingMl = Math.max(0, goalMl - currentMl);

  // Animated percentage counter
  const [displayPercentage, setDisplayPercentage] = useState(targetPercentage);
  const [isWaterSurging, setIsWaterSurging] = useState(false);
  const prevCurrentMl = useRef(currentMl);

  // Trigger surge splash animation when water amount increases
  useEffect(() => {
    if (currentMl > prevCurrentMl.current) {
      setIsWaterSurging(true);
      const timer = setTimeout(() => setIsWaterSurging(false), 1200);
      prevCurrentMl.current = currentMl;
      return () => clearTimeout(timer);
    }
    prevCurrentMl.current = currentMl;
  }, [currentMl]);

  // Smooth counter animation loop
  useEffect(() => {
    let animId: number;
    const startVal = displayPercentage;
    const endVal = targetPercentage;
    if (startVal === endVal) return;

    const startTime = performance.now();
    const duration = 650; // ms

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * ease);
      setDisplayPercentage(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [targetPercentage]);

  // SVG wave vertical position based on animated percentage (180 = empty, 15 = 100% full)
  const waveY = Math.max(14, Math.min(182, 186 - (displayPercentage / 100) * 172));

  // Circular progress ring circumference (radius = 74, perimeter = 2 * PI * 74 ≈ 464.95)
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayPercentage / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-m3-surface-container-low border border-m3-outline-variant/35 p-6 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left / Center: Animated Fluid Tank Circular Gauge */}
        <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
          {/* Subtle outer glow ring when goal met or surging */}
          <div
            className={`absolute -inset-1.5 rounded-full transition-all duration-700 pointer-events-none ${
              isGoalReached
                ? 'bg-amber-400/25 blur-md scale-105 animate-pulse'
                : isWaterSurging
                ? 'bg-m3-primary/30 blur-md scale-105'
                : 'opacity-0 scale-95'
            }`}
          />

          {/* Circular Frame */}
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-m3-outline-variant/25 bg-m3-surface-container-lowest shadow-inner">
            {/* SVG Circular Progress Track & Dynamic Waves */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 200 200"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Foreground Wave Gradient */}
                <linearGradient id="fluidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--m3-accent-wave-start, #38bdf8)" />
                  <stop offset="100%" stopColor="var(--m3-accent-wave-end, #0284c7)" />
                </linearGradient>

                {/* Secondary Background Wave Gradient */}
                <linearGradient id="fluidBackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--m3-accent-wave-start, #38bdf8)" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="var(--m3-accent-wave-end, #0284c7)" stopOpacity="0.65" />
                </linearGradient>

                {/* Progress Ring Stroke Gradient */}
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--m3-accent-wave-start, #38bdf8)" />
                  <stop offset="100%" stopColor="var(--m3-primary, #006495)" />
                </linearGradient>
              </defs>

              {/* Smoothly Transitioning Wave Group */}
              <g
                style={{
                  transform: `translateY(${waveY}px)`,
                  transition: 'transform 0.65s cubic-bezier(0.34, 1.3, 0.64, 1)',
                }}
              >
                {/* Secondary Background Wave (moves left) */}
                <g className="animate-wave-slow">
                  <path
                    d="M 0 3 Q 50 -7 100 3 T 200 3 T 300 3 T 400 3 L 400 240 L 0 240 Z"
                    fill="url(#fluidBackGradient)"
                  />
                </g>

                {/* Primary Foreground Wave (moves right) */}
                <g className="animate-wave">
                  <path
                    d="M 0 0 Q 50 8 100 0 T 200 0 T 300 0 T 400 0 L 400 240 L 0 240 Z"
                    fill="url(#fluidGradient)"
                  />
                </g>

                {/* Water surface highlight glint */}
                <path
                  d="M 10 2 Q 40 8 70 2 T 130 2 T 190 2"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeOpacity="0.45"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>

              {/* Animated Floating Bubbles */}
              {displayPercentage > 8 && (
                <>
                  <circle cx="65" cy={Math.min(170, waveY + 28)} r="3" fill="#ffffff" opacity="0.65" className="animate-bounce" style={{ animationDuration: '2.8s' }} />
                  <circle cx="130" cy={Math.min(175, waveY + 45)} r="2.2" fill="#ffffff" opacity="0.5" className="animate-bounce" style={{ animationDuration: '3.4s' }} />
                  <circle cx="100" cy={Math.min(180, waveY + 65)} r="3.5" fill="#ffffff" opacity="0.4" className="animate-bounce" style={{ animationDuration: '2.2s' }} />
                  <circle cx="145" cy={Math.min(185, waveY + 80)} r="2" fill="#ffffff" opacity="0.6" className="animate-bounce" style={{ animationDuration: '3.8s' }} />
                </>
              )}

              {/* Outer Perimeter SVG Ring Track */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-m3-outline-variant/20"
              />

              {/* Outer Perimeter Progress Ring with smooth CSS transition */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="url(#ringGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 100 100)"
                style={{
                  transition: 'stroke-dashoffset 0.65s cubic-bezier(0.34, 1.3, 0.64, 1)',
                }}
              />
            </svg>

            {/* Inner Center Badge with Animated Numbers */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none drop-shadow-sm select-none">
              <div className="flex items-center gap-0.5">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {displayPercentage}
                </span>
                <span className="text-lg font-bold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                  %
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-white uppercase tracking-wider mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] flex items-center gap-1">
                {isGoalReached ? (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Target Met!
                  </>
                ) : (
                  'Hydrated'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Clean, Image Toolbox Metric Readouts */}
        <div className="flex-1 w-full space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 fill-current" /> Today's Hydration
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-m3-on-surface tracking-tight">
                {currentMl.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-m3-on-surface-variant">
                / {goalMl.toLocaleString()} {settings.unit}
              </span>
            </div>
          </div>

          {/* Quick Metrics Grid (Image Toolbox pill cards) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/25 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-1.5 text-m3-on-surface-variant text-[11px] font-semibold mb-1">
                <ArrowDownRight className="w-3.5 h-3.5 text-m3-primary" />
                <span>Remaining</span>
              </div>
              <span className="text-base font-extrabold text-m3-on-surface">
                {isGoalReached ? '0' : remainingMl.toLocaleString()} {settings.unit}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/25 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-1.5 text-m3-on-surface-variant text-[11px] font-semibold mb-1">
                <Target className="w-3.5 h-3.5 text-m3-primary" />
                <span>Daily Target</span>
              </div>
              <span className="text-base font-extrabold text-m3-on-surface">
                {goalMl.toLocaleString()} {settings.unit}
              </span>
            </div>
          </div>

          {/* Motivational status bar */}
          <div className="flex items-center gap-2 text-xs text-m3-on-surface-variant">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {isGoalReached
                ? 'Outstanding! You reached your daily hydration goal.'
                : `${remainingMl} ${settings.unit} left to complete your ${streak}-day streak.`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
