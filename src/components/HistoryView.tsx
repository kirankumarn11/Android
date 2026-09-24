import React, { useState, useRef, useEffect, useMemo } from 'react';
import { WaterLog, AppSettings, ContainerType, BeverageType } from '../types';
import { hapticService } from '../services/hapticService';
import {
  Calendar,
  BarChart2,
  TrendingUp,
  Award,
  Droplet,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Share2,
  Download,
  Filter,
  Search,
  Clock,
  Sun,
  Sunset,
  Moon,
  Sunrise,
  CheckCircle,
  Copy,
  X,
  Coffee,
  Sparkles,
} from 'lucide-react';
import { Cup250Icon, Bottle500Icon, LargeBottle750Icon, ContainerSymbol } from './ContainerIcons';

interface HistoryViewProps {
  logs: WaterLog[];
  settings: AppSettings;
  onDeleteLog?: (id: string) => void;
  onAddBackdatedLog?: (
    amount: number,
    containerType: ContainerType,
    beverageType: BeverageType,
    timestamp: number,
    note?: string
  ) => void;
}

type ChartMetric = 'volume' | 'percentage' | 'count';
type TimeOfDayQuadrant = 'morning' | 'afternoon' | 'evening' | 'night';

const BEVERAGE_COLORS: Record<BeverageType, { bg: string; text: string; fill: string; border: string }> = {
  water: { bg: 'bg-blue-500/10', text: 'text-blue-500', fill: 'bg-blue-500', border: 'border-blue-500/30' },
  sparkling: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', fill: 'bg-cyan-400', border: 'border-cyan-500/30' },
  lemon: { bg: 'bg-amber-400/10', text: 'text-amber-500', fill: 'bg-amber-400', border: 'border-amber-400/30' },
  tea: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', fill: 'bg-emerald-500', border: 'border-emerald-500/30' },
  electrolyte: { bg: 'bg-purple-500/10', text: 'text-purple-500', fill: 'bg-purple-500', border: 'border-purple-500/30' },
  coffee: { bg: 'bg-amber-700/10', text: 'text-amber-700 dark:text-amber-400', fill: 'bg-amber-700', border: 'border-amber-700/30' },
};

export const HistoryView: React.FC<HistoryViewProps> = ({
  logs,
  settings,
  onDeleteLog,
  onAddBackdatedLog,
}) => {
  const [selectedDaysBack, setSelectedDaysBack] = useState<number>(7);
  const [selectedDateKey, setSelectedDateKey] = useState<string>('');
  const [chartMetric, setChartMetric] = useState<ChartMetric>('volume');
  const [logsViewMode, setLogsViewMode] = useState<'day' | 'all'>('day');

  // Interactive filters
  const [selectedBeverageFilter, setSelectedBeverageFilter] = useState<BeverageType | 'all'>('all');
  const [selectedContainerFilter, setSelectedContainerFilter] = useState<ContainerType | 'all'>('all');
  const [selectedTimeQuadrant, setSelectedTimeQuadrant] = useState<TimeOfDayQuadrant | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive Quick Log modal state for historical day
  const [isBackfillModalOpen, setIsBackfillModalOpen] = useState(false);
  const [backfillAmount, setBackfillAmount] = useState<number>(settings.cupVolume);
  const [backfillContainer, setBackfillContainer] = useState<ContainerType>('cup');
  const [backfillBeverage, setBackfillBeverage] = useState<BeverageType>('water');
  const [backfillTime, setBackfillTime] = useState<string>('12:00');
  const [backfillNote, setBackfillNote] = useState<string>('');

  // Share / Copy status
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Group logs by local date string YYYY-MM-DD
  const logsByDate = useMemo(() => {
    return logs.reduce<Record<string, WaterLog[]>>((acc, log) => {
      const d = new Date(log.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(log);
      return acc;
    }, {});
  }, [logs]);

  // Compute past days dataset
  const pastDays = useMemo(() => {
    const now = new Date();
    return Array.from({ length: selectedDaysBack }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (selectedDaysBack - 1 - i));
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayLogs = (logsByDate[dateKey] || []).slice().sort((a, b) => a.timestamp - b.timestamp);
      const totalMl = dayLogs.reduce((sum, l) => sum + l.amount, 0);
      const cupCount = dayLogs.filter((l) => l.containerType === 'cup').length;
      const bottleCount = dayLogs.filter((l) => l.containerType === 'bottle' || l.containerType === 'large_bottle').length;
      const percentage = Math.round((totalMl / settings.dailyGoal) * 100);

      return {
        date: d,
        dateKey,
        dayName: d.toLocaleDateString([], { weekday: 'short' }),
        formattedDate: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        totalMl,
        percentage,
        count: dayLogs.length,
        cupCount,
        bottleCount,
        logs: dayLogs,
      };
    });
  }, [selectedDaysBack, logsByDate, settings.dailyGoal]);

  // Set default selected date to today (or latest day in view)
  useEffect(() => {
    if (!selectedDateKey && pastDays.length > 0) {
      setSelectedDateKey(pastDays[pastDays.length - 1].dateKey);
    }
  }, [pastDays, selectedDateKey]);

  // Active selected day data
  const activeDayData = useMemo(() => {
    if (!selectedDateKey) return pastDays[pastDays.length - 1];
    return pastDays.find((d) => d.dateKey === selectedDateKey) || pastDays[pastDays.length - 1];
  }, [pastDays, selectedDateKey]);

  // Current active day index in pastDays
  const activeDayIndex = useMemo(() => {
    if (!activeDayData) return -1;
    return pastDays.findIndex((d) => d.dateKey === activeDayData.dateKey);
  }, [pastDays, activeDayData]);

  // Overall analytics metrics
  const totalMlLogged = logs.reduce((sum, l) => sum + l.amount, 0);
  const daysWithGoalMet = pastDays.filter((d) => d.totalMl >= settings.dailyGoal).length;
  const goalAchievementRate = Math.round((daysWithGoalMet / pastDays.length) * 100) || 0;
  const averageDailyMl = Math.round(
    pastDays.reduce((sum, d) => sum + d.totalMl, 0) / (pastDays.length || 1)
  );

  let bestDay = { dateStr: 'N/A', amount: 0 };
  Object.entries(logsByDate).forEach(([dateStr, dLogs]) => {
    const total = dLogs.reduce((s, l) => s + l.amount, 0);
    if (total > bestDay.amount) {
      bestDay = { dateStr, amount: total };
    }
  });

  // Dynamic maximum for chart scale
  const maxChartMl = Math.max(
    settings.dailyGoal * 1.25,
    ...pastDays.map((d) => d.totalMl),
    1000
  );
  const maxChartCount = Math.max(6, ...pastDays.map((d) => d.count));
  const maxChartPercent = Math.max(120, ...pastDays.map((d) => d.percentage));

  // Time of Day distribution for the active day
  const timeDistribution = useMemo(() => {
    if (!activeDayData) return { morning: 0, afternoon: 0, evening: 0, night: 0 };
    const dist = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    activeDayData.logs.forEach((log) => {
      const hours = new Date(log.timestamp).getHours();
      if (hours >= 6 && hours < 12) dist.morning += log.amount;
      else if (hours >= 12 && hours < 17) dist.afternoon += log.amount;
      else if (hours >= 17 && hours < 22) dist.evening += log.amount;
      else dist.night += log.amount;
    });

    return dist;
  }, [activeDayData]);

  // Beverage distribution for the active day or timeframe
  const targetLogsForDistribution = logsViewMode === 'day' ? (activeDayData?.logs || []) : logs;
  const beverageDistribution = useMemo(() => {
    const counts: Record<BeverageType, number> = {
      water: 0,
      sparkling: 0,
      lemon: 0,
      tea: 0,
      electrolyte: 0,
      coffee: 0,
    };
    targetLogsForDistribution.forEach((l) => {
      counts[l.beverageType] = (counts[l.beverageType] || 0) + l.amount;
    });
    return counts;
  }, [targetLogsForDistribution]);

  const totalDistributionMl = Object.values(beverageDistribution).reduce((a, b) => a + b, 0) || 1;

  // Filtered displayed logs
  const baseLogs = logsViewMode === 'day'
    ? (activeDayData?.logs || [])
    : pastDays.flatMap((d) => d.logs).sort((a, b) => b.timestamp - a.timestamp);

  const displayedLogs = useMemo(() => {
    return baseLogs.filter((log) => {
      // Beverage filter
      if (selectedBeverageFilter !== 'all' && log.beverageType !== selectedBeverageFilter) {
        return false;
      }
      // Container filter
      if (selectedContainerFilter !== 'all' && log.containerType !== selectedContainerFilter) {
        return false;
      }
      // Time quadrant filter
      if (selectedTimeQuadrant !== 'all') {
        const hours = new Date(log.timestamp).getHours();
        if (selectedTimeQuadrant === 'morning' && (hours < 6 || hours >= 12)) return false;
        if (selectedTimeQuadrant === 'afternoon' && (hours < 12 || hours >= 17)) return false;
        if (selectedTimeQuadrant === 'evening' && (hours < 17 || hours >= 22)) return false;
        if (selectedTimeQuadrant === 'night' && hours >= 6 && hours < 22) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNote = log.note?.toLowerCase().includes(q);
        const matchBeverage = log.beverageType.toLowerCase().includes(q);
        const matchContainer = log.containerType.toLowerCase().includes(q);
        if (!matchNote && !matchBeverage && !matchContainer) return false;
      }
      return true;
    });
  }, [baseLogs, selectedBeverageFilter, selectedContainerFilter, selectedTimeQuadrant, searchQuery]);

  // First and last drink times for selected day
  const firstDrinkTime = useMemo(() => {
    if (!activeDayData || activeDayData.logs.length === 0) return null;
    return new Date(activeDayData.logs[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [activeDayData]);

  const lastDrinkTime = useMemo(() => {
    if (!activeDayData || activeDayData.logs.length === 0) return null;
    return new Date(activeDayData.logs[activeDayData.logs.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [activeDayData]);

  const chartScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest days whenever timeframe changes
  useEffect(() => {
    if (chartScrollRef.current) {
      chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth;
    }
  }, [selectedDaysBack]);

  // Navigate to previous day
  const handlePrevDay = () => {
    if (activeDayIndex > 0) {
      hapticService.light();
      setSelectedDateKey(pastDays[activeDayIndex - 1].dateKey);
    }
  };

  // Navigate to next day
  const handleNextDay = () => {
    if (activeDayIndex < pastDays.length - 1) {
      hapticService.light();
      setSelectedDateKey(pastDays[activeDayIndex + 1].dateKey);
    }
  };

  // Jump to today
  const handleJumpToToday = () => {
    hapticService.selection();
    if (pastDays.length > 0) {
      setSelectedDateKey(pastDays[pastDays.length - 1].dateKey);
    }
  };

  // Copy day summary report
  const handleCopySummary = () => {
    if (!activeDayData) return;
    hapticService.success();
    const isGoalMet = activeDayData.totalMl >= settings.dailyGoal;
    const summaryText = `💧 HydroFlow Daily Log (${activeDayData.formattedDate})\n• Intake: ${activeDayData.totalMl} ${settings.unit} / ${settings.dailyGoal} ${settings.unit} (${activeDayData.percentage}%)\n• Status: ${isGoalMet ? 'Goal Achieved! 🎉' : 'In Progress'}\n• Drinks: ${activeDayData.logs.length} logged\n• Active Window: ${firstDrinkTime || 'N/A'} - ${lastDrinkTime || 'N/A'}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  // Export full CSV
  const handleExportCSV = () => {
    hapticService.light();
    const rows = [
      ['Date', 'Time', 'Amount (ml)', 'Container', 'Beverage', 'Note'],
      ...logs.map((log) => {
        const d = new Date(log.timestamp);
        return [
          d.toLocaleDateString(),
          d.toLocaleTimeString(),
          log.amount.toString(),
          log.containerType,
          log.beverageType,
          `"${(log.note || '').replace(/"/g, '""')}"`,
        ];
      }),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hydroflow_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit backdated drink log
  const handleAddBackfill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDayData || !onAddBackdatedLog) return;

    hapticService.waterDrop();
    const [hours, minutes] = backfillTime.split(':').map(Number);
    const targetDate = new Date(activeDayData.date);
    targetDate.setHours(hours || 12, minutes || 0, 0, 0);

    onAddBackdatedLog(
      backfillAmount,
      backfillContainer,
      backfillBeverage,
      targetDate.getTime(),
      backfillNote.trim() || undefined
    );

    setIsBackfillModalOpen(false);
    setBackfillNote('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header: Title, Metric Switcher, and Timeframe Selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-xl font-extrabold text-m3-on-surface flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-m3-primary" />
            <span>Interactive Hydration Analytics</span>
          </h2>
          <p className="text-xs text-m3-on-surface-variant mt-0.5">
            Explore daily intake patterns, circadian hydration rhythm, and drink breakdowns
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Chart Metric Selector */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 text-xs">
            {(
              [
                { id: 'volume' as ChartMetric, label: settings.unit },
                { id: 'percentage' as ChartMetric, label: 'Goal %' },
                { id: 'count' as ChartMetric, label: 'Drinks' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  hapticService.selection();
                  setChartMetric(m.id);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition it-squircle-button ${
                  chartMetric === m.id
                    ? 'bg-m3-primary text-m3-on-primary font-bold shadow-xs'
                    : 'text-m3-on-surface-variant hover:text-m3-on-surface'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Timeframe Selector (7, 14, 30 days) */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 text-xs">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => {
                  hapticService.selection();
                  setSelectedDaysBack(days);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition it-squircle-button ${
                  selectedDaysBack === days
                    ? 'bg-m3-primary text-m3-on-primary font-bold shadow-xs'
                    : 'text-m3-on-surface-variant hover:text-m3-on-surface'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>

          {/* CSV Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="p-1.5 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30 text-m3-on-surface-variant hover:text-m3-primary hover:bg-m3-surface-container-high transition"
            title="Export CSV history"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-[24px] bg-m3-surface-container-low border border-m3-outline-variant/35 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Daily Average
          </span>
          <p className="text-2xl font-black text-m3-on-surface mt-1.5">
            {averageDailyMl.toLocaleString()}{' '}
            <span className="text-xs font-normal text-m3-on-surface-variant">{settings.unit}</span>
          </p>
          <span className="text-[10px] text-m3-on-surface-variant">Past {selectedDaysBack} days</span>
        </div>

        <div className="p-4 rounded-[24px] bg-m3-surface-container-low border border-m3-outline-variant/35 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Goal Rate
          </span>
          <p className="text-2xl font-black text-m3-primary mt-1.5">
            {goalAchievementRate}%
          </p>
          <span className="text-[10px] text-m3-on-surface-variant">
            {daysWithGoalMet} of {pastDays.length} days achieved
          </span>
        </div>

        <div className="p-4 rounded-[24px] bg-m3-surface-container-low border border-m3-outline-variant/35 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5" /> Total Intake
          </span>
          <p className="text-2xl font-black text-m3-on-surface mt-1.5">
            {(totalMlLogged / 1000).toFixed(1)}{' '}
            <span className="text-xs font-normal text-m3-on-surface-variant">Liters</span>
          </p>
          <span className="text-[10px] text-m3-on-surface-variant">{logs.length} logged drinks</span>
        </div>

        <div className="p-4 rounded-[24px] bg-m3-surface-container-low border border-m3-outline-variant/35 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
            <span>🏆</span> Best Record
          </span>
          <p className="text-2xl font-black text-m3-on-surface mt-1.5">
            {bestDay.amount.toLocaleString()}{' '}
            <span className="text-xs font-normal text-m3-on-surface-variant">{settings.unit}</span>
          </p>
          <span className="text-[10px] text-m3-on-surface-variant truncate block">
            {bestDay.dateStr !== 'N/A' ? bestDay.dateStr : 'First drink'}
          </span>
        </div>
      </div>

      {/* Main Interactive Bar Chart Container */}
      <div className="rounded-[28px] bg-m3-surface-container-low border border-m3-outline-variant/35 p-5 sm:p-6 shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-m3-outline-variant/20 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-m3-on-surface">Daily Progress Chart</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-m3-surface-container-highest text-m3-on-surface-variant">
                {chartMetric === 'volume'
                  ? `Volume in ${settings.unit}`
                  : chartMetric === 'percentage'
                  ? 'Goal Completion %'
                  : 'Drinks Logged'}
              </span>
            </div>
            <p className="text-xs text-m3-on-surface-variant mt-0.5">
              Click any bar to inspect that day's logs, rhythm, and breakdown
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-m3-primary" />
              <span>Goal Met</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-m3-surface-container-highest" />
              <span>In Progress</span>
            </div>
          </div>
        </div>

        {/* Scrollable Bar Track */}
        <div
          ref={chartScrollRef}
          className="mt-6 overflow-x-auto overflow-y-hidden pb-2"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div
            className={`relative h-60 flex items-end justify-between pt-6 pb-2 ${
              selectedDaysBack === 30
                ? 'min-w-[700px] lg:min-w-full gap-1'
                : selectedDaysBack === 14
                ? 'min-w-[440px] sm:min-w-full gap-1.5'
                : 'w-full gap-2 sm:gap-3'
            }`}
          >
            {/* Target Goal Dotted Line (when in volume or percentage mode) */}
            {chartMetric === 'volume' && (
              <div
                className="absolute left-0 right-0 border-b-2 border-dashed border-m3-primary/40 z-10 pointer-events-none flex items-center justify-end"
                style={{
                  bottom: `${Math.min(95, (settings.dailyGoal / maxChartMl) * 100)}%`,
                }}
              >
                <span className="sticky right-2 text-[10px] font-bold text-m3-primary bg-m3-surface-container-low px-1.5 py-0.5 rounded-md -translate-y-3 border border-m3-outline-variant/30 shadow-xs">
                  Target {settings.dailyGoal} {settings.unit}
                </span>
              </div>
            )}

            {chartMetric === 'percentage' && (
              <div
                className="absolute left-0 right-0 border-b-2 border-dashed border-m3-primary/40 z-10 pointer-events-none flex items-center justify-end"
                style={{
                  bottom: `${Math.min(95, (100 / maxChartPercent) * 100)}%`,
                }}
              >
                <span className="sticky right-2 text-[10px] font-bold text-m3-primary bg-m3-surface-container-low px-1.5 py-0.5 rounded-md -translate-y-3 border border-m3-outline-variant/30 shadow-xs">
                  100% Target
                </span>
              </div>
            )}

            {pastDays.map((day) => {
              let heightPercent = 6;
              if (chartMetric === 'volume') {
                heightPercent = Math.min(100, Math.max(6, (day.totalMl / maxChartMl) * 100));
              } else if (chartMetric === 'percentage') {
                heightPercent = Math.min(100, Math.max(6, (day.percentage / maxChartPercent) * 100));
              } else {
                heightPercent = Math.min(100, Math.max(6, (day.count / maxChartCount) * 100));
              }

              const isMet = day.totalMl >= settings.dailyGoal;
              const isSelected = activeDayData?.dateKey === day.dateKey;
              const is30Day = selectedDaysBack === 30;

              return (
                <div
                  key={day.dateKey}
                  onClick={() => {
                    hapticService.light();
                    setSelectedDateKey(day.dateKey);
                  }}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                >
                  {/* Rich Floating Tooltip on Hover/Active */}
                  <div
                    className={`opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 pointer-events-none bg-m3-surface-container-highest px-2 py-1 rounded-xl text-[10px] font-bold text-m3-on-surface shadow-md z-30 whitespace-nowrap border border-m3-outline-variant/30 ${
                      isSelected ? 'opacity-100 -top-8' : ''
                    }`}
                  >
                    {day.formattedDate}:{' '}
                    {chartMetric === 'volume'
                      ? `${day.totalMl} ${settings.unit}`
                      : chartMetric === 'percentage'
                      ? `${day.percentage}%`
                      : `${day.count} drinks`}
                  </div>

                  {/* The Interactive Bar */}
                  <div
                    className={`w-full ${
                      is30Day ? 'max-w-[18px]' : selectedDaysBack === 14 ? 'max-w-[26px]' : 'max-w-[36px]'
                    } rounded-t-xl transition-all duration-300 relative ${
                      isMet
                        ? 'bg-m3-primary shadow-xs'
                        : 'bg-m3-surface-container-highest'
                    } ${
                      isSelected
                        ? 'ring-2 ring-m3-primary ring-offset-2 ring-offset-m3-surface scale-y-105'
                        : 'group-hover:scale-y-105'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {isMet && (
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/90" />
                    )}
                  </div>

                  {/* Day Label */}
                  {is30Day ? (
                    <span
                      className={`text-[10px] font-semibold mt-2 transition text-center ${
                        isSelected
                          ? 'text-m3-primary font-bold'
                          : 'text-m3-on-surface-variant'
                      }`}
                    >
                      {day.date.getDate()}
                    </span>
                  ) : (
                    <>
                      <span
                        className={`text-[11px] font-semibold mt-2 transition ${
                          isSelected
                            ? 'text-m3-primary font-bold'
                            : 'text-m3-on-surface-variant'
                        }`}
                      >
                        {day.dayName}
                      </span>
                      <span className="text-[9px] text-m3-on-surface-variant/70 -mt-0.5 hidden sm:block">
                        {day.date.getDate()}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Deep Dive Inspector Card */}
      {activeDayData && (
        <div className="rounded-[28px] bg-m3-surface-container-low border border-m3-outline-variant/35 p-5 sm:p-6 shadow-xs space-y-5">
          {/* Day Inspector Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-m3-outline-variant/20 gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-m3-surface-container rounded-2xl p-1 border border-m3-outline-variant/30">
                <button
                  type="button"
                  onClick={handlePrevDay}
                  disabled={activeDayIndex <= 0}
                  className="p-1.5 rounded-xl hover:bg-m3-surface-container-high disabled:opacity-30 transition cursor-pointer text-m3-on-surface"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextDay}
                  disabled={activeDayIndex >= pastDays.length - 1}
                  className="p-1.5 rounded-xl hover:bg-m3-surface-container-high disabled:opacity-30 transition cursor-pointer text-m3-on-surface"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-m3-on-surface">
                    {activeDayData.formattedDate} ({activeDayData.dayName})
                  </h3>
                  {activeDayIndex === pastDays.length - 1 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-m3-primary/10 text-m3-primary">
                      Today
                    </span>
                  ) : activeDayIndex === pastDays.length - 2 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-m3-surface-container-highest text-m3-on-surface-variant">
                      Yesterday
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-m3-on-surface-variant">
                  {activeDayData.totalMl} {settings.unit} total intake • {activeDayData.percentage}% of {settings.dailyGoal} {settings.unit} goal
                </p>
              </div>
            </div>

            {/* Quick Action Buttons: Share, Backfill Log, Jump Today */}
            <div className="flex items-center gap-2">
              {activeDayIndex !== pastDays.length - 1 && (
                <button
                  type="button"
                  onClick={handleJumpToToday}
                  className="px-2.5 py-1.5 rounded-xl bg-m3-surface-container text-xs font-semibold text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-high transition"
                >
                  Today
                </button>
              )}

              <button
                type="button"
                onClick={handleCopySummary}
                className="px-3 py-1.5 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30 text-xs font-semibold text-m3-on-surface hover:bg-m3-surface-container-high transition flex items-center gap-1.5"
                title="Copy day report"
              >
                {copiedSummary ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-m3-primary" />
                    <span>Copy Summary</span>
                  </>
                )}
              </button>

              {onAddBackdatedLog && (
                <button
                  type="button"
                  onClick={() => {
                    hapticService.light();
                    setIsBackfillModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-m3-primary text-m3-on-primary text-xs font-bold hover:opacity-90 active:scale-95 transition flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log to this day</span>
                </button>
              )}
            </div>
          </div>

          {/* Day Metrics Trio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/20 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  activeDayData.totalMl >= settings.dailyGoal
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-m3-surface-container-highest text-m3-on-surface-variant'
                }`}
              >
                {activeDayData.percentage}%
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-m3-primary block">
                  Goal Status
                </span>
                <span className="text-xs font-bold text-m3-on-surface block truncate">
                  {activeDayData.totalMl >= settings.dailyGoal
                    ? `Goal Met (+${activeDayData.totalMl - settings.dailyGoal} ${settings.unit})`
                    : `${settings.dailyGoal - activeDayData.totalMl} ${settings.unit} to reach target`}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-m3-surface-container-highest text-m3-primary flex items-center justify-center shrink-0">
                <Droplet className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-m3-primary block">
                  Drink Sessions
                </span>
                <span className="text-xs font-bold text-m3-on-surface block truncate">
                  {activeDayData.logs.length} logged drinks
                  {activeDayData.logs.length > 0 &&
                    ` • avg ${Math.round(activeDayData.totalMl / activeDayData.logs.length)} ${settings.unit}`}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-m3-surface-container-highest text-m3-primary flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-m3-primary block">
                  Intake Window
                </span>
                <span className="text-xs font-bold text-m3-on-surface block truncate">
                  {firstDrinkTime && lastDrinkTime
                    ? `${firstDrinkTime} → ${lastDrinkTime}`
                    : 'No drinks logged yet'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Circadian Hydration Rhythm Quadrants */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Circadian Hydration Rhythm (Tap to filter)</span>
              </span>
              {selectedTimeQuadrant !== 'all' && (
                <button
                  type="button"
                  onClick={() => {
                    hapticService.light();
                    setSelectedTimeQuadrant('all');
                  }}
                  className="text-[10px] font-bold text-m3-primary hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear Time Filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                {
                  id: 'morning' as TimeOfDayQuadrant,
                  label: 'Morning',
                  hours: '6 AM - 12 PM',
                  icon: Sunrise,
                  amount: timeDistribution.morning,
                },
                {
                  id: 'afternoon' as TimeOfDayQuadrant,
                  label: 'Afternoon',
                  hours: '12 PM - 5 PM',
                  icon: Sun,
                  amount: timeDistribution.afternoon,
                },
                {
                  id: 'evening' as TimeOfDayQuadrant,
                  label: 'Evening',
                  hours: '5 PM - 10 PM',
                  icon: Sunset,
                  amount: timeDistribution.evening,
                },
                {
                  id: 'night' as TimeOfDayQuadrant,
                  label: 'Night',
                  hours: '10 PM - 6 AM',
                  icon: Moon,
                  amount: timeDistribution.night,
                },
              ].map((quad) => {
                const isSelected = selectedTimeQuadrant === quad.id;
                const Icon = quad.icon;
                const percent = activeDayData.totalMl > 0
                  ? Math.round((quad.amount / activeDayData.totalMl) * 100)
                  : 0;

                return (
                  <button
                    key={quad.id}
                    type="button"
                    onClick={() => {
                      hapticService.light();
                      setSelectedTimeQuadrant(isSelected ? 'all' : quad.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all it-squircle-button cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-m3-primary text-m3-on-primary shadow-xs ring-2 ring-m3-primary/30 border-transparent'
                        : 'bg-m3-surface-container text-m3-on-surface border-m3-outline-variant/30 hover:bg-m3-surface-container-high'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold">{quad.label}</span>
                      <Icon
                        className={`w-4 h-4 ${
                          isSelected ? 'text-white' : 'text-m3-primary'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        isSelected ? 'text-white/80' : 'text-m3-on-surface-variant'
                      }`}
                    >
                      {quad.hours}
                    </span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-sm font-extrabold">
                        {quad.amount} <span className="text-[10px] font-normal">{settings.unit}</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          isSelected ? 'text-white/90' : 'text-m3-on-surface-variant'
                        }`}
                      >
                        {percent}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Beverage Breakdown Chips & Proportion Bar */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5" />
                <span>Beverage Breakdown (Tap to filter logs)</span>
              </span>
              {selectedBeverageFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => {
                    hapticService.light();
                    setSelectedBeverageFilter('all');
                  }}
                  className="text-[10px] font-bold text-m3-primary hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear Beverage Filter
                </button>
              )}
            </div>

            {/* Proportion Bar */}
            <div className="h-2.5 rounded-full bg-m3-surface-container-highest overflow-hidden flex">
              {(Object.keys(beverageDistribution) as BeverageType[]).map((bev) => {
                const amount = beverageDistribution[bev];
                if (amount <= 0) return null;
                const pct = (amount / totalDistributionMl) * 100;
                const colors = BEVERAGE_COLORS[bev];
                return (
                  <div
                    key={bev}
                    style={{ width: `${pct}%` }}
                    className={`${colors.fill} transition-all duration-300`}
                    title={`${bev}: ${amount}${settings.unit} (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>

            {/* Beverage Filter Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(Object.keys(beverageDistribution) as BeverageType[]).map((bev) => {
                const amount = beverageDistribution[bev];
                const isSelected = selectedBeverageFilter === bev;
                const colors = BEVERAGE_COLORS[bev];

                return (
                  <button
                    key={bev}
                    type="button"
                    onClick={() => {
                      hapticService.light();
                      setSelectedBeverageFilter(isSelected ? 'all' : bev);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition it-squircle-button flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-m3-primary text-m3-on-primary border-transparent shadow-xs'
                        : `${colors.bg} ${colors.text} ${colors.border} hover:opacity-90`
                    }`}
                  >
                    <span className="capitalize">{bev}</span>
                    <span className="text-[10px] opacity-80 font-bold">
                      {amount} {settings.unit}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hydration Logs Section with Search, Container Filter, and View Mode */}
      <div className="rounded-[28px] bg-m3-surface-container-low border border-m3-outline-variant/35 p-5 shadow-xs overflow-hidden space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-m3-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-m3-on-surface">
                {logsViewMode === 'day'
                  ? `${activeDayData?.formattedDate} (${activeDayData?.dayName}) Entries`
                  : `Past ${selectedDaysBack} Days Entries`}
              </h4>
              <p className="text-xs text-m3-on-surface-variant">
                Showing {displayedLogs.length} matching drink records
              </p>
            </div>
          </div>

          {/* View Mode Toggle: Day vs All [7d/14d/30d] Logs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/30 text-xs">
              <button
                type="button"
                onClick={() => {
                  hapticService.selection();
                  setLogsViewMode('day');
                }}
                className={`px-3 py-1 rounded-xl font-semibold transition it-squircle-button ${
                  logsViewMode === 'day'
                    ? 'bg-m3-primary text-m3-on-primary font-bold shadow-xs'
                    : 'text-m3-on-surface-variant hover:text-m3-on-surface'
                }`}
              >
                Day ({activeDayData?.logs.length || 0})
              </button>
              <button
                type="button"
                onClick={() => {
                  hapticService.selection();
                  setLogsViewMode('all');
                }}
                className={`px-3 py-1 rounded-xl font-semibold transition it-squircle-button ${
                  logsViewMode === 'all'
                    ? 'bg-m3-primary text-m3-on-primary font-bold shadow-xs'
                    : 'text-m3-on-surface-variant hover:text-m3-on-surface'
                }`}
              >
                All {selectedDaysBack}d ({baseLogs.length})
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Row: Search & Container Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-m3-on-surface-variant/60" />
            <input
              type="text"
              placeholder="Search drink notes, beverage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30 text-xs text-m3-on-surface placeholder:text-m3-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-m3-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-m3-on-surface-variant hover:text-m3-on-surface"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Container Filter Buttons */}
          <div className="flex items-center gap-1 self-start sm:self-auto overflow-x-auto w-full sm:w-auto p-1 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30 text-[11px]">
            {(
              [
                { id: 'all' as ContainerType | 'all', label: 'All' },
                { id: 'cup' as ContainerType, label: 'Cup' },
                { id: 'bottle' as ContainerType, label: 'Bottle' },
                { id: 'large_bottle' as ContainerType, label: 'Large' },
              ] as const
            ).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  hapticService.light();
                  setSelectedContainerFilter(c.id);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                  selectedContainerFilter === c.id
                    ? 'bg-m3-primary text-m3-on-primary font-bold shadow-xs'
                    : 'text-m3-on-surface-variant hover:text-m3-on-surface'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Logs Grid */}
        <div className="h-64 sm:h-72 overflow-y-auto overscroll-contain pr-1 custom-scrollbar">
          {displayedLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-m3-on-surface-variant">
              <Droplet className="w-8 h-8 text-m3-outline-variant/60 mb-2" />
              <p className="text-xs font-semibold">No hydration records match your active filters.</p>
              <span className="text-[11px] text-m3-on-surface-variant/70 mt-0.5">
                Try clearing search or beverage filters, or log a drink.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {displayedLogs.map((log) => {
                const logDate = new Date(log.timestamp);
                const dateLabel = logDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
                const timeLabel = logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const colors = BEVERAGE_COLORS[log.beverageType] || BEVERAGE_COLORS.water;

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant/20 flex items-center justify-between text-xs hover:border-m3-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text}`}
                      >
                        <ContainerSymbol type={log.containerType} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-m3-on-surface block truncate">
                          +{log.amount} {settings.unit}
                        </span>
                        <span className="text-[10px] text-m3-on-surface-variant capitalize block truncate">
                          {log.beverageType} • {logsViewMode === 'all' ? `${dateLabel}, ` : ''}{timeLabel}
                        </span>
                        {log.note && (
                          <span className="text-[9px] text-m3-on-surface-variant/80 italic block truncate">
                            "{log.note}"
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete action button */}
                    {onDeleteLog && (
                      <button
                        type="button"
                        onClick={() => {
                          hapticService.medium();
                          onDeleteLog(log.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-m3-on-surface-variant hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer shrink-0"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Backdated Quick Log Modal */}
      {isBackfillModalOpen && activeDayData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-m3-surface rounded-[28px] border border-m3-outline-variant/30 p-6 max-w-sm w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-m3-outline-variant/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-m3-on-surface">Log to {activeDayData.formattedDate}</h3>
                  <p className="text-[11px] text-m3-on-surface-variant">Add forgotten intake to this date</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBackfillModalOpen(false)}
                className="p-1 rounded-lg text-m3-on-surface-variant hover:text-m3-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBackfill} className="space-y-3.5">
              {/* Container / Quick Volume Presets */}
              <div>
                <label className="text-[11px] font-bold text-m3-primary uppercase tracking-wider block mb-1.5">
                  Select Container & Amount
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: 'cup' as ContainerType,
                      label: `Cup (${settings.cupVolume} ${settings.unit})`,
                      amount: settings.cupVolume,
                      icon: Cup250Icon,
                    },
                    {
                      id: 'bottle' as ContainerType,
                      label: `Bottle (${settings.bottleVolume} ${settings.unit})`,
                      amount: settings.bottleVolume,
                      icon: Bottle500Icon,
                    },
                    {
                      id: 'large_bottle' as ContainerType,
                      label: `Large (${settings.largeBottleVolume} ${settings.unit})`,
                      amount: settings.largeBottleVolume,
                      icon: LargeBottle750Icon,
                    },
                  ].map((preset) => {
                    const isSelected = backfillAmount === preset.amount && backfillContainer === preset.id;
                    const Icon = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          hapticService.light();
                          setBackfillAmount(preset.amount);
                          setBackfillContainer(preset.id);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          isSelected
                            ? 'bg-m3-primary text-m3-on-primary border-transparent font-bold shadow-xs'
                            : 'bg-m3-surface-container border-m3-outline-variant/30 text-m3-on-surface hover:bg-m3-surface-container-high'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-[10px] block leading-tight">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Beverage Type Selection */}
              <div>
                <label className="text-[11px] font-bold text-m3-primary uppercase tracking-wider block mb-1.5">
                  Beverage Type
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['water', 'sparkling', 'lemon', 'tea', 'electrolyte', 'coffee'] as BeverageType[]).map((bev) => (
                    <button
                      key={bev}
                      type="button"
                      onClick={() => {
                        hapticService.light();
                        setBackfillBeverage(bev);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-xs capitalize transition ${
                        backfillBeverage === bev
                          ? 'bg-m3-primary text-m3-on-primary font-bold shadow-xs'
                          : 'bg-m3-surface-container text-m3-on-surface border border-m3-outline-variant/30 hover:bg-m3-surface-container-high'
                      }`}
                    >
                      {bev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time of Day */}
              <div>
                <label className="text-[11px] font-bold text-m3-primary uppercase tracking-wider block mb-1">
                  Time of Drink
                </label>
                <input
                  type="time"
                  value={backfillTime}
                  onChange={(e) => setBackfillTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30 text-xs text-m3-on-surface focus:outline-none focus:ring-1 focus:ring-m3-primary"
                  required
                />
              </div>

              {/* Optional Note */}
              <div>
                <label className="text-[11px] font-bold text-m3-primary uppercase tracking-wider block mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Post-run, with lunch"
                  value={backfillNote}
                  onChange={(e) => setBackfillNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30 text-xs text-m3-on-surface focus:outline-none focus:ring-1 focus:ring-m3-primary"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBackfillModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-m3-surface-container text-xs font-semibold text-m3-on-surface hover:bg-m3-surface-container-high transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-m3-primary text-m3-on-primary text-xs font-bold hover:opacity-90 active:scale-95 transition shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
