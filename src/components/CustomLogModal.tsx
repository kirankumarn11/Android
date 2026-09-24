import React, { useState } from 'react';
import { BeverageType, ContainerType } from '../types';
import { X, Check } from 'lucide-react';
import { Cup250Icon, Bottle500Icon, LargeBottle750Icon, CustomGlassIcon } from './ContainerIcons';
import { hapticService } from '../services/hapticService';

interface CustomLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (amount: number, containerType: ContainerType, beverageType: BeverageType, note?: string) => void;
  unit: 'ml' | 'oz';
}

export const CustomLogModal: React.FC<CustomLogModalProps> = ({
  isOpen,
  onClose,
  onLog,
  unit,
}) => {
  const [amount, setAmount] = useState(300);
  const [container, setContainer] = useState<ContainerType>('custom');
  const [beverage, setBeverage] = useState<BeverageType>('water');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const quickAmounts = [100, 150, 200, 250, 300, 400, 500, 750, 1000];

  const beverages: { id: BeverageType; name: string; emoji: string }[] = [
    { id: 'water', name: 'Water', emoji: '💧' },
    { id: 'lemon', name: 'Lemon', emoji: '🍋' },
    { id: 'sparkling', name: 'Sparkling', emoji: '🫧' },
    { id: 'tea', name: 'Tea', emoji: '🍵' },
    { id: 'electrolyte', name: 'Electrolyte', emoji: '⚡' },
    { id: 'coffee', name: 'Coffee', emoji: '☕' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    onLog(amount, container, beverage, note.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-[28px] bg-m3-surface-container border border-m3-outline-variant/40 p-5 sm:p-6 shadow-m3-3 text-m3-on-surface space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-m3-outline-variant/20">
          <div>
            <h3 className="text-base font-bold text-m3-on-surface">Log Custom Drink</h3>
            <p className="text-xs text-m3-on-surface-variant">Specify volume and beverage type</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-m3-on-surface-variant hover:bg-m3-surface-container-high transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Display & Slider */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-m3-primary">
                Volume
              </label>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  min="10"
                  max="3000"
                  step="10"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-24 text-right text-lg font-black bg-m3-surface-container-lowest border border-m3-outline-variant/30 rounded-xl px-2 py-0.5 text-m3-on-surface focus:outline-none"
                />
                <span className="text-xs font-bold text-m3-on-surface-variant">{unit}</span>
              </div>
            </div>

            <input
              type="range"
              min="50"
              max="1500"
              step="25"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => {
                    hapticService.selection();
                    setAmount(q);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-xl font-medium transition it-squircle-button ${
                    amount === q
                      ? 'bg-m3-primary text-m3-on-primary font-bold shadow-xs'
                      : 'bg-m3-surface-container-low text-m3-on-surface hover:bg-m3-surface-container-high border border-m3-outline-variant/20'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Beverage Type Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-m3-primary block mb-1.5">
              Beverage Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {beverages.map((bev) => (
                <button
                  type="button"
                  key={bev.id}
                  onClick={() => {
                    hapticService.selection();
                    setBeverage(bev.id);
                  }}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition it-squircle-button ${
                    beverage === bev.id
                      ? 'bg-m3-primary text-m3-on-primary shadow-xs'
                      : 'bg-m3-surface-container-low border-m3-outline-variant/25 text-m3-on-surface hover:bg-m3-surface-container-high'
                  }`}
                >
                  <span className="text-xl">{bev.emoji}</span>
                  <span>{bev.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Container Type */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-m3-primary block mb-1.5">
              Container
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'cup' as ContainerType, label: 'Cup', icon: Cup250Icon },
                { id: 'bottle' as ContainerType, label: 'Bottle', icon: Bottle500Icon },
                { id: 'large_bottle' as ContainerType, label: 'Large Bottle', icon: LargeBottle750Icon },
                { id: 'custom' as ContainerType, label: 'Custom', icon: CustomGlassIcon },
              ].map((c) => {
                const IconComponent = c.icon;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setContainer(c.id)}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-semibold border transition it-squircle-button flex flex-col items-center justify-center gap-1 ${
                      container === c.id
                        ? 'bg-m3-surface-container-highest border-m3-primary text-m3-on-surface ring-1 ring-m3-primary font-bold'
                        : 'bg-m3-surface-container-low border-m3-outline-variant/20 text-m3-on-surface-variant hover:bg-m3-surface-container-high'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 text-m3-primary" />
                    <span className="text-[10px] mt-0.5 block leading-tight">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-m3-primary block mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Post-workout, with ice..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-m3-surface-container-lowest border border-m3-outline-variant/30 text-xs text-m3-on-surface focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-m3-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-m3-on-surface-variant hover:bg-m3-surface-container-high transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-m3-primary text-m3-on-primary text-xs font-bold shadow-xs hover:brightness-105 active:scale-95 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Log {amount} {unit}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
