import React, { useState } from 'react';
import { BeverageType, ContainerType } from '../types';
import { X, Check } from 'lucide-react';

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

  const beverages: { id: BeverageType; name: string; emoji: string; color: string }[] = [
    { id: 'water', name: 'Water', emoji: '💧', color: 'text-sky-500' },
    { id: 'lemon', name: 'Infused', emoji: '🍋', color: 'text-yellow-500' },
    { id: 'sparkling', name: 'Sparkling', emoji: '🫧', color: 'text-cyan-400' },
    { id: 'tea', name: 'Herbal Tea', emoji: '🍵', color: 'text-emerald-500' },
    { id: 'electrolyte', name: 'Electrolyte', emoji: '⚡', color: 'text-orange-500' },
    { id: 'coffee', name: 'Coffee', emoji: '☕', color: 'text-amber-700' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    onLog(amount, container, beverage, note.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-m3-surface-container-high border border-m3-outline-variant p-6 shadow-m3-3 text-m3-on-surface">
        <div className="flex items-center justify-between pb-3 border-b border-m3-outline-variant/40">
          <div>
            <h3 className="text-base font-bold text-m3-on-surface">Log Custom Hydration</h3>
            <p className="text-xs text-m3-on-surface-variant">Select beverage and volume</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-m3-on-surface-variant hover:bg-m3-surface-variant transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Amount Display & Slider */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface-variant">
                Intake Amount
              </label>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  min="10"
                  max="3000"
                  step="10"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-20 text-right text-lg font-bold bg-m3-surface-container border border-m3-outline-variant rounded-lg px-2 py-0.5 text-m3-on-surface"
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
              className="w-full accent-m3-primary cursor-pointer"
            />

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setAmount(q)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition ${
                    amount === q
                      ? 'bg-m3-primary text-m3-on-primary font-bold shadow-xs'
                      : 'bg-m3-surface-container text-m3-on-surface hover:bg-m3-surface-container-highest border border-m3-outline-variant/30'
                  }`}
                >
                  +{q}
                </button>
              ))}
            </div>
          </div>

          {/* Beverage Type */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface-variant block mb-1.5">
              Beverage Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {beverages.map((b) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setBeverage(b.id)}
                  className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-medium border transition ${
                    beverage === b.id
                      ? 'bg-m3-primary-container border-m3-primary text-m3-on-primary-container font-bold shadow-xs'
                      : 'bg-m3-surface-container border-m3-outline-variant/30 text-m3-on-surface hover:bg-m3-surface-container-highest'
                  }`}
                >
                  <span className="text-sm">{b.emoji}</span>
                  <span className="truncate">{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Container Type */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface-variant block mb-1.5">
              Container Used
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cup', label: 'Cup / Glass', icon: '☕' },
                { id: 'bottle', label: 'Bottle', icon: '🍶' },
                { id: 'custom', label: 'Other', icon: '🥤' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setContainer(c.id as ContainerType)}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-medium border transition ${
                    container === c.id
                      ? 'bg-m3-secondary-container border-m3-outline text-m3-on-secondary-container font-bold'
                      : 'bg-m3-surface-container border-m3-outline-variant/30 text-m3-on-surface hover:bg-m3-surface-container-highest'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <input
              type="text"
              placeholder="Optional note (e.g. Post-workout, with lunch)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs bg-m3-surface-container border border-m3-outline-variant rounded-xl px-3 py-2 text-m3-on-surface placeholder:text-m3-on-surface-variant/60 focus:outline-none focus:border-m3-primary"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full bg-m3-surface-container text-xs font-bold text-m3-on-surface hover:bg-m3-surface-container-highest transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full bg-m3-primary text-xs font-bold text-m3-on-primary shadow-m3-1 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5"
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
