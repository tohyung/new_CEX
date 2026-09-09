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
  User,
  FileText,
  HelpCircle,
  Bell,
  Volume2,
  VolumeX,
  ShieldCheck,
  Award,
  Sparkles,
  Sun,
  Moon
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
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenDeposit: () => void;
  onOpenLogin?: () => void;
  user?: { name: string; email: string } | null;
  onLogout?: () => void;
  totalBalanceUsd?: number;
  totalPnlUsd?: number;
  onShowToast?: (msg: string, type?: 'success' | 'info') => void;
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
  theme = 'dark',
  onToggleTheme,
  onOpenDeposit,
  onOpenLogin,
  user,
  onLogout,
  totalBalanceUsd = 0,
  totalPnlUsd = 0,
  onShowToast
}) => {
  const [isPairDropdownOpen, setIsPairDropdownOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<string[]>(['BTC/USDT', 'ETH/USDT', 'SOL/USDT']);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsPairDropdownOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
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

  return (
    <header 
      id="app-global-header"
      className="sticky top-0 z-50 w-full h-14 md:h-16 shrink-0 border-b border-white/[0.10] flex items-center justify-between px-4 sm:px-6 lg:px-8 select-none text-xs transition-all font-republic bg-white/[0.03] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.06)]"
    >
      {/* Translucent glass specular sheen */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent pointer-events-none" />

      {/* Left side: Brand Logo, Mode Tabs & Ticker metrics */}
      <div className="relative z-10 flex items-center space-x-3 sm:space-x-5">
        {/* Brand Logo & Heading - Wide & Elegant (PTIT Exchange Landing Page) */}
        <button
          id="nav-brand-logo-btn"
          type="button"
          onClick={() => {
            playSound('click');
            onSelectAppViewMode('trade_republic');
          }}
          className={`flex items-center space-x-2.5 mr-1 cursor-pointer group text-left focus:outline-hidden p-1 rounded-xl transition-all ${
            appViewMode === 'trade_republic'
              ? 'ring-1 ring-white/20 bg-white/[0.05]'
              : 'hover:opacity-90'
          }`}
          title="PTIT Exchange Landing Page"
        >
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-white flex items-center justify-center shadow-[0_2px_10px_rgba(255,255,255,0.15)] text-black shrink-0 transition-transform duration-200 group-hover:scale-105">
            <span className="font-republic-display text-xs md:text-sm font-black tracking-tighter">TR</span>
          </div>
          <div className="flex flex-col">
            <span className="font-republic-display font-extrabold text-xs md:text-sm tracking-tight text-white uppercase hidden sm:inline group-hover:text-emerald-400 transition-colors">
              PTIT Exchange
            </span>
            <span className="text-[9px] font-republic-mono text-gray-400 tracking-wider uppercase hidden md:inline leading-none">
              CRYPTO EXCHANGE
            </span>
          </div>
        </button>
      </div>

      {/* Center: Navigation Series of Text Buttons (Trade, Market, Community, Square, More) */}
      <nav className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center space-x-3 sm:space-x-5 md:space-x-6 lg:space-x-8">
          {/* Trade Button (Pro Terminal) */}
          <button
            id="nav-btn-trade"
            type="button"
            onClick={() => {
              playSound('click');
              onSelectAppViewMode('pro_terminal');
            }}
            className={`group relative py-1.5 px-2.5 text-sm md:text-[15px] font-republic-display transition-colors cursor-pointer ${
              appViewMode === 'pro_terminal' || appViewMode === 'trade'
                ? 'text-white font-extrabold'
                : 'text-gray-400 hover:text-white font-medium'
            }`}
          >
            <span className="relative inline-block">
              <span>Trade</span>
              <span
                className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-white transition-transform duration-250 origin-center rounded-full ${
                  appViewMode === 'pro_terminal' || appViewMode === 'trade'
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </span>
          </button>

          {/* Market Button */}
          <button
            id="nav-btn-market"
            type="button"
            onClick={() => {
              playSound('click');
              onSelectAppViewMode('market');
            }}
            className={`group relative py-1.5 px-2.5 text-sm md:text-[15px] font-republic-display transition-colors cursor-pointer ${
              appViewMode === 'market'
                ? 'text-white font-extrabold'
                : 'text-gray-400 hover:text-white font-medium'
            }`}
          >
            <span className="relative inline-block">
              <span>Market</span>
              <span
                className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-white transition-transform duration-250 origin-center rounded-full ${
                  appViewMode === 'market'
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </span>
          </button>

          {/* Community Button */}
          <button
            id="nav-btn-community"
            type="button"
            onClick={() => {
              playSound('click');
              onSelectAppViewMode('community');
            }}
            className={`group relative py-1.5 px-2.5 text-sm md:text-[15px] font-republic-display transition-colors cursor-pointer ${
              appViewMode === 'community'
                ? 'text-white font-extrabold'
                : 'text-gray-400 hover:text-white font-medium'
            }`}
          >
            <span className="relative inline-block">
              <span>Community</span>
              <span
                className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-white transition-transform duration-250 origin-center rounded-full ${
                  appViewMode === 'community'
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </span>
          </button>

          {/* Square Button */}
          <button
            id="nav-btn-square"
            type="button"
            onClick={() => {
              playSound('click');
              onSelectAppViewMode('square');
            }}
            className={`group relative py-1.5 px-2.5 text-sm md:text-[15px] font-republic-display transition-colors cursor-pointer ${
              appViewMode === 'square'
                ? 'text-white font-extrabold'
                : 'text-gray-400 hover:text-white font-medium'
            }`}
          >
            <span className="relative inline-block">
              <span>Square</span>
              <span
                className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-white transition-transform duration-250 origin-center rounded-full ${
                  appViewMode === 'square'
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </span>
          </button>

          {/* More Dropdown Button */}
          <div className="relative" ref={moreDropdownRef}>
            <button
              id="nav-btn-more"
              type="button"
              onClick={() => {
                playSound('click');
                setIsMoreOpen(prev => !prev);
              }}
              className={`group relative flex items-center space-x-1 py-1.5 px-2.5 text-sm md:text-[15px] font-republic-display transition-colors cursor-pointer ${
                isMoreOpen
                  ? 'text-white font-extrabold'
                  : 'text-gray-400 hover:text-white font-medium'
              }`}
            >
              <span className="relative inline-flex items-center space-x-1">
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreOpen ? 'rotate-180 text-white' : 'text-gray-400 group-hover:text-white'}`} />
                <span
                  className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-white transition-transform duration-250 origin-center rounded-full ${
                    isMoreOpen
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </span>
            </button>

            {/* Dropdown Menu */}
            {isMoreOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 sm:w-64 bg-[#0d1017]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] p-2 z-50 text-xs font-republic">
                <div className="px-2 py-1.5 text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  Quick Access
                </div>

                <button
                  id="more-faucet-btn"
                  onClick={() => {
                    playSound('click');
                    setIsMoreOpen(false);
                    onOpenDeposit();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">Testnet Faucet</div>
                    <div className="text-[10px] text-gray-400">Claim 10,000 USDT & 1.0 BTC</div>
                  </div>
                </button>

                <button
                  id="more-fees-btn"
                  onClick={() => {
                    playSound('click');
                    setIsMoreOpen(false);
                    onShowToast?.('VIP 0 Tier Active: Maker 0.02% / Taker 0.05%', 'info');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                >
                  <Award className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">VIP Fee Schedule</div>
                    <div className="text-[10px] text-gray-400">0.02% Maker / 0.05% Taker</div>
                  </div>
                </button>

                <button
                  id="more-api-btn"
                  onClick={() => {
                    playSound('click');
                    setIsMoreOpen(false);
                    onShowToast?.('API Endpoints available: WebSocket & REST at /api/v1', 'info');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">API Documentation</div>
                    <div className="text-[10px] text-gray-400">REST & WebSocket low-latency feeds</div>
                  </div>
                </button>

                <div className="my-1.5 border-t border-white/[0.08]" />

                <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  Preferences & Info
                </div>

                {onToggleSound && (
                  <button
                    id="more-sound-btn"
                    onClick={() => {
                      onToggleSound();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-gray-500 shrink-0" />
                      )}
                      <span className="font-bold text-xs">Audio Effects</span>
                    </div>
                    <span className="text-[10px] font-republic-mono text-gray-400">
                      {soundEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                )}

                {onToggleTheme && (
                  <button
                    id="more-theme-btn"
                    onClick={() => {
                      playSound('click');
                      onToggleTheme();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      {theme === 'dark' ? (
                        <Moon className="w-4 h-4 text-blue-400 shrink-0" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span className="font-bold text-xs">Theme Preference</span>
                    </div>
                    <span className="text-[10px] font-republic-mono text-gray-400 uppercase">
                      {theme}
                    </span>
                  </button>
                )}

                <button
                  id="more-announcements-btn"
                  onClick={() => {
                    playSound('click');
                    setIsMoreOpen(false);
                    onShowToast?.('No urgent system maintenance scheduled. All matching engines operational.', 'info');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">Announcements</div>
                    <div className="text-[10px] text-gray-400">Latest platform updates & listings</div>
                  </div>
                </button>

                <button
                  id="more-help-btn"
                  onClick={() => {
                    playSound('click');
                    setIsMoreOpen(false);
                    onShowToast?.('24/7 Support Desk active. Telegram: @TradeRepublicPro', 'info');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">Help Center</div>
                    <div className="text-[10px] text-gray-400">FAQs & 24/7 Live Desk</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

      {/* Right side: Theme Toggle, Deposit, Log in */}
      <div className="relative z-10 flex items-center space-x-2 sm:space-x-3">
        {/* User Preference Theme Toggle (Dark / Light Mode) */}
        {onToggleTheme && (
          <button
            id="nav-theme-toggle-btn"
            type="button"
            onClick={() => {
              playSound('click');
              onToggleTheme();
            }}
            className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.10] text-gray-300 hover:text-white transition-all cursor-pointer shadow-xs"
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400" />
            )}
          </button>
        )}

        {/* Deposit Button (Wide & Prominent) */}
        <button
          id="nav-deposit-btn"
          type="button"
          onClick={() => {
            playSound('click');
            onOpenDeposit();
          }}
          className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-black font-extrabold px-4 sm:px-5 py-2 rounded-xl text-xs transition-all shadow-[0_2px_12px_rgba(255,255,255,0.15)] active:scale-95 font-republic-display cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Deposit</span>
        </button>

        {/* Log in Button (Wide Translucent Glass pill) */}
        {user ? (
          <div className="relative group">
            <button
              id="nav-user-btn"
              type="button"
              onClick={onLogout}
              title="Click to Log out"
              className="flex items-center space-x-2 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.12] px-3.5 py-2 rounded-xl text-xs font-bold transition-all backdrop-blur-md cursor-pointer"
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
            type="button"
            onClick={() => {
              playSound('click');
              onOpenLogin?.();
            }}
            className="flex items-center space-x-2 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.12] hover:border-white/30 px-4 py-2 rounded-xl text-xs font-bold transition-all backdrop-blur-md shadow-sm active:scale-95 font-republic-display cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log in</span>
          </button>
        )}
      </div>
    </header>
  );
};
