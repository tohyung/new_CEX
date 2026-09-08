import React, { useState } from 'react';
import { X, Search, Check, Sliders, Eye, EyeOff } from 'lucide-react';
import { playSound } from '../utils/sound';

export interface TVIndicatorSettings {
  ema9: boolean;
  ema21: boolean;
  sma50: boolean;
  sma200: boolean;
  ma7: boolean;
  ma25: boolean;
  bollinger: boolean;
  volume: boolean;
  rsi: boolean;
  macd: boolean;
}

interface TradingViewIndicatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  indicators: TVIndicatorSettings;
  onToggleIndicator: (key: keyof TVIndicatorSettings) => void;
}

interface IndicatorMeta {
  key: keyof TVIndicatorSettings;
  name: string;
  category: 'Trend' | 'Oscillators' | 'Volatility' | 'Volume';
  color: string;
  description: string;
}

const INDICATORS_LIST: IndicatorMeta[] = [
  {
    key: 'ema9',
    name: 'Exponential Moving Average (9)',
    category: 'Trend',
    color: '#2962FF',
    description: 'Fast exponential trend filter for short-term momentum',
  },
  {
    key: 'ema21',
    name: 'Exponential Moving Average (21)',
    category: 'Trend',
    color: '#FF9800',
    description: 'Medium dynamic support/resistance baseline',
  },
  {
    key: 'sma50',
    name: 'Simple Moving Average (50)',
    category: 'Trend',
    color: '#E91E63',
    description: 'Key institutional intermediate trend marker',
  },
  {
    key: 'sma200',
    name: 'Simple Moving Average (200)',
    category: 'Trend',
    color: '#00BCD4',
    description: 'The definitive bull/bear macro market boundary',
  },
  {
    key: 'bollinger',
    name: 'Bollinger Bands (20, 2)',
    category: 'Volatility',
    color: '#3B82F6',
    description: 'Standard deviation volatility envelopes and squeeze channels',
  },
  {
    key: 'volume',
    name: 'Volume & Moving Average',
    category: 'Volume',
    color: '#10B981',
    description: 'Tick transaction volume histogram with direction tinting',
  },
  {
    key: 'rsi',
    name: 'Relative Strength Index (14)',
    category: 'Oscillators',
    color: '#A855F7',
    description: 'Momentum oscillator measuring velocity of price movements',
  },
  {
    key: 'macd',
    name: 'MACD (12, 26, Close, 9)',
    category: 'Oscillators',
    color: '#F59E0B',
    description: 'Moving Average Convergence Divergence trend and signal histogram',
  },
];

export const TradingViewIndicatorsModal: React.FC<TradingViewIndicatorsModalProps> = ({
  isOpen,
  onClose,
  indicators,
  onToggleIndicator,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Trend', 'Oscillators', 'Volatility', 'Volume'];

  const filtered = INDICATORS_LIST.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[150] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 font-republic select-none animate-in fade-in duration-150">
      <div className="bg-[#131722] border border-[#2a2e39] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* TradingView-style Modal Header */}
        <div className="h-12 px-4 border-b border-[#2a2e39] flex items-center justify-between bg-[#1e222d]">
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold text-sm tracking-wide font-republic-display">
              Indicators, Metrics & Strategies
            </span>
          </div>
          <button
            id="tv-indicators-close-btn"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#2a2e39] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-3 border-b border-[#2a2e39] bg-[#131722]">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-gray-400" />
            <input
              id="tv-indicator-search-input"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search indicators (e.g. EMA, RSI, Bollinger)..."
              className="w-full bg-[#1e222d] border border-[#2a2e39] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2962FF]"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 text-gray-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1 px-3 py-2 border-b border-[#2a2e39] bg-[#131722] overflow-x-auto text-[11px]">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#2962FF] text-white font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1e222d]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Indicator list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-[#1e222d]/60">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-xs">
              No matching indicators found. Try searching for &quot;EMA&quot; or &quot;RSI&quot;.
            </div>
          ) : (
            filtered.map(item => {
              const active = indicators[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => {
                    playSound('click');
                    onToggleIndicator(item.key);
                  }}
                  className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                    active ? 'bg-[#2962FF]/10 border border-[#2962FF]/30' : 'hover:bg-[#1e222d] border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white text-xs font-semibold">{item.name}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#1e222d] text-gray-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-3">
                    <button
                      className={`px-3 py-1 rounded text-xs font-semibold flex items-center space-x-1 transition-all ${
                        active
                          ? 'bg-[#2962FF] text-white'
                          : 'bg-[#1e222d] text-gray-300 hover:text-white border border-[#2a2e39]'
                      }`}
                    >
                      {active ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </>
                      ) : (
                        <span>Add</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#2a2e39] bg-[#1e222d] flex items-center justify-between text-xs text-gray-400">
          <span>
            {Object.values(indicators).filter(Boolean).length} indicator(s) active
          </span>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="px-4 py-1.5 bg-[#2962FF] hover:bg-[#1e53e5] text-white font-bold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
