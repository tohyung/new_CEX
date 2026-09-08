import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Star, 
  ArrowUpRight, 
  Filter, 
  SlidersHorizontal, 
  Sparkles, 
  Flame, 
  Layers, 
  BarChart2, 
  Zap, 
  Activity, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw
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

type SortKey = 'rank' | 'symbol' | 'price' | 'change24h' | 'volume24h' | 'high24h';
type SortOrder = 'asc' | 'desc';
type MarketCategory = 'All' | 'Spot' | 'Layer 1' | 'DeFi' | 'AI' | 'Meme' | 'Favorites' | 'Gainers' | 'Losers';

export const MarketView: React.FC<MarketViewProps> = ({
  allPairs,
  currentPair,
  onSelectPair,
  onSwitchToTrade,
  onOpenDeposit
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('volume24h');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tr_market_favorites');
      return saved ? JSON.parse(saved) : ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'];
    } catch {
      return ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'];
    }
  });

  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    setFavorites(prev => {
      const updated = prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol];
      try {
        localStorage.setItem('tr_market_favorites', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSort = (key: SortKey) => {
    playSound('click');
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  // Filter pairs based on category and search
  const filteredPairs = useMemo(() => {
    return allPairs.filter(pair => {
      const matchesSearch = pair.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            pair.baseAsset.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedCategory === 'All' || selectedCategory === 'Spot') return true;
      if (selectedCategory === 'Favorites') return favorites.includes(pair.symbol);
      if (selectedCategory === 'Gainers') return pair.change24h > 0;
      if (selectedCategory === 'Losers') return pair.change24h < 0;
      return pair.category === selectedCategory;
    });
  }, [allPairs, searchQuery, selectedCategory, favorites]);

  // Sort pairs
  const sortedPairs = useMemo(() => {
    return [...filteredPairs].sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'price':
          comparison = a.currentPrice - b.currentPrice;
          break;
        case 'change24h':
          comparison = a.change24h - b.change24h;
          break;
        case 'volume24h':
          comparison = a.quoteVolume24h - b.quoteVolume24h;
          break;
        case 'high24h':
          comparison = a.high24h - b.high24h;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredPairs, sortKey, sortOrder]);

  // Highlight Cards data
  const topGainers = useMemo(() => {
    return [...allPairs].sort((a, b) => b.change24h - a.change24h).slice(0, 3);
  }, [allPairs]);

  const topVolume = useMemo(() => {
    return [...allPairs].sort((a, b) => b.quoteVolume24h - a.quoteVolume24h).slice(0, 3);
  }, [allPairs]);

  const hotTrending = useMemo(() => {
    const symbols = ['BTC/USDT', 'SOL/USDT', 'PEPE/USDT'];
    return allPairs.filter(p => symbols.includes(p.symbol));
  }, [allPairs]);

  // Sector breakdown stats
  const sectorAverages = useMemo(() => {
    const categories: Record<string, { total: number; count: number }> = {};
    allPairs.forEach(p => {
      if (!categories[p.category]) categories[p.category] = { total: 0, count: 0 };
      categories[p.category].total += p.change24h;
      categories[p.category].count += 1;
    });
    return Object.entries(categories).map(([category, { total, count }]) => ({
      category,
      avgChange: count > 0 ? (total / count).toFixed(2) : '0.00'
    }));
  }, [allPairs]);

  // Format currency helpers
  const formatPrice = (price: number, precision: number) => {
    if (price < 0.001) return `$${price.toFixed(8)}`;
    if (price < 1) return `$${price.toFixed(precision || 4)}`;
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: precision || 2 })}`;
  };

  const formatVolume = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(2)}K`;
    return `$${val.toFixed(2)}`;
  };

  // Helper for generating SVG sparklines
  const renderSparkline = (change: number) => {
    const isPositive = change >= 0;
    const strokeColor = isPositive ? '#10b981' : '#f43f5e';
    const points = isPositive 
      ? '0,26 12,24 24,28 36,20 48,16 60,18 72,10 84,6 96,2'
      : '0,4 12,8 24,6 36,14 48,16 60,22 72,20 84,26 96,28';
    
    return (
      <svg className="w-24 h-8" viewBox="0 0 96 32" fill="none">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  const categories: MarketCategory[] = [
    'All',
    'Favorites',
    'Spot',
    'Layer 1',
    'AI',
    'DeFi',
    'Meme',
    'Gainers',
    'Losers'
  ];

  const handleSelectAndTrade = (pair: TradingPair) => {
    playSound('order_placed');
    onSelectPair(pair);
    onSwitchToTrade();
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#07090e] text-white p-4 sm:p-6 lg:p-8 font-republic select-none">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. Global Market Stats Banner */}
        <div className="bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Markets
                </span>
                <span className="text-xs text-gray-400 font-republic-mono flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Institutional Order Flow</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-republic-display font-extrabold tracking-tight mt-2 text-white">
                Cryptocurrency Markets
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
                Real-time liquidity, live order books, 24h performance metrics, and zero-latency execution across spot & perpetual derivatives.
              </p>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3">
                <div className="text-[11px] text-gray-400">Total Market Cap</div>
                <div className="text-sm sm:text-base font-extrabold text-white font-republic-mono mt-0.5">$2.84T</div>
                <div className="text-[10px] text-emerald-400 font-bold flex items-center mt-0.5">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +3.48%
                </div>
              </div>

              <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3">
                <div className="text-[11px] text-gray-400">24h Global Volume</div>
                <div className="text-sm sm:text-base font-extrabold text-white font-republic-mono mt-0.5">$94.20B</div>
                <div className="text-[10px] text-gray-400 font-republic-mono mt-0.5">High Liquidity</div>
              </div>

              <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3">
                <div className="text-[11px] text-gray-400">BTC Dominance</div>
                <div className="text-sm sm:text-base font-extrabold text-white font-republic-mono mt-0.5">54.2%</div>
                <div className="text-[10px] text-amber-400 font-bold mt-0.5">Macro Heavy</div>
              </div>

              <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3">
                <div className="text-[11px] text-gray-400">Fear & Greed</div>
                <div className="text-sm sm:text-base font-extrabold text-emerald-400 font-republic-mono mt-0.5">74 / 100</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-0.5">Greed Index</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Top Spotlight Cards (Hot, Top Gainers, Top Volume) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 1: Hot Trending */}
          <div className="bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="font-republic-display font-bold text-sm text-white">Hot & Trending</h3>
              </div>
              <span className="text-[10px] text-gray-400 font-republic-mono">24H Velocity</span>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {hotTrending.map(pair => (
                <div
                  key={pair.symbol}
                  onClick={() => handleSelectAndTrade(pair)}
                  className="py-2.5 flex items-center justify-between cursor-pointer group hover:bg-white/[0.03] -mx-2 px-2 rounded-xl transition-all"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-linear-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                      {pair.baseAsset.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white group-hover:text-amber-400 transition-colors">
                        {pair.symbol}
                      </div>
                      <div className="text-[10px] text-gray-400">{pair.category}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-republic-mono font-bold text-xs text-white">
                      {formatPrice(pair.currentPrice, pair.precision)}
                    </div>
                    <div className={`text-[10px] font-bold font-republic-mono ${pair.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Top Gainers */}
          <div className="bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="font-republic-display font-bold text-sm text-white">Top 24h Gainers</h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-republic-mono">High ROI</span>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {topGainers.map(pair => (
                <div
                  key={pair.symbol}
                  onClick={() => handleSelectAndTrade(pair)}
                  className="py-2.5 flex items-center justify-between cursor-pointer group hover:bg-white/[0.03] -mx-2 px-2 rounded-xl transition-all"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-linear-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                      {pair.baseAsset.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                        {pair.symbol}
                      </div>
                      <div className="text-[10px] text-gray-400">{pair.category}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-republic-mono font-bold text-xs text-white">
                      {formatPrice(pair.currentPrice, pair.precision)}
                    </div>
                    <div className="text-[10px] font-bold font-republic-mono text-emerald-400">
                      +{pair.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Top Volume */}
          <div className="bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <h3 className="font-republic-display font-bold text-sm text-white">Top 24h Turnover</h3>
              </div>
              <span className="text-[10px] text-gray-400 font-republic-mono">Highest Volume</span>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {topVolume.map(pair => (
                <div
                  key={pair.symbol}
                  onClick={() => handleSelectAndTrade(pair)}
                  className="py-2.5 flex items-center justify-between cursor-pointer group hover:bg-white/[0.03] -mx-2 px-2 rounded-xl transition-all"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                      {pair.baseAsset.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white group-hover:text-indigo-400 transition-colors">
                        {pair.symbol}
                      </div>
                      <div className="text-[10px] text-gray-400">{formatVolume(pair.quoteVolume24h)}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-republic-mono font-bold text-xs text-white">
                      {formatPrice(pair.currentPrice, pair.precision)}
                    </div>
                    <div className={`text-[10px] font-bold font-republic-mono ${pair.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 3. Sector Performance Pills Strip */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-gray-400 font-bold shrink-0">Sectors 24h:</span>
          {sectorAverages.map(s => {
            const isPos = parseFloat(s.avgChange) >= 0;
            return (
              <div 
                key={s.category}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-1 text-xs flex items-center space-x-1.5 shrink-0"
              >
                <span className="text-gray-300 font-medium">{s.category}</span>
                <span className={`font-republic-mono font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? '+' : ''}{s.avgChange}%
                </span>
              </div>
            );
          })}
        </div>

        {/* 4. Controls: Category Tabs, Search, View Mode Toggle */}
        <div className="bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    playSound('click');
                    setSelectedCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white text-black font-extrabold shadow-xs'
                      : 'bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
                  }`}
                >
                  {cat === 'Favorites' && <Star className="w-3 h-3 inline mr-1 fill-amber-400 text-amber-400" />}
                  {cat}
                </button>
              ))}
            </div>

            {/* Right: Search + View Toggle */}
            <div className="flex items-center space-x-3">
              {/* Search Box */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search token or symbol..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-white/20 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* View Toggle (Table / Grid) */}
              <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-0.5">
                <button
                  onClick={() => {
                    playSound('click');
                    setViewMode('table');
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Table View"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    playSound('click');
                    setViewMode('grid');
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* 5. Main Table or Grid Display */}
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-gray-400 text-[11px] font-bold">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th 
                      onClick={() => handleSort('symbol')}
                      className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Trading Pair</span>
                        <ArrowUpDown className="w-3 h-3 text-gray-500" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('price')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Last Price</span>
                        <ArrowUpDown className="w-3 h-3 text-gray-500" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('change24h')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>24h Change</span>
                        <ArrowUpDown className="w-3 h-3 text-gray-500" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('high24h')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors hidden md:table-cell"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>24h High / Low</span>
                        <ArrowUpDown className="w-3 h-3 text-gray-500" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('volume24h')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors hidden sm:table-cell"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>24h Volume (USDT)</span>
                        <ArrowUpDown className="w-3 h-3 text-gray-500" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-center hidden lg:table-cell">7D Trend</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {sortedPairs.map((pair, index) => {
                    const isFav = favorites.includes(pair.symbol);
                    const isPositive = pair.change24h >= 0;
                    const priceRangePercent = pair.high24h > pair.low24h 
                      ? Math.min(Math.max(((pair.currentPrice - pair.low24h) / (pair.high24h - pair.low24h)) * 100, 0), 100)
                      : 50;

                    return (
                      <tr 
                        key={pair.symbol}
                        onClick={() => handleSelectAndTrade(pair)}
                        className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                      >
                        {/* Rank & Favorite Star */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={(e) => toggleFavorite(pair.symbol, e)}
                            className="text-gray-500 hover:text-amber-400 transition-colors p-1"
                          >
                            <Star className={`w-3.5 h-3.5 ${isFav ? 'text-amber-400 fill-amber-400' : ''}`} />
                          </button>
                        </td>

                        {/* Symbol & Name */}
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-white">
                              {pair.baseAsset.slice(0, 3)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-xs text-white group-hover:text-amber-400 transition-colors">
                                  {pair.baseAsset}
                                </span>
                                <span className="text-[10px] text-gray-400 font-republic-mono">
                                  /{pair.quoteAsset}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-500">{pair.category}</span>
                            </div>
                          </div>
                        </td>

                        {/* Last Price */}
                        <td className="py-3 px-3 text-right">
                          <span className="font-republic-mono font-extrabold text-xs text-white">
                            {formatPrice(pair.currentPrice, pair.precision)}
                          </span>
                        </td>

                        {/* 24h Change Pill */}
                        <td className="py-3 px-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold font-republic-mono ${
                            isPositive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                          }`}>
                            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {isPositive ? '+' : ''}{pair.change24h.toFixed(2)}%
                          </span>
                        </td>

                        {/* 24h High / Low with slider */}
                        <td className="py-3 px-3 text-right hidden md:table-cell">
                          <div className="flex flex-col items-end space-y-1">
                            <div className="text-[11px] font-republic-mono text-gray-300">
                              {formatPrice(pair.high24h, pair.precision)}
                            </div>
                            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                              <div 
                                className="h-full bg-linear-to-r from-rose-500 via-amber-400 to-emerald-500" 
                                style={{ width: `${priceRangePercent}%` }} 
                              />
                            </div>
                            <div className="text-[10px] font-republic-mono text-gray-500">
                              Low: {formatPrice(pair.low24h, pair.precision)}
                            </div>
                          </div>
                        </td>

                        {/* 24h Quote Volume */}
                        <td className="py-3 px-3 text-right hidden sm:table-cell">
                          <span className="font-republic-mono text-xs text-gray-300 font-medium">
                            {formatVolume(pair.quoteVolume24h)}
                          </span>
                        </td>

                        {/* 7D Mini Sparkline */}
                        <td className="py-3 px-3 text-center hidden lg:table-cell">
                          <div className="flex justify-center">
                            {renderSparkline(pair.change24h)}
                          </div>
                        </td>

                        {/* Action Button */}
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAndTrade(pair);
                            }}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white text-black font-extrabold text-xs font-republic-display shadow-xs hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
                          >
                            <span>Trade</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {sortedPairs.length === 0 && (
                <div className="py-12 text-center text-gray-400 space-y-2">
                  <p className="text-sm">No pairs found matching &quot;{searchQuery}&quot;</p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="text-xs text-amber-400 underline cursor-pointer"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedPairs.map((pair) => {
                const isFav = favorites.includes(pair.symbol);
                const isPositive = pair.change24h >= 0;

                return (
                  <div
                    key={pair.symbol}
                    onClick={() => handleSelectAndTrade(pair)}
                    className="bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.14] rounded-2xl p-4 transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-black text-xs text-white">
                          {pair.baseAsset.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white group-hover:text-amber-400 transition-colors">
                            {pair.symbol}
                          </div>
                          <div className="text-[10px] text-gray-400">{pair.category}</div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => toggleFavorite(pair.symbol, e)}
                        className="text-gray-500 hover:text-amber-400 transition-colors p-1"
                      >
                        <Star className={`w-3.5 h-3.5 ${isFav ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <div className="font-republic-mono font-extrabold text-sm text-white">
                          {formatPrice(pair.currentPrice, pair.precision)}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Vol: {formatVolume(pair.quoteVolume24h)}
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold font-republic-mono ${
                        isPositive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                      }`}>
                        {isPositive ? '+' : ''}{pair.change24h.toFixed(2)}%
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="text-[10px] text-gray-500">
                        High: {formatPrice(pair.high24h, pair.precision)}
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-amber-400 flex items-center space-x-1">
                        <span>Trade</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
