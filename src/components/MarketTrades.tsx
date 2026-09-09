import React, { useState } from 'react';
import { Activity, Pause, Play, Search, Maximize2, X } from 'lucide-react';
import { RecentTrade, TradingPair } from '../types';
import { playSound } from '../utils/sound';

interface MarketTradesProps {
  pair: TradingPair;
  trades: RecentTrade[];
  onSelectPrice: (price: number) => void;
  activeTab?: 'orderbook' | 'trades';
  onTabChange?: (tab: 'orderbook' | 'trades') => void;
}

export const MarketTrades: React.FC<MarketTradesProps> = ({
  pair,
  trades,
  onSelectPrice,
  activeTab = 'trades',
  onTabChange
}) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#12141a]/70 backdrop-blur-md border border-white/[0.08] rounded-lg shadow-xs overflow-hidden text-xs select-none font-republic">
      {/* Terminal Title Bar */}
      <div className="h-9 px-2 border-b border-white/[0.08] flex items-center justify-between bg-[#151720]/65 shrink-0">
        <div className="flex items-center space-x-1.5">
          {onTabChange ? (
            <div className="flex items-center bg-white/[0.04] p-0.5 rounded border border-white/[0.08]">
              <button
                id="trades-tab-book"
                type="button"
                onClick={() => onTabChange('orderbook')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  activeTab === 'orderbook'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Book
              </button>
              <button
                id="trades-tab-trades"
                type="button"
                onClick={() => onTabChange('trades')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  activeTab === 'trades'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Trades
              </button>
            </div>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/[0.06] text-white border border-white/[0.08] tracking-wide">
              Recent Trades
            </span>
          )}

          <span className="flex items-center space-x-1 text-[9px] text-[#22c55e] font-republic-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping"></span>
            <span>Live</span>
          </span>
        </div>

        <div className="flex items-center space-x-1 text-gray-400">
          <button
            id="trades-pause-btn"
            onClick={() => {
              playSound('click');
              setIsPaused(!isPaused);
            }}
            title={isPaused ? 'Resume stream' : 'Pause stream'}
            className="p-1 rounded hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-white" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Column Headers (Clean 3-column proportional for thin container) */}
      <div className="flex items-center justify-between px-2.5 py-1 text-[10px] text-gray-400 font-medium border-b border-white/[0.06] bg-black/20 shrink-0 sticky top-0">
        <span className="w-1/3 text-left">Price ({pair.quoteAsset})</span>
        <span className="w-1/3 text-right">Size ({pair.baseAsset})</span>
        <span className="w-1/3 text-right">Time</span>
      </div>

      {/* Trades List */}
      <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-white/[0.02] min-h-0">
        {trades.slice(0, 60).map((trade, idx) => {
          const isBuy = trade.side === 'buy';
          const time = new Date(trade.time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });

          return (
            <div
              key={trade.id || `trade-${idx}`}
              onClick={() => {
                playSound('click');
                onSelectPrice(trade.price);
              }}
              className="flex items-center justify-between px-2.5 py-[2.5px] font-republic-mono text-[11px] cursor-pointer hover:bg-white/[0.04] transition-colors"
            >
              <span className={`w-1/3 text-left font-semibold ${isBuy ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                {trade.price.toFixed(pair.precision)}
              </span>
              <span className="w-1/3 text-right text-gray-200">
                {trade.amount.toFixed(pair.qtyPrecision)}
              </span>
              <span className="w-1/3 text-right text-gray-500 text-[10px]">
                {time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
