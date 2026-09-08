import React, { useState, useRef, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  Search, 
  Star, 
  Wallet, 
  PlusCircle, 
  Activity, 
  Zap, 
  Layers,
  ArrowUpRight,
  RefreshCw,
  LogIn,
  User
} from 'lucide-react';
import { TradingPair, TradingMode, AppViewMode } from '../types';
import { playSound } from '../utils/sound';

interface NavbarProps {
  currentPair: TradingPair;
  allPairs: TradingPair[];
  onSelectPair: (pair: TradingPair) => void;
  tradingMode?: TradingMode;
  onSelectMode?: (mode: TradingMode) => void;
  appViewMode: AppViewMode;
  onSelectAppViewMode: (mode: AppViewMode) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onOpenDeposit: () => void;
  onOpenLogin?: () => void;
  user?: { name: string; email: string } | null;
  onLogout?: () => void;
  totalBalanceUsd?: number;
  totalPnlUsd?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPair,
  allPairs,
  onSelectPair,
  tradingMode,
  onSelectMode,
  appViewMode,
  onSelectAppViewMode,
  soundEnabled,
  onToggleSound,
  onOpenDeposit,
  onOpenLogin,
  user,
  onLogout,
  totalBalanceUsd = 0,
  totalPnlUsd = 0
}) => {
  const [isPairDropdownOpen, setIsPairDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<string[]>(['BTC/USDT', 'ETH/USDT', 'SOL/USDT']);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsPairDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    setFavorites(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const categories = ['All', 'Favorites', 'Layer 1', 'DeFi', 'AI', 'Meme'];

  const filteredPairs = allPairs.filter(pair => {
    const matchesSearch = pair.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pair.baseAsset.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Favorites') return favorites.includes(pair.symbol);
    return pair.category === selectedCategory;
  });

  const isPositive = currentPair.change24h >= 0;

  return (
    <header className="h-14 border-b flex items-center justify-between px-3 select-none text-xs sticky top-0 z-50 transition-colors font-republic bg-[#0b0e14]/75 backdrop-blur-xl border-white/[0.08]">
      {/* Left side: Brand Logo, Mode Tabs & (in Pro mode) Pair Selector */}
      <div className="flex items-center space-x-3">
        {/* Brand Logo & Heading - Clean & Minimalist */}
        <div className="flex items-center space-x-2.5 mr-2">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-black">
            <span className="font-republic-display text-sm font-black tracking-tighter">TR</span>
          </div>
          <span className="font-republic-display font-extrabold text-sm tracking-tight text-white uppercase">
            TRADE REPUBLIC
          </span>
        </div>

        {/* View Switcher: Clean Minimalist Tabs */}
        <div className="bg-[#12161f]/60 backdrop-blur-md p-0.5 rounded-xl flex border border-white/[0.08]">
          <button
            id="nav-view-trade-republic"
            onClick={() => {
              playSound('click');
              onSelectAppViewMode('trade_republic');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-republic-display font-bold transition-all ${
              appViewMode === 'trade_republic'
                ? 'bg-white text-black shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Crypto
          </button>
          <button
            id="nav-view-pro-terminal"
            onClick={() => {
              playSound('click');
              onSelectAppViewMode('pro_terminal');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-republic-display font-bold transition-all ${
              appViewMode === 'pro_terminal'
                ? 'bg-white text-black shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Pro Terminal
          </button>
        </div>

        {/* Pair Dropdown Trigger (ONLY in Pro Terminal mode - hidden on Trade Republic clean view) */}
        {appViewMode === 'pro_terminal' && (
          <div className="relative" ref={dropdownRef}>
            <button
              id="nav-pair-dropdown-btn"
              onClick={() => {
                playSound('click');
                setIsPairDropdownOpen(!isPairDropdownOpen);
              }}
              className="flex items-center space-x-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] px-3 py-1.5 rounded-xl transition-all shadow-xs"
            >
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-white text-sm font-republic-mono">{currentPair.symbol}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md font-republic-mono ${
                    isPositive ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#f43f5e]/15 text-[#f43f5e]'
                  }`}>
                    {isPositive ? '+' : ''}{currentPair.change24h}%
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            </button>

          {/* Pair Selector Dropdown Window */}
          {isPairDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-[380px] bg-[#12161f] border border-[#1e2330] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col backdrop-blur-md">
              {/* Search input */}
              <div className="p-2.5 border-b border-[#1e2330] bg-[#0e121a]">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 text-gray-400" />
                  <input
                    id="pair-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search coin / pair (e.g. BTC, SOL)..."
                    className="w-full bg-[#181d28] border border-[#1e2330] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white font-republic"
                    autoFocus
                  />
                </div>
              </div>

              {/* Category tabs */}
              <div className="flex items-center space-x-1 px-2.5 py-2 border-b border-[#1e2330] overflow-x-auto text-[11px] text-gray-400 scrollbar-none font-republic">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-white text-black font-extrabold font-republic-display'
                        : 'hover:text-white'
                    }`}
                  >
                    {cat === 'Favorites' ? '★ Favorites' : cat}
                  </button>
                ))}
              </div>

              {/* Pair List Header */}
              <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] text-gray-400 border-b border-[#1e2330] font-medium font-republic bg-[#0e121a]">
                <span className="col-span-5">Pair</span>
                <span className="col-span-4 text-right">Last Price</span>
                <span className="col-span-3 text-right">24h Chg</span>
              </div>

              {/* Pair List Items */}
              <div className="max-h-[300px] overflow-y-auto divide-y divide-[#1e2330]">
                {filteredPairs.map(pair => {
                  const isFav = favorites.includes(pair.symbol);
                  const isSelected = pair.symbol === currentPair.symbol;
                  const pos = pair.change24h >= 0;
                  return (
                    <div
                      key={pair.symbol}
                      onClick={() => {
                        playSound('click');
                        onSelectPair(pair);
                        setIsPairDropdownOpen(false);
                      }}
                      className={`grid grid-cols-12 items-center px-3 py-2 cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#181d28]' : 'hover:bg-[#161c28]'
                      }`}
                    >
                      <div className="col-span-5 flex items-center space-x-1.5">
                        <button
                          onClick={(e) => toggleFavorite(pair.symbol, e)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Star className={`w-3 h-3 ${isFav ? 'fill-white text-white' : ''}`} />
                        </button>
                        <span className="font-republic-mono font-bold text-white text-xs">{pair.symbol}</span>
                        {pair.maxLeverage > 50 && (
                          <span className="text-[9px] text-white bg-white/10 px-1 rounded font-republic-mono">
                            {pair.maxLeverage}x
                          </span>
                        )}
                      </div>
                      <div className="col-span-4 text-right font-republic-mono font-medium text-white text-xs">
                        ${pair.currentPrice.toLocaleString(undefined, { minimumFractionDigits: pair.precision, maximumFractionDigits: pair.precision })}
                      </div>
                      <div className={`col-span-3 text-right font-republic-mono text-xs font-semibold ${
                        pos ? 'text-[#10b981]' : 'text-[#f43f5e]'
                      }`}>
                        {pos ? '+' : ''}{pair.change24h}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        )}

        {/* Ticker 24h Metrics Strip (Only in Pro mode) */}
        {appViewMode === 'pro_terminal' && (
          <div className="hidden xl:flex items-center space-x-5 pl-3 border-l border-[#1e2330] text-[11px]">
            <div>
              <div className="text-gray-400 text-[10px]">24h High</div>
              <div className="font-republic-mono font-semibold text-gray-200">
                ${currentPair.high24h.toLocaleString(undefined, { minimumFractionDigits: currentPair.precision })}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-[10px]">24h Low</div>
              <div className="font-republic-mono font-semibold text-gray-200">
                ${currentPair.low24h.toLocaleString(undefined, { minimumFractionDigits: currentPair.precision })}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-[10px]">24h Volume ({currentPair.baseAsset})</div>
              <div className="font-republic-mono font-semibold text-gray-200">
                {currentPair.volume24h.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-[10px]">24h Turnover</div>
              <div className="font-republic-mono font-semibold text-gray-200">
                ${(currentPair.quoteVolume24h / 1e6).toFixed(2)}M
              </div>
            </div>
            {tradingMode === 'perps' && (
              <div>
                <div className="text-gray-400 text-[10px] flex items-center space-x-1">
                  <span>Funding / Countdown</span>
                </div>
                <div className="font-republic-mono font-semibold text-white flex items-center space-x-1">
                  <span>{(currentPair.fundingRate * 100).toFixed(4)}%</span>
                  <span className="text-gray-400 text-[10px]">in 03:22:15</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side: Deposit on the left, Log in on the right, plus Sound toggle */}
      <div className="flex items-center space-x-2">
        {/* Deposit Button (on the left) */}
        <button
          id="nav-deposit-btn"
          onClick={() => {
            playSound('click');
            onOpenDeposit();
          }}
          className="flex items-center space-x-1.5 bg-white hover:bg-gray-200 text-black font-extrabold px-3.5 py-1.5 rounded-xl text-xs transition-all shadow-xs active:scale-95 font-republic-display"
        >
          <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Deposit</span>
        </button>

        {/* Log in Button (on the right) */}
        {user ? (
          <div className="relative group">
            <button
              id="nav-user-btn"
              onClick={onLogout}
              title="Click to Log out"
              className="flex items-center space-x-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.10] px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            >
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-mono">
                {user.name.charAt(0)}
              </div>
              <span className="hidden sm:inline font-republic-display">{user.name}</span>
            </button>
          </div>
        ) : (
          <button
            id="nav-login-btn"
            onClick={() => {
              playSound('click');
              onOpenLogin?.();
            }}
            className="flex items-center space-x-1.5 bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/[0.12] hover:border-white/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 font-republic-display"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log in</span>
          </button>
        )}
      </div>
    </header>
  );
};
