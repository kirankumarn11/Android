import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw, Sparkles, Check } from 'lucide-react';

interface HydrationTip {
  id: number;
  category: 'Morning' | 'Energy' | 'Workout' | 'Wellness' | 'Habit' | 'Focus';
  title: string;
  tip: string;
  badge: string;
}

const HYDRATION_TIPS: HydrationTip[] = [
  {
    id: 1,
    category: 'Morning',
    title: 'Jumpstart Your Metabolism',
    tip: 'Drinking 250–500ml of fresh water within 15 minutes of waking replenishes overnight fluid loss and activates digestion.',
    badge: 'Morning Boost',
  },
  {
    id: 2,
    category: 'Focus',
    title: 'Beat 2:00 PM Brain Fog',
    tip: 'Mild dehydration (as little as 1–2% drop in body water) can slow reaction times, induce headaches, and degrade short-term memory.',
    badge: 'Cognitive Health',
  },
  {
    id: 3,
    category: 'Habit',
    title: 'Sip Gradually, Don’t Chug',
    tip: 'Sipping water steadily across each hour allows your kidneys and cells to absorb moisture efficiently rather than flushing it immediately.',
    badge: 'Optimal Absorption',
  },
  {
    id: 4,
    category: 'Workout',
    title: 'Pre & Post-Exercise Hydration',
    tip: 'Drink roughly 250ml 30 minutes before working out, and another 250ml for every 20 minutes of vigorous sweating.',
    badge: 'Athletic Performance',
  },
  {
    id: 5,
    category: 'Wellness',
    title: 'Natural Infusions',
    tip: 'Adding a slice of lemon, lime, fresh cucumber, or mint leaves makes water refreshing without adding processed sugars or artificial sweeteners.',
    badge: 'Healthy Flavor',
  },
  {
    id: 6,
    category: 'Wellness',
    title: 'Eat Your Water Too',
    tip: 'Up to 20% of daily hydration comes from water-dense foods like watermelon (92% water), cucumbers (95%), strawberries, and oranges.',
    badge: 'Dietary Water',
  },
  {
    id: 7,
    category: 'Habit',
    title: 'Thirst Is a Late Signal',
    tip: 'By the time you physically sense dry thirst, your body is already dehydrated by 1–3%. Rely on your regular intervals rather than thirst.',
    badge: 'Proactive Drinking',
  },
  {
    id: 8,
    category: 'Energy',
    title: 'Electrolytes on Hot Days',
    tip: 'If exercising in heat or humidity, plain water isn’t enough—replenish sodium, potassium, and magnesium to prevent cramping and fatigue.',
    badge: 'Electrolyte Balance',
  },
  {
    id: 9,
    category: 'Wellness',
    title: 'Wind Down for Sleep',
    tip: 'Taper off large water intake 60–90 minutes before bedtime to prevent sleep disruptions while keeping your throat comfortable.',
    badge: 'Restful Sleep',
  },
];

export const HydrationTipCard: React.FC = () => {
  // Pick an initial tip based on current hour/day
  const [tipIndex, setTipIndex] = useState(() => {
    const daySeed = new Date().getHours() + new Date().getDate();
    return daySeed % HYDRATION_TIPS.length;
  });
  const [isRotating, setIsRotating] = useState(false);

  const currentTip = HYDRATION_TIPS[tipIndex];

  const handleNextTip = () => {
    setIsRotating(true);
    setTipIndex((prev) => (prev + 1) % HYDRATION_TIPS.length);
    setTimeout(() => setIsRotating(false), 300);
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-m3-surface-container-low border border-m3-outline-variant/35 p-5 shadow-xs transition-colors">
      <div className="flex items-start justify-between gap-3">
        {/* Left header with tip icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center shadow-xs shrink-0">
            <Lightbulb className="w-5 h-5 text-m3-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-m3-primary">
                Daily Hydration Tip
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-m3-surface-container-highest text-m3-on-surface-variant">
                {currentTip.badge}
              </span>
            </div>
            <h3 className="text-sm font-bold text-m3-on-surface mt-0.5">
              {currentTip.title}
            </h3>
          </div>
        </div>

        {/* Shuffle / Next button */}
        <button
          onClick={handleNextTip}
          className="w-8 h-8 rounded-full flex items-center justify-center text-m3-on-surface-variant hover:text-m3-primary hover:bg-m3-surface-container-high transition it-squircle-button shrink-0"
          title="Show next tip"
          aria-label="Next hydration tip"
        >
          <RefreshCw className={`w-3.5 h-3.5 transition-transform duration-300 ${isRotating ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Tip body */}
      <p className="text-xs text-m3-on-surface-variant leading-relaxed mt-3 pl-0.5">
        {currentTip.tip}
      </p>

      {/* Category indicator & subtle sparkle footer */}
      <div className="mt-3 pt-2.5 border-t border-m3-outline-variant/20 flex items-center justify-between text-[11px] text-m3-on-surface-variant/80">
        <span className="flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-m3-primary" />
          Tip {tipIndex + 1} of {HYDRATION_TIPS.length}
        </span>
        <button
          onClick={handleNextTip}
          className="text-xs font-semibold text-m3-primary hover:underline"
        >
          Next tip &rarr;
        </button>
      </div>
    </div>
  );
};
