import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Star, 
  Filter, 
  SlidersHorizontal, 
  ChevronRight, 
  ArrowUpDown, 
  Headphones, 
  X, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  Info
} from 'lucide-react';
import { TradingPair } from '../types';
import { playSound } from '../utils/sound';

interface MarketViewProps {
  allPairs: TradingPair[];
  currentPair: TradingPair;
  onSelectPair: (pair: TradingPair) => void;
  onSwitchToTrade: () => void;
  onOpenDeposit?: () => void;
}

type SortKey = 'name' | 'price' | 'change24h' | 'marketCap';
type SortOrder = 'asc' | 'desc';

type MainCategory = 'Favorites' | 'Crypto' | 'Spot' | 'Futures' | 'Stocks' | 'ETFs' | 'Commodities' | 'Events & Options' | 'DEX';
type SubFilter = 'All' | 'Hot' | 'Top' | 'New' | 'Stocks' | 'ETFs' | 'Commodities' | 'Meme' | 'DeFi' | 'AI' | 'Layer 1&2' | 'Top gainers' | 'Top losers';

// Token Icon renderer with authentic colors and symbols
const TokenIcon: React.FC<{ symbol: string; size?: string }> = ({ symbol, size = 'w-7 h-7' }) => {
  const base = symbol.split('/')[0].toUpperCase();

  switch (base) {
    case 'BTC':
      return (
        <div className={`${size} rounded-full bg-[#F7931A] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs`}>
          ₿
        </div>
      );
    case 'ETH':
      return (
        <div className={`${size} rounded-full bg-[#627EEA] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 784.37 1277.39" fill="currentColor">
            <path d="M392.07 0L383.5 29.11V874.63L392.07 883.22L784.13 651.54L392.07 0Z" fill="#fff" fillOpacity="0.6"/>
            <path d="M392.07 0L0 651.54L392.07 883.22V472.33V0Z" fill="#fff"/>
            <path d="M392.07 956.52L387.24 962.41V1268.28L392.07 1277.38L784.37 724.89L392.07 956.52Z" fill="#fff" fillOpacity="0.6"/>
            <path d="M392.07 1277.38V956.52L0 724.89L392.07 1277.38Z" fill="#fff"/>
          </svg>
        </div>
      );
    case 'USDT':
      return (
        <div className={`${size} rounded-full bg-[#26A17B] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs`}>
          ₮
        </div>
      );
    case 'BNB':
      return (
        <div className={`${size} rounded-full bg-[#F3BA2F] text-black flex items-center justify-center font-extrabold text-[10px] shrink-0 shadow-xs`}>
          BNB
        </div>
      );
    case 'XRP':
      return (
        <div className={`${size} rounded-full bg-[#1e2329] border border-white/20 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
          ✕
        </div>
      );
    case 'SOL':
      return (
        <div className={`${size} rounded-full bg-gradient-to-tr from-[#9945FF] to-[#14F195] text-white flex items-center justify-center font-extrabold text-[10px] shrink-0 shadow-xs`}>
          S
        </div>
      );
    case 'ZEC':
      return (
        <div className={`${size} rounded-full bg-[#F4B240] text-black flex items-center justify-center font-black text-xs shrink-0 shadow-xs`}>
          Z
        </div>
      );
    case 'DOGE':
      return (
        <div className={`${size} rounded-full bg-[#C2A633] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs`}>
          Ð
        </div>
      );
    case 'SUI':
      return (
        <div className={`${size} rounded-full bg-[#4CA2FF] text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs`}>
          💧
        </div>
      );
    case 'NEAR':
      return (
        <div className={`${size} rounded-full bg-black border border-white/30 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs`}>
          N
        </div>
      );
    case 'RENDER':
      return (
        <div className={`${size} rounded-full bg-[#E51B24] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs`}>
          R
        </div>
      );
    case 'UNI':
      return (
        <div className={`${size} rounded-full bg-[#FF007A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
          🦄
        </div>
      );
    case 'PEPE':
      return (
        <div className={`${size} rounded-full bg-[#499944] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
          🐸
        </div>
      );
    case 'XINTW':
      return (
        <div className={`${size} rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0`}>
          IW
        </div>
      );
    case 'XMVLL':
      return (
        <div className={`${size} rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0`}>
          MV
        </div>
      );
    case 'XSOXS':
      return (
        <div className={`${size} rounded-full bg-[#0284c7] text-white flex items-center justify-center font-bold text-[9px] shrink-0`}>
          3X
        </div>
      );
    case 'NVDA':
      return (
        <div className={`${size} rounded-full bg-[#76B900] text-black flex items-center justify-center font-bold text-[10px] shrink-0`}>
          NV
        </div>
      );
    case 'TSLA':
      return (
        <div className={`${size} rounded-full bg-[#E82127] text-white flex items-center justify-center font-bold text-[10px] shrink-0`}>
          T
        </div>
      );
    case 'PAXG':
      return (
        <div className={`${size} rounded-full bg-[#E5B649] text-black flex items-center justify-center font-bold text-[10px] shrink-0`}>
          AU
        </div>
      );
    default:
      return (
        <div className={`${size} rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0`}>
          {base.slice(0, 2)}
        </div>
      );
  }
};

export const MarketView: React.FC<MarketViewProps> = ({
  allPairs,
  currentPair,
  onSelectPair,
  onSwitchToTrade,
  onOpenDeposit
}) => {
  // 1. Top Sub-Navigation State
  const [topTab, setTopTab] = useState<'Markets' | 'Rankings' | 'Trading data'>('Markets');

  // 2. Card Hot & New listings toggle (Spot vs Futures)
  const [hotToggle, setHotToggle] = useState<'Spot' | 'Futures'>('Spot');
  const [newToggle, setNewToggle] = useState<'Spot' | 'Futures'>('Spot');

  // 3. Category & Sub-Filter state
  const [activeCategory, setActiveCategory] = useState<MainCategory>('Crypto');
  const [activeSubFilter, setActiveSubFilter] = useState<SubFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 4. Sorting
  const [sortKey, setSortKey] = useState<SortKey>('marketCap');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // 5. Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tr_market_favs');
      return saved ? JSON.parse(saved) : ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'];
    } catch {
      return ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'];
    }
  });

  // 6. Quick Details Drawer Modal
  const [detailsPair, setDetailsPair] = useState<TradingPair | null>(null);

  // 7. Support / Help Modal
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // Toggle favorite
  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    setFavorites(prev => {
      const next = prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol];
      try {
        localStorage.setItem('tr_market_favs', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Sorting handler
  const handleSort = (key: SortKey) => {
    playSound('click');
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  // Filter pairs
  const filteredPairs = useMemo(() => {
    return allPairs.filter(pair => {
      // Search matching
      const query = searchQuery.trim().toLowerCase();
      const name = (pair.name || '').toLowerCase();
      const symbol = pair.symbol.toLowerCase();
      const base = pair.baseAsset.toLowerCase();
      if (query && !symbol.includes(query) && !name.includes(query) && !base.includes(query)) {
        return false;
      }

      // Main Category filtering
      if (activeCategory === 'Favorites') {
        if (!favorites.includes(pair.symbol)) return false;
      } else if (activeCategory === 'Stocks') {
        if (pair.category !== 'Stocks') return false;
      } else if (activeCategory === 'ETFs') {
        if (pair.category !== 'ETFs') return false;
      } else if (activeCategory === 'Commodities') {
        if (pair.category !== 'Commodities') return false;
      } else if (activeCategory === 'Crypto') {
        // Exclude stocks/ETFs/commodities
        if (pair.category === 'Stocks' || pair.category === 'ETFs' || pair.category === 'Commodities') return false;
      }

      // Sub-Filter filtering
      if (activeSubFilter === 'All') return true;
      if (activeSubFilter === 'Hot') {
        return ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'DOGE/USDT'].includes(pair.symbol);
      }
      if (activeSubFilter === 'Top') {
        return (pair.marketCap || 0) > 20_000_000_000;
      }
      if (activeSubFilter === 'New') {
        return pair.symbol.startsWith('x') || ['SUI/USDT', 'RENDER/USDT'].includes(pair.symbol);
      }
      if (activeSubFilter === 'Stocks') return pair.category === 'Stocks';
      if (activeSubFilter === 'ETFs') return pair.category === 'ETFs';
      if (activeSubFilter === 'Commodities') return pair.category === 'Commodities';
      if (activeSubFilter === 'Meme') return pair.category === 'Meme';
      if (activeSubFilter === 'DeFi') return pair.category === 'DeFi';
      if (activeSubFilter === 'AI') return pair.category === 'AI';
      if (activeSubFilter === 'Layer 1&2') return pair.category === 'Layer 1' || pair.category === 'Layer 2';
      if (activeSubFilter === 'Top gainers') return pair.change24h > 2.0;
      if (activeSubFilter === 'Top losers') return pair.change24h < 0;

      return true;
    });
  }, [allPairs, activeCategory, activeSubFilter, searchQuery, favorites]);

  // Sort pairs
  const sortedPairs = useMemo(() => {
    return [...filteredPairs].sort((a, b) => {
      let diff = 0;
      switch (sortKey) {
        case 'name':
          diff = a.symbol.localeCompare(b.symbol);
          break;
        case 'price':
          diff = a.currentPrice - b.currentPrice;
          break;
        case 'change24h':
          diff = a.change24h - b.change24h;
          break;
        case 'marketCap':
          diff = (a.marketCap || 0) - (b.marketCap || 0);
          break;
        default:
          diff = 0;
      }
      return sortOrder === 'asc' ? diff : -diff;
    });
  }, [filteredPairs, sortKey, sortOrder]);

  // Format currency helpers
  const formatPrice = (price: number, precision: number) => {
    if (price < 0.001) return `$${price.toFixed(8)}`;
    if (price < 1) return `$${price.toFixed(precision || 4)}`;
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: precision || 2 })}`;
  };

  const formatMarketCap = (cap?: number) => {
    if (!cap) return '$0.00';
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  // Sparkline generator with gentle realistic curves
  const renderSparkline = (change: number, symbol: string) => {
    const isUp = change >= 0;
    const stroke = isUp ? '#10b981' : '#f43f5e';
    
    // Deterministic wavy points based on symbol and change direction
    let d = '';
    if (isUp) {
      if (change > 5) {
        d = 'M0,24 Q18,26 30,18 T55,14 T75,8 T100,2';
      } else {
        d = 'M0,20 Q15,22 30,16 T55,18 T75,12 T100,6';
      }
    } else {
      if (change < -2) {
        d = 'M0,4 Q18,6 30,14 T55,20 T75,22 T100,28';
      } else {
        d = 'M0,8 Q20,12 35,10 T60,20 T80,18 T100,24';
      }
    }

    return (
      <svg className="w-24 h-7" viewBox="0 0 100 30" fill="none">
        <path
          d={d}
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Calculate 24h range slider marker position (0% - 100%)
  const calculateRangePercent = (price: number, low: number, high: number) => {
    if (high <= low) return 50;
    const pct = ((price - low) / (high - low)) * 100;
    return Math.max(3, Math.min(97, pct));
  };

  // Hot crypto items
  const hotCryptoItems = useMemo(() => {
    return allPairs.filter(p => ['BTC/USDT', 'ETH/USDT', 'ZEC/USDT'].includes(p.symbol));
  }, [allPairs]);

  // New listings items
  const newListingItems = useMemo(() => {
    return allPairs.filter(p => ['xINTW/USDT', 'xMVLL/USDT', 'xSOXS/USDT'].includes(p.symbol));
  }, [allPairs]);

  // Handler to trade a pair directly in Pro Terminal
  const handleTradePair = (pair: TradingPair) => {
    playSound('order_placed');
    onSelectPair(pair);
    onSwitchToTrade();
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#05070a] text-white p-4 sm:p-6 lg:p-8 font-republic select-none relative pb-16">
      <div className="max-w-[1460px] mx-auto space-y-6">

        {/* 1. Top Sub-Navigation: Markets | Rankings | Trading data */}
        <div className="flex items-center space-x-8 border-b border-white/[0.08] pb-1">
          {(['Markets', 'Rankings', 'Trading data'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                playSound('click');
                setTopTab(tab);
              }}
              className={`pb-3 text-base sm:text-lg font-bold transition-all relative cursor-pointer ${
                topTab === tab ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab}
              {topTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* 2. Top 4 Highlight Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Hot crypto */}
          <div className="bg-[#0b0e14] border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-3">
              <button 
                onClick={() => setActiveSubFilter('Hot')}
                className="flex items-center space-x-1.5 font-bold text-sm text-white hover:text-emerald-400 transition-colors cursor-pointer group"
              >
                <span>Hot crypto</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <div className="flex items-center bg-[#151922] p-0.5 rounded-lg border border-white/[0.06] text-[11px]">
                <button
                  onClick={() => setHotToggle('Spot')}
                  className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-colors ${
                    hotToggle === 'Spot' ? 'bg-[#242936] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Spot
                </button>
                <button
                  onClick={() => setHotToggle('Futures')}
                  className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-colors ${
                    hotToggle === 'Futures' ? 'bg-[#242936] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Futures
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {hotCryptoItems.map(p => (
                <div
                  key={p.symbol}
                  onClick={() => handleTradePair(p)}
                  className="flex items-center justify-between cursor-pointer group hover:bg-white/[0.03] p-1 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <TokenIcon symbol={p.symbol} size="w-6 h-6" />
                    <span className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-400 transition-colors">
                      {p.symbol}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-republic-mono text-xs sm:text-sm font-semibold text-white mr-2">
                      {p.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`font-republic-mono text-xs font-bold ${p.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {p.change24h >= 0 ? '+' : ''}{p.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: New listings */}
          <div className="bg-[#0b0e14] border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-3">
              <button 
                onClick={() => setActiveSubFilter('New')}
                className="flex items-center space-x-1.5 font-bold text-sm text-white hover:text-emerald-400 transition-colors cursor-pointer group"
              >
                <span>New listings</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <div className="flex items-center bg-[#151922] p-0.5 rounded-lg border border-white/[0.06] text-[11px]">
                <button
                  onClick={() => setNewToggle('Spot')}
                  className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-colors ${
                    newToggle === 'Spot' ? 'bg-[#242936] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Spot
                </button>
                <button
                  onClick={() => setNewToggle('Futures')}
                  className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-colors ${
                    newToggle === 'Futures' ? 'bg-[#242936] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Futures
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {newListingItems.map(p => (
                <div
                  key={p.symbol}
                  onClick={() => handleTradePair(p)}
                  className="flex items-center justify-between cursor-pointer group hover:bg-white/[0.03] p-1 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <TokenIcon symbol={p.symbol} size="w-6 h-6" />
                    <span className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-400 transition-colors">
                      {p.symbol}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-republic-mono text-xs sm:text-sm font-semibold text-white mr-2">
                      {p.currentPrice.toFixed(2)}
                    </span>
                    <span className={`font-republic-mono text-xs font-bold ${p.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {p.change24h >= 0 ? '+' : ''}{p.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Macro data */}
          <div className="bg-[#0b0e14] border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5 font-bold text-sm text-white">
                <span>Macro data</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-[11px] text-gray-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  <span>Market cap</span>
                </div>
                <div className="font-republic-mono font-bold text-white text-xs mt-0.5">
                  $2.70T <span className="text-[10px] text-emerald-400">+0.77%</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-gray-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"></span>
                  <span>Volume</span>
                </div>
                <div className="font-republic-mono font-bold text-white text-xs mt-0.5">
                  $88.60B
                </div>
                <div className="text-[10px] font-republic-mono text-rose-400">
                  -16.11%
                </div>
              </div>

              <div>
                <div className="text-[11px] text-gray-400">BTC dominance</div>
                <div className="font-republic-mono font-bold text-white text-xs mt-0.5">
                  58.3%
                </div>
              </div>
            </div>

            {/* Micro Live Line & Volume Chart */}
            <div className="mt-3 relative h-12 w-full flex items-end">
              {/* Underlying volume bars */}
              <div className="absolute inset-0 flex items-end justify-between px-1 pointer-events-none opacity-40">
                {[12, 18, 14, 22, 26, 20, 24, 28, 32, 22, 18, 25, 30, 36, 42, 38, 28, 30, 24, 32].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-[3px] bg-white/25 rounded-t-xs"
                  />
                ))}
              </div>
              {/* Green trend line */}
              <svg className="w-full h-full relative z-10" viewBox="0 0 200 60" preserveAspectRatio="none" fill="none">
                <path
                  d="M0,45 Q25,38 50,42 T100,32 T130,36 T160,48 T180,18 T200,12"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 4: BTC ETF flows */}
          <div className="bg-[#0b0e14] border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5 font-bold text-sm text-white">
                <span>BTC ETF flows</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <div className="text-[11px] text-gray-400">Daily net</div>
                <div className="font-republic-mono font-bold text-emerald-400 text-xs sm:text-sm mt-0.5">
                  +$57.20M
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-gray-400">Last 30D</div>
                <div className="font-republic-mono font-bold text-emerald-400 text-xs sm:text-sm mt-0.5">
                  +$361.30M
                </div>
              </div>
            </div>

            {/* Inflow / Outflow Histogram chart matching screenshot */}
            <div className="mt-3 h-12 w-full flex items-end justify-between px-2">
              {[
                { h: 30, type: 'out' },
                { h: 45, type: 'out' },
                { h: 15, type: 'in' },
                { h: 25, type: 'in' },
                { h: 40, type: 'in' },
                { h: 70, type: 'in' },
                { h: 90, type: 'in' },
                { h: 65, type: 'in' },
                { h: 50, type: 'in' },
                { h: 35, type: 'in' },
                { h: 40, type: 'in' },
                { h: 30, type: 'in' },
                { h: 45, type: 'in' },
                { h: 20, type: 'in' },
                { h: 60, type: 'in' },
              ].map((bar, idx) => (
                <div
                  key={idx}
                  style={{ height: `${bar.h}%` }}
                  className={`w-[4px] rounded-t-xs ${
                    bar.type === 'in' ? 'bg-[#22c55e]' : 'bg-[#f43f5e]'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>

        {/* 3. Category Navigation Tabs & Search */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pt-2">
          <div className="flex items-center space-x-6 sm:space-x-8 overflow-x-auto no-scrollbar">
            {(
              [
                'Favorites',
                'Crypto',
                'Spot',
                'Futures',
                'Stocks',
                'ETFs',
                'Commodities',
                'Events & Options',
                'DEX'
              ] as MainCategory[]
            ).map(cat => (
              <button
                key={cat}
                onClick={() => {
                  playSound('click');
                  setActiveCategory(cat);
                }}
                className={`pb-3 text-sm font-semibold whitespace-nowrap transition-all relative cursor-pointer ${
                  activeCategory === cat ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {cat}
                {activeCategory === cat && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Search Trigger / Bar */}
          <div className="flex items-center space-x-2 pl-4 shrink-0 pb-3">
            {isSearchOpen ? (
              <div className="flex items-center bg-[#151922] border border-white/20 rounded-lg px-2.5 py-1 text-xs">
                <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search market..."
                  autoFocus
                  className="bg-transparent border-none text-white focus:outline-hidden w-32 sm:w-44 text-xs font-republic"
                />
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="text-gray-400 hover:text-white ml-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Search markets"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 4. Sub-Filter Pills & Filters Button */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            {(
              [
                'All',
                'Hot',
                'Top',
                'New',
                'Stocks',
                'ETFs',
                'Commodities',
                'Meme',
                'DeFi',
                'AI',
                'Layer 1&2',
                'Top gainers',
                'Top losers'
              ] as SubFilter[]
            ).map(sub => (
              <button
                key={sub}
                onClick={() => {
                  playSound('click');
                  setActiveSubFilter(sub);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeSubFilter === sub
                    ? 'bg-white text-black font-bold shadow-xs'
                    : 'bg-[#121620] text-gray-400 hover:text-white hover:bg-[#1a202c]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              playSound('click');
              setActiveSubFilter(prev => prev === 'Top gainers' ? 'All' : 'Top gainers');
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#121620] text-gray-300 hover:text-white border border-white/[0.08] hover:border-white/20 text-xs font-semibold cursor-pointer shrink-0 transition-all"
          >
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Filters</span>
          </button>
        </div>

        {/* 5. Main Asset Table Board (Shortened to fit ~8 coins with internal scroll) */}
        <div className="w-full bg-[#080c13]/60 border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <div className="w-full max-h-[540px] overflow-y-auto overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="sticky top-0 z-20 bg-[#080c13] backdrop-blur-md border-b border-white/[0.08]">
                <tr className="text-gray-400 text-xs font-normal">
                {/* Name */}
                <th 
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 font-normal cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-500" />
                  </div>
                </th>

                {/* Price */}
                <th 
                  onClick={() => handleSort('price')}
                  className="py-3 px-4 font-normal cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Price</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-500" />
                  </div>
                </th>

                {/* 24h change */}
                <th 
                  onClick={() => handleSort('change24h')}
                  className="py-3 px-4 font-normal cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>24h change</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-500" />
                  </div>
                </th>

                {/* Last 24h */}
                <th className="py-3 px-4 font-normal">
                  <span className="border-b border-dashed border-gray-600 pb-0.5">Last 24h</span>
                </th>

                {/* 24h range */}
                <th className="py-3 px-4 font-normal w-56">
                  <span className="border-b border-dashed border-gray-600 pb-0.5">24h range</span>
                </th>

                {/* Market cap */}
                <th 
                  onClick={() => handleSort('marketCap')}
                  className="py-3 px-4 font-normal cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Market cap</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-500" />
                  </div>
                </th>

                {/* Action */}
                <th className="py-3 px-4 font-normal text-right">
                  <span>Action</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04] text-xs">
              {sortedPairs.map(pair => {
                const isFav = favorites.includes(pair.symbol);
                const rangePct = calculateRangePercent(pair.currentPrice, pair.low24h, pair.high24h);

                return (
                  <tr
                    key={pair.symbol}
                    className="hover:bg-white/[0.025] transition-colors group cursor-pointer"
                    onClick={() => handleTradePair(pair)}
                  >
                    {/* Name column: Star, Token Icon, Symbol, Name */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={e => toggleFavorite(pair.symbol, e)}
                          className="text-gray-500 hover:text-amber-400 cursor-pointer transition-colors p-0.5"
                          title={isFav ? 'Remove favorite' : 'Add favorite'}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-gray-500'}`} />
                        </button>

                        <TokenIcon symbol={pair.symbol} size="w-7 h-7" />

                        <div className="flex flex-col">
                          <span className="font-extrabold text-xs sm:text-sm text-white group-hover:text-emerald-400 transition-colors">
                            {pair.baseAsset}
                          </span>
                          <span className="text-[11px] text-gray-400 font-normal">
                            {pair.name || pair.baseAsset}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 font-republic-mono font-bold text-xs sm:text-sm text-white">
                      {formatPrice(pair.currentPrice, pair.precision)}
                    </td>

                    {/* 24h change */}
                    <td className="py-4 px-4 font-republic-mono font-bold text-xs sm:text-sm">
                      <span className={pair.change24h > 0 ? 'text-emerald-400' : pair.change24h < 0 ? 'text-rose-400' : 'text-gray-300'}>
                        {pair.change24h > 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                      </span>
                    </td>

                    {/* Last 24h sparkline */}
                    <td className="py-4 px-4">
                      {renderSparkline(pair.change24h, pair.symbol)}
                    </td>

                    {/* 24h range with indicator pointer ▼ */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col space-y-1.5 w-48">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-republic-mono">
                          <span>${pair.low24h.toLocaleString()}</span>
                          <span>${pair.high24h.toLocaleString()}</span>
                        </div>

                        {/* Slider bar with marker */}
                        <div className="relative w-full h-[2px] bg-white/20 rounded-full">
                          <div
                            className="absolute top-0 transform -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${rangePct}%` }}
                          >
                            <span className="text-[8px] text-white select-none block leading-none">▼</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Market cap */}
                    <td className="py-4 px-4 font-republic-mono font-semibold text-xs text-white">
                      {formatMarketCap(pair.marketCap)}
                    </td>

                    {/* Action: Details | Trade */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2 text-xs font-semibold">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            playSound('click');
                            setDetailsPair(pair);
                          }}
                          className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        <span className="text-gray-600">|</span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleTradePair(pair);
                          }}
                          className="text-white hover:text-emerald-400 transition-colors cursor-pointer font-bold"
                        >
                          Trade
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      </div>

      {/* Floating Support Button in Bottom Right corner */}
      <button
        id="market-support-btn"
        onClick={() => {
          playSound('click');
          setIsSupportOpen(true);
        }}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-black flex items-center justify-center shadow-[0_8px_24px_rgba(34,197,94,0.4)] transition-transform hover:scale-105 active:scale-95 cursor-pointer z-40"
        title="24/7 VIP Support & Help"
      >
        <Headphones className="w-5 h-5 text-black" />
      </button>

      {/* 6. Quick Details Drawer Modal */}
      {detailsPair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#0b0e14] border border-white/[0.12] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-3">
                <TokenIcon symbol={detailsPair.symbol} size="w-9 h-9" />
                <div>
                  <h3 className="text-lg font-bold text-white">{detailsPair.name || detailsPair.baseAsset}</h3>
                  <div className="text-xs text-gray-400 font-republic-mono">{detailsPair.symbol} • {detailsPair.category}</div>
                </div>
              </div>
              <button
                onClick={() => setDetailsPair(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                <span className="text-gray-400">Current Price</span>
                <div className="font-republic-mono font-bold text-base text-white mt-0.5">
                  {formatPrice(detailsPair.currentPrice, detailsPair.precision)}
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                <span className="text-gray-400">24h Change</span>
                <div className={`font-republic-mono font-bold text-base mt-0.5 ${detailsPair.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {detailsPair.change24h >= 0 ? '+' : ''}{detailsPair.change24h.toFixed(2)}%
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                <span className="text-gray-400">24h High</span>
                <div className="font-republic-mono font-bold text-sm text-white mt-0.5">
                  {formatPrice(detailsPair.high24h, detailsPair.precision)}
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                <span className="text-gray-400">24h Low</span>
                <div className="font-republic-mono font-bold text-sm text-white mt-0.5">
                  {formatPrice(detailsPair.low24h, detailsPair.precision)}
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                <span className="text-gray-400">Market Capitalization</span>
                <div className="font-republic-mono font-bold text-sm text-white mt-0.5">
                  {formatMarketCap(detailsPair.marketCap)}
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                <span className="text-gray-400">Max Leverage</span>
                <div className="font-republic-mono font-bold text-sm text-amber-400 mt-0.5">
                  {detailsPair.maxLeverage}x Cross / Iso
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={() => setDetailsPair(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/[0.05] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setDetailsPair(null);
                  handleTradePair(detailsPair);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-white text-black hover:bg-gray-200 transition-colors shadow-sm cursor-pointer"
              >
                Trade {detailsPair.baseAsset} Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Support Modal */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#0b0e14] border border-white/[0.12] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center">
                  <Headphones className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-white">Trade Republic Support</h3>
              </div>
              <button
                onClick={() => setIsSupportOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed">
              Welcome to Trade Republic Instant Help. Institutional order books, zero-slippage matching, and 24/7 dedicated support are active.
            </p>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-400">
                <span>Support Status:</span>
                <span className="text-emerald-400 font-bold">Online (0s wait)</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Matching Engine:</span>
                <span className="text-white font-republic-mono">Ultra-low latency</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tier:</span>
                <span className="text-amber-400 font-bold">VIP Institutional</span>
              </div>
            </div>

            <button
              onClick={() => setIsSupportOpen(false)}
              className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
