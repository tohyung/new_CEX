import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { OrderBookLevel, TradingPair } from '../types';
import { playSound } from '../utils/sound';

interface OrderBookProps {
  pair: TradingPair;
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
  lastPrice: number;
  priceTickDirection: 'up' | 'down' | 'neutral';
  onSelectPrice: (price: number, amount?: number) => void;
  activeTab?: 'orderbook' | 'trades';
  onTabChange?: (tab: 'orderbook' | 'trades') => void;
}

export const OrderBook: React.FC<OrderBookProps> = ({
  pair,
  asks,
  bids,
  lastPrice,
  priceTickDirection,
  onSelectPrice,
  activeTab = 'orderbook',
  onTabChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'both' | 'bids' | 'asks'>('both');
  const [precision, setPrecision] = useState<number>(pair.precision);
  const [rowLimit, setRowLimit] = useState<number>(22);

  // Dynamic row calculation based on container height to completely eliminate blank gaps at both heads
  useEffect(() => {
    if (!containerRef.current) return;
    const calculateRows = () => {
      if (!containerRef.current) return;
      const totalH = containerRef.current.clientHeight;
      // Top header (36px), table column header (26px), mid price bar (32px) = 94px
      const availableH = totalH - 94;
      const perSideH = viewMode === 'both' ? availableH / 2 : availableH;
      // Target each row to ~18.5px
      const count = Math.max(10, Math.floor(perSideH / 18.5));
      setRowLimit(count);
    };

    calculateRows();
    const observer = new ResizeObserver(calculateRows);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [viewMode]);

  // Calculate spread between best ask and best bid
  const bestAsk = asks[asks.length - 1]?.price || lastPrice;
  const bestBid = bids[0]?.price || lastPrice;
  const spread = Math.max(0, bestAsk - bestBid);
  const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0;

  // Determine row counts based on view mode and container height
  const displayedAsks = viewMode === 'both' ? asks.slice(-rowLimit) : viewMode === 'asks' ? asks.slice(-rowLimit) : [];
  const displayedBids = viewMode === 'both' ? bids.slice(0, rowLimit) : viewMode === 'bids' ? bids.slice(0, rowLimit) : [];

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-[#12141a]/70 backdrop-blur-md border border-white/[0.08] rounded-lg shadow-xs overflow-hidden text-xs select-none font-republic"
    >
      {/* 1. Top Header Bar (Head 1) - Completely filled with Tabs, View Mode Toggles, Precision dropdown, and Spread info */}
      <div className="h-9 px-2 border-b border-white/[0.08] flex items-center justify-between bg-[#151720]/65 shrink-0">
        <div className="flex items-center space-x-1.5">
          {onTabChange ? (
            <div className="flex items-center bg-white/[0.04] p-0.5 rounded border border-white/[0.08]">
              <button
                id="orderbook-tab-book"
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
                id="orderbook-tab-trades"
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
              Order Book
            </span>
          )}
        </div>

        {/* View Mode Icons in Top Bar to eliminate header blank space */}
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center space-x-0.5 bg-white/[0.04] p-0.5 rounded border border-white/[0.08]">
            <button
              onClick={() => setViewMode('both')}
              className={`p-1 rounded-xs transition-colors cursor-pointer ${viewMode === 'both' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Both Asks & Bids"
            >
              <div className="w-2.5 h-2.5 flex flex-col justify-between">
                <span className="w-full h-0.5 bg-[#ef4444] rounded-xs"></span>
                <span className="w-full h-0.5 bg-[#22c55e] rounded-xs"></span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('bids')}
              className={`p-1 rounded-xs transition-colors cursor-pointer ${viewMode === 'bids' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Buy Orders Only"
            >
              <div className="w-2.5 h-2.5 flex flex-col justify-center">
                <span className="w-full h-1 bg-[#22c55e] rounded-xs"></span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('asks')}
              className={`p-1 rounded-xs transition-colors cursor-pointer ${viewMode === 'asks' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Sell Orders Only"
            >
              <div className="w-2.5 h-2.5 flex flex-col justify-center">
                <span className="w-full h-1 bg-[#ef4444] rounded-xs"></span>
              </div>
            </button>
          </div>

          <select
            id="orderbook-precision-select"
            value={precision}
            onChange={(e) => setPrecision(Number(e.target.value))}
            className="bg-white/[0.04] border border-white/[0.08] rounded px-1 py-0.5 text-gray-300 font-republic-mono text-[9px] focus:outline-none cursor-pointer"
          >
            <option value={pair.precision} className="bg-[#12141a]">{pair.precision === 2 ? '0.01' : '0.1'}</option>
            <option value={Math.max(0, pair.precision - 1)} className="bg-[#12141a]">1</option>
            <option value={Math.max(0, pair.precision - 2)} className="bg-[#12141a]">10</option>
          </select>
        </div>

        {/* Spread Info */}
        <div className="flex items-center space-x-1 text-[10px] text-gray-400 font-republic-mono">
          <span className="text-gray-500 hidden sm:inline">Spread</span>
          <span className="text-gray-300 font-medium">{spreadPercent.toFixed(2)}%</span>
        </div>
      </div>

      {/* 2. Table Column Headers (Head 2) - Pro 3-column layout filling entire width (Price, Size, Total) */}
      <div className="flex items-center justify-between px-2.5 py-1 text-[10px] text-gray-400 font-medium border-b border-white/[0.06] bg-black/20 shrink-0">
        <span className="w-[38%] text-left">Price ({pair.quoteAsset})</span>
        <span className="w-[32%] text-right">Size ({pair.baseAsset})</span>
        <span className="w-[30%] text-right">Total</span>
      </div>

      {/* Asks (Sell Orders - Red) - Fills the entire top half with zero blank space at the top head */}
      {viewMode !== 'bids' && (
        <div className="flex-1 flex flex-col justify-end overflow-hidden min-h-0">
          {displayedAsks.map((ask, idx) => (
            <div
              key={`ask-${idx}-${ask.price}`}
              onClick={() => {
                playSound('click');
                onSelectPrice(ask.price, ask.amount);
              }}
              className="relative flex-1 flex items-center justify-between px-2.5 py-0 font-republic-mono text-[10.5px] cursor-pointer hover:bg-white/[0.06] group transition-colors min-h-[16px] max-h-[22px]"
            >
              {/* Red Depth bar behind */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-[#ef4444]/15 pointer-events-none transition-all duration-200"
                style={{ width: `${ask.depthPercent}%` }}
              />
              <span className="w-[38%] text-[#ef4444] font-semibold text-left relative z-10 truncate">
                {ask.price.toFixed(precision)}
              </span>
              <span className="w-[32%] text-gray-300 text-right relative z-10 font-normal truncate">
                {ask.amount.toFixed(pair.qtyPrecision)}
              </span>
              <span className="w-[30%] text-gray-500 text-right relative z-10 font-normal text-[10px] truncate">
                {ask.total.toFixed(pair.qtyPrecision)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Mid Market Price Bar - Well balanced with Live Price, Tick Direction, Mark Price, and USD value */}
      <div className="px-2.5 py-1.5 bg-[#161822]/60 border-y border-white/[0.08] flex items-center justify-between font-republic-mono shrink-0">
        <div className="flex items-center space-x-1.5">
          <span className={`text-xs font-bold flex items-center space-x-0.5 ${priceTickDirection === 'down' ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
            <span>{lastPrice.toFixed(pair.precision)}</span>
            {priceTickDirection === 'down' ? (
              <ArrowDown className="w-3 h-3 stroke-[2.5]" />
            ) : (
              <ArrowUp className="w-3 h-3 stroke-[2.5]" />
            )}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[10px]">
          <span className="text-gray-400 text-[9px] hidden sm:inline">
            Mark: <span className="text-gray-200 font-medium">{(lastPrice * 0.9998).toFixed(pair.precision)}</span>
          </span>
          <span className="text-gray-400 text-[9px]">
            ${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Bids (Buy Orders - Green) - Fills the entire bottom half with zero blank space at the bottom head */}
      {viewMode !== 'asks' && (
        <div className="flex-1 flex flex-col justify-start overflow-hidden min-h-0">
          {displayedBids.map((bid, idx) => (
            <div
              key={`bid-${idx}-${bid.price}`}
              onClick={() => {
                playSound('click');
                onSelectPrice(bid.price, bid.amount);
              }}
              className="relative flex-1 flex items-center justify-between px-2.5 py-0 font-republic-mono text-[10.5px] cursor-pointer hover:bg-white/[0.06] group transition-colors min-h-[16px] max-h-[22px]"
            >
              {/* Green Depth bar behind */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-[#22c55e]/15 pointer-events-none transition-all duration-200"
                style={{ width: `${bid.depthPercent}%` }}
              />
              <span className="w-[38%] text-[#22c55e] font-semibold text-left relative z-10 truncate">
                {bid.price.toFixed(precision)}
              </span>
              <span className="w-[32%] text-gray-300 text-right relative z-10 font-normal truncate">
                {bid.amount.toFixed(pair.qtyPrecision)}
              </span>
              <span className="w-[30%] text-gray-500 text-right relative z-10 font-normal text-[10px] truncate">
                {bid.total.toFixed(pair.qtyPrecision)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
