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
  Minus,
  Plus,
  FileText,
  HelpCircle,
  Bell,
  Volume2,
  VolumeX,
  ShieldCheck,
  Award,
  Sparkles
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
  terminalScale?: number;
  onTerminalScaleChange?: (scale: number) => void;
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
  onOpenDeposit,
  onOpenLogin,
  user,
  onLogout,
  totalBalanceUsd = 0,
  totalPnlUsd = 0,
  terminalScale = 85,
  onTerminalScaleChange,
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
        {/* Brand Logo & Heading - Wide & Elegant */}
        <div className="flex items-center space-x-2.5 mr-1">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-white flex items-center justify-center shadow-[0_2px_10px_rgba(255,255,255,0.15)] text-black shrink-0">
            <span className="font-republic-display text-xs md:text-sm font-black tracking-tighter">TR</span>
          </div>
          <div className="flex flex-col">
            <span className="font-republic-display font-extrabold text-xs md:text-sm tracking-tight text-white uppercase hidden sm:inline">
              TRADE REPUBLIC
            </span>
            <span className="text-[9px] font-republic-mono text-gray-400 tracking-wider uppercase hidden md:inline leading-none">
              BANK • CRYPTO
            </span>
          </div>
        </div>

        {/* Navigation Series of Text Buttons: Trade (Pro Terminal), Market, Community, Square, More */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2 lg:space-x-3 ml-1 sm:ml-4">
          {/* Trade Button (Pro Terminal) */}
          <button
            id="nav-btn-trade"
            type="button"
            onClick={() => {
              playSound('click');
              onSelectAppViewMode('pro_terminal');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-republic-display transition-all cursor-pointer ${
              appViewMode === 'pro_terminal' || appViewMode === 'trade'
                ? 'text-white font-extrabold bg-white/[0.08] shadow-xs'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Trade
          </button>

          {/* Market Button */}
          <button
            id="nav-btn-market"
            type="button"
            onClick={() => {
              playSound('click');
              onSelectAppViewMode('market');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-republic-display transition-all cursor-pointer ${
              appViewMode === 'market' || appViewMode === 'trade_republic'
                ? 'text-white font-extrabold bg-white/[0.08] shadow-xs'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Market
          </button>

          {/* Community Button */}
          <button
            id="nav-btn-community"
            type="button"
            onClick={() => {
              playSound('click');
              onSelectAppViewMode('community');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-republic-display transition-all cursor-pointer ${
              appViewMode === 'community'
                ? 'text-white font-extrabold bg-white/[0.08] shadow-xs'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Community
          </button>

          {/* Square Button */}
          <button
            id="nav-btn-square"
            type="button"
            onClick={() => {
              playSound('click');
              onSelectAppViewMode('square');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-republic-display transition-all cursor-pointer ${
              appViewMode === 'square'
                ? 'text-white font-extrabold bg-white/[0.08] shadow-xs'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Square
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
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs md:text-sm font-republic-display transition-all cursor-pointer ${
                isMoreOpen
                  ? 'text-white font-extrabold bg-white/[0.08]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>More</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreOpen ? 'rotate-180 text-white' : 'text-gray-400'}`} />
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
      </div>

      {/* Right side: Scale controller (in Pro mode), Deposit, Log in */}
      <div className="relative z-10 flex items-center space-x-2.5 sm:space-x-3">
        {/* Pro Terminal Scale / Zoom Controller */}
        {(appViewMode === 'pro_terminal' || appViewMode === 'trade') && onTerminalScaleChange && (
          <div className="flex items-center space-x-1 bg-white/[0.03] backdrop-blur-md p-1 rounded-xl border border-white/[0.08]">
            <span className="text-gray-400 text-[10px] font-medium px-1.5 hidden md:inline">Scale</span>
            <button
              id="scale-minus-btn"
              type="button"
              onClick={() => {
                playSound('click');
                onTerminalScaleChange(Math.max(70, terminalScale - 5));
              }}
              title="Scale Down"
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            {[80, 85, 90, 100].map(s => (
              <button
                key={s}
                id={`scale-preset-${s}`}
                type="button"
                onClick={() => {
                  playSound('click');
                  onTerminalScaleChange(s);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-republic-mono font-bold transition-all cursor-pointer ${
                  terminalScale === s
                    ? 'bg-white text-black shadow-xs'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {s}%
              </button>
            ))}
            <button
              id="scale-plus-btn"
              type="button"
              onClick={() => {
                playSound('click');
                onTerminalScaleChange(Math.min(110, terminalScale + 5));
              }}
              title="Scale Up"
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
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
