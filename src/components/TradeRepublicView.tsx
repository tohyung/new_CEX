import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  CreditCard, 
  Repeat, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  X, 
  Plus, 
  BarChart3,
  Search,
  Check,
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';
import { TradingPair, AssetBalance, SavingsPlan } from '../types';
import { playSound } from '../utils/sound';

interface TradeRepublicViewProps {
  currentPair: TradingPair;
  allPairs: TradingPair[];
  onSelectPair: (pair: TradingPair) => void;
  balances: AssetBalance[];
  onExecuteTrade: (orderData: {
    side: 'buy' | 'sell';
    type: 'market' | 'limit' | 'stop_limit';
    price: number;
    amount: number;
  }) => void;
  onOpenDeposit: () => void;
  onSwitchToProTerminal: () => void;
}

type RepublicTimeframe = '1D' | '1W' | '1M' | '6M' | '1Y' | 'MAX';

export const TradeRepublicView: React.FC<TradeRepublicViewProps> = ({
  currentPair,
  allPairs,
  onSelectPair,
  balances,
  onExecuteTrade,
  onOpenDeposit,
  onSwitchToProTerminal
}) => {
  // Currency selection: Euro (€) is PTIT Exchange's native currency, or USD ($)
  const [currency, setCurrency] = useState<'EUR' | 'USD'>('EUR');
  const fxRate = currency === 'EUR' ? 0.92 : 1.0;
  const currencySymbol = currency === 'EUR' ? '€' : '$';

  // Active sub-tab under hero chart: 'watchlist' | 'yield' | 'savings_plans'
  const [activeSection, setActiveSection] = useState<'watchlist' | 'yield' | 'savings_plans'>('watchlist');
  const [searchQuery, setSearchQuery] = useState('');

  // Timeframe selector (PTIT Exchange style: 1D, 1W, 1M, 6M, 1Y, MAX)
  const [selectedTf, setSelectedTf] = useState<RepublicTimeframe>('1D');

  // Trade Modal / Sheet State
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell' | 'savings_plan'>('buy');
  const [tradeAmountCurrency, setTradeAmountCurrency] = useState<string>('100');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPriceInput, setLimitPriceInput] = useState<string>(currentPair.currentPrice.toString());
  const [savingsFrequency, setSavingsFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [savingsPlanSuccess, setSavingsPlanSuccess] = useState(false);

  // Active Savings Plans (PTIT Exchange Sparpläne)
  const [savingsPlans, setSavingsPlans] = useState<SavingsPlan[]>([
    {
      id: 'sp-1',
      pairSymbol: 'BTC/USDT',
      asset: 'BTC',
      amount: 50,
      frequency: 'weekly',
      nextExecution: 'Next Monday, 09:00',
      totalInvested: 650,
      active: true
    },
    {
      id: 'sp-2',
      pairSymbol: 'ETH/USDT',
      asset: 'ETH',
      amount: 25,
      frequency: 'biweekly',
      nextExecution: 'Next Friday, 09:00',
      totalInvested: 225,
      active: true
    }
  ]);

  // Real-time Cash Interest Yield (PTIT Exchange 3.75% p.a. on uninvested cash)
  const usdtBal = balances.find(b => b.asset === 'USDT')?.free || 10000;
  const cashInSelectedCurrency = usdtBal * fxRate;
  const annualInterestRate = 0.0375; // 3.75% p.a.
  const monthlyYield = (cashInSelectedCurrency * annualInterestRate) / 12;
  
  // Real-time micro-accrual of interest counter
  const [accruedInterest, setAccruedInterest] = useState<number>(42.185);
  useEffect(() => {
    const timer = setInterval(() => {
      const perSec = (cashInSelectedCurrency * annualInterestRate) / (365 * 24 * 3600);
      setAccruedInterest(prev => prev + perSec);
    }, 1000);
    return () => clearInterval(timer);
  }, [cashInSelectedCurrency]);

  // Chart data simulation for smooth PTIT Exchange line curve
  const chartPoints = useMemo(() => {
    const pointsCount = selectedTf === '1D' ? 40 : selectedTf === '1W' ? 50 : selectedTf === '1M' ? 60 : 70;
    const basePrice = currentPair.currentPrice * fxRate;
    const pts: { time: string; price: number; timestamp: number }[] = [];
    
    const now = Date.now();
    const intervalMs = selectedTf === '1D' ? (3600000 * 24) / pointsCount : 
                       selectedTf === '1W' ? (3600000 * 24 * 7) / pointsCount :
                       selectedTf === '1M' ? (3600000 * 24 * 30) / pointsCount : (3600000 * 24 * 180) / pointsCount;

    let walkPrice = basePrice * (1 - (currentPair.change24h / 100) * 0.9);
    for (let i = 0; i < pointsCount; i++) {
      const target = basePrice;
      const noise = (Math.sin(i * 0.5) * 0.015 + (Math.random() - 0.48) * 0.02) * basePrice;
      walkPrice = walkPrice + (target - walkPrice) * 0.08 + noise * 0.2;
      
      const t = now - (pointsCount - i) * intervalMs;
      const dateObj = new Date(t);
      const timeStr = selectedTf === '1D' 
        ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

      pts.push({
        time: timeStr,
        price: i === pointsCount - 1 ? basePrice : Number(walkPrice.toFixed(currentPair.precision)),
        timestamp: t
      });
    }
    return pts;
  }, [currentPair, selectedTf, fxRate]);

  // Interactive scrubbing state (hovering over chart)
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const activePoint = scrubIndex !== null ? chartPoints[scrubIndex] : chartPoints[chartPoints.length - 1];
  const initialPoint = chartPoints[0];
  
  const displayPrice = activePoint ? activePoint.price : currentPair.currentPrice * fxRate;
  const initialPrice = initialPoint ? initialPoint.price : displayPrice;
  const priceDiff = displayPrice - initialPrice;
  const percentDiff = initialPrice > 0 ? (priceDiff / initialPrice) * 100 : currentPair.change24h;
  const isPositive = percentDiff >= 0;

  // Handle chart scrub
  const handleChartMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    const idx = Math.min(chartPoints.length - 1, Math.floor(ratio * chartPoints.length));
    setScrubIndex(idx);
  };

  const handleChartMouseLeave = () => {
    setScrubIndex(null);
  };

  // Convert SVG coordinates for smooth bezier curve
  const svgWidth = 800;
  const svgHeight = 220;
  const minPrice = Math.min(...chartPoints.map(p => p.price));
  const maxPrice = Math.max(...chartPoints.map(p => p.price));
  const priceRange = maxPrice - minPrice || 1;

  const getSvgCoordinates = (index: number, price: number) => {
    const x = (index / (chartPoints.length - 1)) * svgWidth;
    const y = svgHeight - 16 - ((price - minPrice) / priceRange) * (svgHeight - 40);
    return { x, y };
  };

  // Build smooth path
  const pathD = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const coords = chartPoints.map((p, i) => getSvgCoordinates(i, p.price));
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const midX = (prev.x + curr.x) / 2;
      d += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [chartPoints, minPrice, maxPrice]);

  const activeCoord = activePoint && scrubIndex !== null 
    ? getSvgCoordinates(scrubIndex, activePoint.price) 
    : getSvgCoordinates(chartPoints.length - 1, chartPoints[chartPoints.length - 1]?.price || displayPrice);

  // Quick preset amount buttons
  const amountPresets = [25, 50, 100, 250, 500];

  // Execute PTIT Exchange Order
  const handleConfirmOrder = () => {
    const numAmount = parseFloat(tradeAmountCurrency);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (tradeAction === 'savings_plan') {
      const newPlan: SavingsPlan = {
        id: 'sp-' + Date.now(),
        pairSymbol: currentPair.symbol,
        asset: currentPair.baseAsset,
        amount: numAmount,
        frequency: savingsFrequency,
        nextExecution: savingsFrequency === 'weekly' ? 'Next Monday, 09:00' : 'Next 1st of Month, 09:00',
        totalInvested: 0,
        active: true
      };
      setSavingsPlans(prev => [newPlan, ...prev]);
      playSound('order_placed');
      setSavingsPlanSuccess(true);
      setTimeout(() => {
        setSavingsPlanSuccess(false);
        setIsTradeModalOpen(false);
      }, 1600);
      return;
    }

    const priceUsd = (orderType === 'limit' ? parseFloat(limitPriceInput) : currentPair.currentPrice);
    const costUsd = numAmount / fxRate;
    const cryptoAmount = costUsd / priceUsd;

    onExecuteTrade({
      side: tradeAction === 'buy' ? 'buy' : 'sell',
      type: orderType,
      price: priceUsd,
      amount: Number(cryptoAmount.toFixed(currentPair.qtyPrecision))
    });

    playSound('order_fill');
    setIsTradeModalOpen(false);
  };

  // Filtered pairs for the clean watchlist
  const filteredPairs = useMemo(() => {
    if (!searchQuery.trim()) return allPairs;
    const q = searchQuery.toLowerCase();
    return allPairs.filter(p => p.baseAsset.toLowerCase().includes(q) || p.symbol.toLowerCase().includes(q));
  }, [allPairs, searchQuery]);

  return (
    <div className="relative min-h-[calc(100vh-56px)] text-[#d1d4dc] font-republic flex flex-col selection:bg-white/20">
      
      {/* 1. Static 16:9 Fixed Ratio Background Stage (Stationary behind rolling content) */}
      <div 
        id="static-16-9-backdrop" 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-end justify-center select-none"
      >
        {/* Strictly 16:9 fixed ratio canvas container */}
        <div 
          className="relative flex items-end justify-center overflow-hidden pointer-events-none"
          style={{
            width: 'max(100vw, 177.78vh)',
            height: 'max(56.25vw, 100vh)',
            aspectRatio: '16 / 9'
          }}
        >
          {/* Subtle 16:9 top gradient vignette */}
          <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

          {/* Luminous Green Light Zone (Anchored lower in between the bottom of the fixed 16:9 canvas) */}
          <div className="absolute inset-x-0 -bottom-8 sm:-bottom-12 flex justify-center items-end pointer-events-none">
            {/* Broad diffuse emerald aurora bloom diffusing upward */}
            <div className="w-[850px] sm:w-[1250px] h-[330px] sm:h-[430px] bg-gradient-to-t from-emerald-500/25 via-emerald-600/10 to-transparent rounded-t-full blur-[105px] sm:blur-[135px] transform translate-y-16 sm:translate-y-24 animate-green-zone pointer-events-none" />
            {/* Core luminous radiant glow in the center bottom */}
            <div className="absolute bottom-0 w-[460px] sm:w-[700px] h-[190px] sm:h-[250px] bg-emerald-400/25 rounded-t-full blur-[65px] sm:blur-[85px] pointer-events-none" />
            {/* Focused neon center light point */}
            <div className="absolute bottom-0 w-[220px] sm:w-[350px] h-[85px] sm:h-[120px] bg-emerald-300/35 rounded-t-full blur-[35px] pointer-events-none" />
            {/* Subtle luminous green horizon line at the viewport bottom edge */}
            <div className="absolute bottom-8 sm:bottom-12 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. Rolling Content Canvas: The only thing that rolls down */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 py-6 pb-20 flex-1 flex flex-col space-y-6">
        
        {/* A. Hero Asset Display & Fluid Curve (Clean, spacious, unboxed) */}
        <section className="relative">
          {/* Asset Title Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] flex items-center justify-center font-bold text-sm text-white font-republic-display shadow-xs">
                {currentPair.baseAsset.substring(0, 3)}
              </div>
              <div>
                <h1 className="font-republic-display text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                  {currentPair.baseAsset}
                </h1>
                <p className="text-xs text-gray-400 mt-1 font-republic-mono">
                  {currentPair.symbol}
                </p>
              </div>
            </div>

            {/* Currency selector (EUR/USD mode) */}
            <div className="flex items-center">
              <div className="bg-white/[0.06] backdrop-blur-xl p-0.5 rounded-full flex border border-white/[0.12] shadow-sm">
                <button
                  onClick={() => {
                    playSound('click');
                    setCurrency('EUR');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    currency === 'EUR' ? 'bg-white text-black shadow-xs' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  € EUR
                </button>
                <button
                  onClick={() => {
                    playSound('click');
                    setCurrency('USD');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    currency === 'USD' ? 'bg-white text-black shadow-xs' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>
          </div>

          {/* Giant Hero Price with scrub responsiveness */}
          <div className="mt-5">
            <div className="text-4xl sm:text-6xl font-republic-display font-black tracking-tight text-white font-republic-mono leading-none">
              {currencySymbol}{displayPrice.toLocaleString(undefined, { minimumFractionDigits: currentPair.precision, maximumFractionDigits: currentPair.precision })}
            </div>
            
            <div className="flex items-center space-x-2.5 mt-2.5 text-xs font-semibold">
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-republic-mono text-xs ${
                isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
              }`}>
                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>
                  {isPositive ? '+' : ''}{currencySymbol}{Math.abs(priceDiff).toFixed(currentPair.precision)} ({isPositive ? '+' : ''}{percentDiff.toFixed(2)}%)
                </span>
              </span>
              <span className="text-gray-400 font-normal">
                {scrubIndex !== null ? (activePoint?.time || 'Selected point') : `Since ${selectedTf === '1D' ? 'open' : selectedTf}`}
              </span>
            </div>
          </div>

          {/* Fluid Bezier Chart Canvas (PTIT Exchange Clean Line) */}
          <div 
            ref={chartContainerRef}
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
            className="mt-6 w-full h-[200px] sm:h-[230px] relative cursor-crosshair select-none"
          >
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="republicMinimalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Subtle Gradient Area under curve */}
              <path
                d={`${pathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`}
                fill="url(#republicMinimalGrad)"
              />

              {/* Crisp 2.5px Line */}
              <path
                d={pathD}
                fill="none"
                stroke={isPositive ? '#10b981' : '#f43f5e'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Scrubber line and glowing dot */}
              {scrubIndex !== null && (
                <>
                  <line
                    x1={activeCoord.x}
                    y1={0}
                    x2={activeCoord.x}
                    y2={svgHeight}
                    stroke="#444"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={activeCoord.x}
                    cy={activeCoord.y}
                    r="7"
                    fill={isPositive ? '#10b981' : '#f43f5e'}
                    fillOpacity="0.3"
                  />
                  <circle
                    cx={activeCoord.x}
                    cy={activeCoord.y}
                    r="4"
                    fill="#ffffff"
                  />
                </>
              )}
            </svg>
          </div>

          {/* Timeframe selector (Clean typography, no boxes or outlines around them) */}
          <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.08] mt-2 px-1">
            {(['1D', '1W', '1M', '6M', '1Y', 'MAX'] as RepublicTimeframe[]).map(tf => {
              const isActive = selectedTf === tf;
              return (
                <button
                  key={tf}
                  id={`tr-tf-${tf}`}
                  onClick={() => {
                    playSound('click');
                    setSelectedTf(tf);
                  }}
                  className={`relative py-2 px-3 sm:px-4 text-sm sm:text-[15px] font-republic-display transition-all focus:outline-none tracking-tight ${
                    isActive
                      ? 'text-white font-black scale-105'
                      : 'text-gray-400 hover:text-white font-semibold'
                  }`}
                >
                  <span>{tf}</span>
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* B. Key Statistics Strip (Increased Translucent Intensity 4-stat bar) */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
          <div className="bg-white/[0.035] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.10] hover:border-emerald-500/30 rounded-2xl p-3.5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="text-gray-400 text-[11px] font-medium">24h High</div>
            <div className="font-republic-mono font-bold text-white mt-1">
              {currencySymbol}{(currentPair.high24h * fxRate).toLocaleString(undefined, { minimumFractionDigits: currentPair.precision })}
            </div>
          </div>
          <div className="bg-white/[0.035] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.10] hover:border-emerald-500/30 rounded-2xl p-3.5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="text-gray-400 text-[11px] font-medium">24h Low</div>
            <div className="font-republic-mono font-bold text-white mt-1">
              {currencySymbol}{(currentPair.low24h * fxRate).toLocaleString(undefined, { minimumFractionDigits: currentPair.precision })}
            </div>
          </div>
          <div className="bg-white/[0.035] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.10] hover:border-emerald-500/30 rounded-2xl p-3.5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="text-gray-400 text-[11px] font-medium">24h Volume</div>
            <div className="font-republic-mono font-bold text-white mt-1">
              {(currentPair.quoteVolume24h / 1e6 * fxRate).toFixed(1)}M {currency}
            </div>
          </div>
          <div className="bg-white/[0.035] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.10] hover:border-emerald-500/30 rounded-2xl p-3.5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="text-gray-400 text-[11px] font-medium">Custody Standard</div>
            <div className="font-republic-mono font-bold text-emerald-400 mt-1 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>BaFin Regulated</span>
            </div>
          </div>
        </section>

        {/* C. Content Sections (Minimal, Tabbed: Watchlist / 3.75% Yield / Savings Plans) */}
        <section className="pt-2">
          {/* Clean Section Navigation Tabs with High Translucent Intensity */}
          <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-3 mb-4">
            <button
              onClick={() => {
                playSound('click');
                setActiveSection('watchlist');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-republic-display font-bold transition-all ${
                activeSection === 'watchlist'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10]'
              }`}
            >
              Cryptos ({allPairs.length})
            </button>
            <button
              onClick={() => {
                playSound('click');
                setActiveSection('yield');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-republic-display font-bold flex items-center space-x-1.5 transition-all ${
                activeSection === 'yield'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10]'
              }`}
            >
              <Percent className="w-3 h-3 text-emerald-400" />
              <span>3.75% Cash Interest</span>
            </button>
            <button
              onClick={() => {
                playSound('click');
                setActiveSection('savings_plans');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-republic-display font-bold flex items-center space-x-1.5 transition-all ${
                activeSection === 'savings_plans'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10]'
              }`}
            >
              <Repeat className="w-3 h-3 text-amber-400" />
              <span>Sparplan ({savingsPlans.length})</span>
            </button>
          </div>

          {/* Tab 1: Clean Minimalist Watchlist with High Translucent Intensity Glass */}
          {activeSection === 'watchlist' && (
            <div className="space-y-3">
              {/* Minimal Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 10+ cryptocurrencies..."
                  className="w-full bg-white/[0.035] hover:bg-white/[0.05] focus:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.10] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                />
              </div>

              {/* Crypto Row List (Shortened for ~8 coins with internal scroll) */}
              <div className="max-h-[500px] overflow-y-auto divide-y divide-white/[0.08] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.10] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
                {filteredPairs.map(pair => {
                  const isSelected = pair.symbol === currentPair.symbol;
                  const pos = pair.change24h >= 0;
                  const priceConv = pair.currentPrice * fxRate;
                  return (
                    <div
                      key={pair.symbol}
                      onClick={() => {
                        playSound('click');
                        onSelectPair(pair);
                      }}
                      className={`px-4 py-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-white/[0.08] backdrop-blur-md' : 'hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.10] flex items-center justify-center font-bold text-xs text-white font-republic-display">
                          {pair.baseAsset.substring(0, 3)}
                        </div>
                        <div>
                          <div className="font-republic-display font-bold text-xs text-white flex items-center space-x-1.5">
                            <span>{pair.baseAsset}</span>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400">{pair.quoteAsset}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-republic-mono text-xs font-bold text-white">
                          {currencySymbol}{priceConv.toLocaleString(undefined, { minimumFractionDigits: pair.precision, maximumFractionDigits: pair.precision })}
                        </div>
                        <div className={`text-[11px] font-semibold font-republic-mono ${pos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {pos ? '+' : ''}{pair.change24h}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: 3.75% Cash Interest Clean Overview with High Translucent Intensity Glass */}
          {activeSection === 'yield' && (
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-[0_8px_32px_rgba(16,185,129,0.08),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full font-republic-mono border border-emerald-500/30">
                      ACTIVE INTEREST
                    </span>
                    <span className="text-xs text-gray-400">German Banking License</span>
                  </div>
                  <h3 className="text-xl font-republic-display font-black text-white mt-1">
                    3.75% p.a. on Cash
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-lg leading-relaxed">
                    Earn full European Central Bank interest rate pass-through on your uninvested cash balance. Accrued daily, paid on the 1st of every month.
                  </p>
                </div>

                <button
                  onClick={() => {
                    playSound('click');
                    onOpenDeposit();
                  }}
                  className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-full text-xs font-bold font-republic-display transition-all shadow-xs active:scale-95"
                >
                  Deposit Cash
                </button>
              </div>

              {/* Interest metrics strip with high translucent intensity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.10] p-3.5 rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                  <div className="text-[11px] text-gray-400 font-medium">Uninvested Cash</div>
                  <div className="text-base font-republic-mono font-bold text-white mt-1">
                    {currencySymbol}{cashInSelectedCurrency.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="bg-emerald-500/[0.06] backdrop-blur-2xl border border-emerald-500/30 p-3.5 rounded-xl shadow-[inset_0_1px_0_0_rgba(16,185,129,0.1)]">
                  <div className="text-[11px] text-gray-400 font-medium">Earned This Month</div>
                  <div className="text-base font-republic-mono font-bold text-emerald-400 mt-1">
                    +{currencySymbol}{accruedInterest.toFixed(3)}
                  </div>
                </div>

                <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.10] p-3.5 rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                  <div className="text-[11px] text-gray-400 font-medium">Monthly Estimate</div>
                  <div className="text-base font-republic-mono font-bold text-white mt-1">
                    ~{currencySymbol}{monthlyYield.toFixed(2)} / mo
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-white/[0.08]">
                <span>Next Interest Payout:</span>
                <span className="font-republic-mono text-white font-semibold">1st of Next Month</span>
              </div>
            </div>
          )}

          {/* Tab 3: Automated Crypto Savings Plans (Sparpläne) with High Translucent Intensity */}
          {activeSection === 'savings_plans' && (
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.10] rounded-2xl p-5 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-republic-display font-black text-white">
                    Automated DCA Sparpläne
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Automate your crypto investing with €0 order fees.
                  </p>
                </div>
                <button
                  onClick={() => {
                    playSound('click');
                    setTradeAction('savings_plan');
                    setIsTradeModalOpen(true);
                  }}
                  className="flex items-center space-x-1.5 bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-full text-xs font-bold font-republic-display transition-all shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Plan</span>
                </button>
              </div>

              <div className="space-y-2">
                {savingsPlans.map(plan => (
                  <div 
                    key={plan.id}
                    className="bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.10] hover:border-emerald-500/30 p-3 rounded-xl flex items-center justify-between transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.10] flex items-center justify-center font-bold text-xs text-white font-republic-display">
                        {plan.asset}
                      </div>
                      <div>
                        <div className="font-republic-display font-bold text-white text-xs flex items-center space-x-1.5">
                          <span>{plan.asset} Sparplan</span>
                          <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.2 rounded uppercase">
                            {plan.frequency}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5 font-republic-mono">
                          {currencySymbol}{plan.amount} • {plan.nextExecution}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-republic-mono font-bold text-white">
                        {currencySymbol}{plan.totalInvested} invested
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                        ● Zero Fees
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* 3. PTIT Exchange Modal / Sheet for Buy, Sell, and Savings Plans */}
      {isTradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-republic">
          <div className="bg-[#12161f]/90 backdrop-blur-2xl border border-white/[0.12] rounded-3xl max-w-md w-full p-6 relative shadow-[0_25px_60px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-150">
            {/* Close button */}
            <button
              onClick={() => setIsTradeModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-white rounded-full bg-[#181d28] hover:bg-[#222a3a] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold font-republic-display">
                {currentPair.baseAsset.substring(0, 3)}
              </div>
              <div>
                <h3 className="font-republic-display font-extrabold text-lg text-white tracking-tight leading-none">
                  {tradeAction === 'savings_plan' 
                    ? `Create ${currentPair.baseAsset} Sparplan` 
                    : `${tradeAction.toUpperCase()} ${currentPair.baseAsset}`}
                </h3>
                <p className="text-xs text-gray-400 mt-1">PTIT Exchange Instant Execution</p>
              </div>
            </div>

            {savingsPlanSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-white">Savings Plan Active!</h4>
                <p className="text-xs text-gray-400">
                  {currencySymbol}{tradeAmountCurrency} will be automatically invested {savingsFrequency} into {currentPair.baseAsset} with €0 order fees.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mode selector (Market vs Limit) for buy/sell */}
                {tradeAction !== 'savings_plan' && (
                  <div className="flex bg-[#161c28]/60 backdrop-blur-md p-1 rounded-xl border border-white/[0.08]">
                    <button
                      onClick={() => setOrderType('market')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        orderType === 'market' ? 'bg-white text-black shadow-xs' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Market Order
                    </button>
                    <button
                      onClick={() => setOrderType('limit')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        orderType === 'limit' ? 'bg-white text-black shadow-xs' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Limit Order
                    </button>
                  </div>
                )}

                {/* Savings Plan Frequency options */}
                {tradeAction === 'savings_plan' && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Execution Frequency</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['weekly', 'biweekly', 'monthly'] as const).map(freq => (
                        <button
                          key={freq}
                          onClick={() => setSavingsFrequency(freq)}
                          className={`py-2 rounded-xl text-xs font-bold uppercase transition-colors border ${
                            savingsFrequency === freq
                              ? 'bg-white text-black border-white'
                              : 'bg-[#161c28]/60 text-gray-400 border-white/[0.08]'
                          }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Limit price input if limit order */}
                {tradeAction !== 'savings_plan' && orderType === 'limit' && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Limit Price (USD)</label>
                    <input
                      type="number"
                      value={limitPriceInput}
                      onChange={(e) => setLimitPriceInput(e.target.value)}
                      className="w-full bg-[#161c28]/60 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                )}

                {/* Amount input */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs text-gray-400">
                      {tradeAction === 'savings_plan' ? 'Investment per Interval' : 'Amount to Invest'}
                    </label>
                    <span className="text-[11px] text-gray-400">
                      Cash: {currencySymbol}{cashInSelectedCurrency.toFixed(2)}
                    </span>
                  </div>

                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-gray-400 font-bold">{currencySymbol}</span>
                    <input
                      type="number"
                      value={tradeAmountCurrency}
                      onChange={(e) => setTradeAmountCurrency(e.target.value)}
                      className="w-full bg-[#161c28]/60 border border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-white"
                      placeholder="50"
                      autoFocus
                    />
                  </div>

                  {/* Preset chips */}
                  <div className="flex items-center space-x-2 mt-2">
                    {amountPresets.map(val => (
                      <button
                        key={val}
                        onClick={() => setTradeAmountCurrency(val.toString())}
                        className="flex-1 py-1.5 bg-[#161c28]/60 hover:bg-[#202838] text-gray-300 rounded-lg text-xs font-semibold transition-colors border border-white/[0.08]"
                      >
                        {currencySymbol}{val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fees and Transparency Breakdown */}
                <div className="bg-[#161c28]/60 p-3.5 rounded-xl border border-white/[0.08] space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Third-party settlement fee:</span>
                    <span className={tradeAction === 'savings_plan' ? 'text-emerald-400 font-bold' : 'text-white'}>
                      {tradeAction === 'savings_plan' ? '€0.00 (Zero Fee)' : `${currencySymbol}1.00`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protection / Custody:</span>
                    <span className="text-white">German BaFin Standard</span>
                  </div>
                  <div className="flex justify-between border-t border-white/[0.08] pt-1.5 font-bold text-white">
                    <span>Total Debit:</span>
                    <span className="font-mono">
                      {currencySymbol}
                      {(
                        parseFloat(tradeAmountCurrency || '0') + 
                        (tradeAction === 'savings_plan' ? 0 : 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Execution Button */}
                <button
                  id="tr-modal-execute-btn"
                  onClick={handleConfirmOrder}
                  className="w-full py-3.5 bg-white hover:bg-gray-200 text-black font-extrabold rounded-2xl text-sm transition-all shadow-xl active:scale-95 mt-2 font-republic-display"
                >
                  {tradeAction === 'savings_plan' 
                    ? `Set Up ${currentPair.baseAsset} Sparplan` 
                    : `Confirm ${tradeAction.toUpperCase()}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
