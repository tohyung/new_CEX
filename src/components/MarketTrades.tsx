import React, { useState } from 'react';
import { Activity, Pause, Play, Search, Maximize2, X } from 'lucide-react';
import { RecentTrade, TradingPair } from '../types';
import { playSound } from '../utils/sound';

interface MarketTradesProps {
  pair: TradingPair;
  trades: RecentTrade[];
  onSelectPrice: (price: number) => void;
}

export const MarketTrades: React.FC<MarketTradesProps> = ({
  pair,
  trades,
  onSelectPrice
}) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37),inset_0_1px_0_0_rgba(255,255,255,0.05)] overflow-hidden text-xs select-none font-republic">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/[0.08] select-none shrink-0">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Recent Trades
          </span>
          <span className="flex items-center space-x-1 text-[10px] text-[#10b981] font-republic-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping"></span>
            <span>Live</span>
          </span>
        </div>

        <div className="flex items-center space-x-1 text-gray-500">
          <button
            id="trades-pause-btn"
            onClick={() => {
              playSound('click');
              setIsPaused(!isPaused);
            }}
            title={isPaused ? 'Resume stream' : 'Pause stream'}
            className="p-1 rounded text-gray-400 hover:text-white transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-white" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button className="p-1 hover:text-gray-300 rounded transition-colors" title="Search">
            <Search className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:text-gray-300 rounded transition-colors" title="Maximize">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:text-gray-300 rounded transition-colors" title="Close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] text-gray-400 font-medium border-b border-white/[0.08] bg-white/[0.02] shrink-0 sticky top-0">
        <span className="col-span-5 xl:col-span-4 text-left">Price ({pair.quoteAsset})</span>
        <span className="col-span-4 xl:col-span-3 text-right">Size ({pair.baseAsset})</span>
        <span className="hidden xl:block xl:col-span-3 text-right">Total</span>
        <span className="col-span-3 xl:col-span-2 text-right">Time</span>
      </div>

      {/* Trades List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03] min-h-0">
        {trades.slice(0, 60).map((trade, idx) => {
          const isBuy = trade.side === 'buy';
          const time = new Date(trade.time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
          const totalVal = trade.price * trade.amount;

          return (
            <div
              key={trade.id || `trade-${idx}`}
              onClick={() => {
                playSound('click');
                onSelectPrice(trade.price);
              }}
              className="grid grid-cols-12 px-3 py-1 items-center font-republic-mono text-[11px] cursor-pointer hover:bg-white/[0.04] transition-colors"
            >
              <span className={`col-span-5 xl:col-span-4 text-left font-semibold ${isBuy ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                {trade.price.toFixed(pair.precision)}
              </span>
              <span className="col-span-4 xl:col-span-3 text-gray-200 text-right">
                {trade.amount.toFixed(pair.qtyPrecision)}
              </span>
              <span className="hidden xl:block xl:col-span-3 text-gray-400 text-right text-[10px]">
                {totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="col-span-3 xl:col-span-2 text-gray-500 text-right text-[10px]">
                {time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
