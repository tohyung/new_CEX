import React, { useState } from 'react';
import { ChevronDown, ArrowUp, ArrowDown, AlignJustify, AlignLeft, AlignRight, Search, Maximize2, X } from 'lucide-react';
import { OrderBookLevel, TradingPair } from '../types';
import { playSound } from '../utils/sound';

interface OrderBookProps {
  pair: TradingPair;
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
  lastPrice: number;
  priceTickDirection: 'up' | 'down' | 'neutral';
  onSelectPrice: (price: number, amount?: number) => void;
}

export const OrderBook: React.FC<OrderBookProps> = ({
  pair,
  asks,
  bids,
  lastPrice,
  priceTickDirection,
  onSelectPrice
}) => {
  const [viewMode, setViewMode] = useState<'both' | 'bids' | 'asks'>('both');
  const [precision, setPrecision] = useState<number>(pair.precision);

  // Calculate spread between best ask and best bid
  const bestAsk = asks[asks.length - 1]?.price || lastPrice;
  const bestBid = bids[0]?.price || lastPrice;
  const spread = Math.max(0, bestAsk - bestBid);
  const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0;

  // Determine row counts based on view mode (optimized for dedicated column board)
  const displayedAsks = viewMode === 'both' ? asks.slice(-14) : viewMode === 'asks' ? asks.slice(-28) : [];
  const displayedBids = viewMode === 'both' ? bids.slice(0, 14) : viewMode === 'bids' ? bids.slice(0, 28) : [];

  return (
    <div className="flex flex-col h-full bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37),inset_0_1px_0_0_rgba(255,255,255,0.05)] overflow-hidden text-xs select-none font-republic">
      {/* Header bar: Amber Pill Tab on left, Window controls on right */}
      <div className="h-10 px-3 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02] shrink-0">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-0.5 rounded-full border border-amber-500/80 bg-amber-500/10 text-amber-300 font-semibold text-[11px] tracking-wide">
            Order Book
          </span>
        </div>

        {/* Window action controls matching terminal style */}
        <div className="flex items-center space-x-2 text-gray-500">
          <button className="hover:text-gray-300 transition-colors p-0.5"><Search className="w-3.5 h-3.5" /></button>
          <button className="hover:text-gray-300 transition-colors p-0.5"><Maximize2 className="w-3.5 h-3.5" /></button>
          <button className="hover:text-gray-300 transition-colors p-0.5"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Table Column Headers */}
      <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] text-gray-400 font-medium border-b border-white/[0.08] bg-white/[0.02] shrink-0">
        <span className="col-span-5 text-left">Price</span>
        <span className="col-span-3 text-center">Amount</span>
        <span className="col-span-4 text-right">Total</span>
      </div>

      {/* Asks (Sell Orders - Red) */}
      <div className="flex-1 flex flex-col justify-end overflow-y-auto min-h-0">
        {displayedAsks.map((ask, idx) => (
          <div
            key={`ask-${idx}-${ask.price}`}
            onClick={() => {
              playSound('click');
              onSelectPrice(ask.price, ask.amount);
            }}
            className="relative grid grid-cols-12 px-3 py-0.5 items-center font-republic-mono text-[11px] cursor-pointer hover:bg-white/[0.05] group transition-colors"
          >
            {/* Red Depth bar behind */}
            <div
              className="absolute right-0 top-0 bottom-0 bg-[#f43f5e]/15 pointer-events-none transition-all duration-200"
              style={{ width: `${ask.depthPercent}%` }}
            />
            <span className="col-span-5 text-[#f43f5e] font-semibold text-left">
              {ask.price.toFixed(precision)}
            </span>
            <span className="col-span-3 text-gray-200 text-center">
              {ask.amount.toFixed(pair.qtyPrecision)}
            </span>
            <span className="col-span-4 text-gray-400 text-right">
              {ask.total.toFixed(pair.qtyPrecision)}
            </span>
          </div>
        ))}
      </div>

      {/* Mid Market Price Bar */}
      <div className="px-3 py-2 bg-white/[0.02] border-y border-white/[0.08] flex items-center justify-between font-republic-mono shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-extrabold flex items-center space-x-1 text-[#00e676]">
            <span>{lastPrice.toFixed(pair.precision)}</span>
            <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
          </span>
          <span className="text-[10px] text-gray-400 font-republic">
            last price
          </span>
        </div>

        {/* View Mode Icons & Precision */}
        <div className="flex items-center space-x-2 text-[10px]">
          <div className="flex items-center space-x-0.5 bg-white/[0.04] p-0.5 rounded border border-white/[0.08]">
            <button
              onClick={() => setViewMode('both')}
              className={`p-0.5 rounded ${viewMode === 'both' ? 'bg-white/20' : 'text-gray-400'}`}
              title="Both"
            >
              <div className="w-2.5 h-2.5 flex flex-col justify-between">
                <span className="w-full h-0.5 bg-rose-500"></span>
                <span className="w-full h-0.5 bg-emerald-500"></span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('bids')}
              className={`p-0.5 rounded ${viewMode === 'bids' ? 'bg-white/20' : 'text-gray-400'}`}
              title="Bids"
            >
              <div className="w-2.5 h-2.5 flex flex-col justify-center">
                <span className="w-full h-1 bg-emerald-500"></span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('asks')}
              className={`p-0.5 rounded ${viewMode === 'asks' ? 'bg-white/20' : 'text-gray-400'}`}
              title="Asks"
            >
              <div className="w-2.5 h-2.5 flex flex-col justify-center">
                <span className="w-full h-1 bg-rose-500"></span>
              </div>
            </button>
          </div>

          <select
            id="orderbook-precision-select"
            value={precision}
            onChange={(e) => setPrecision(Number(e.target.value))}
            className="bg-white/[0.04] border border-white/[0.08] rounded px-1.5 py-0.5 text-gray-300 font-republic-mono text-[9px] focus:outline-none"
          >
            <option value={pair.precision} className="bg-[#0b0e14]">0.1</option>
            <option value={Math.max(0, pair.precision - 1)} className="bg-[#0b0e14]">1</option>
            <option value={Math.max(0, pair.precision - 2)} className="bg-[#0b0e14]">10</option>
          </select>
        </div>
      </div>

      {/* Bids (Buy Orders - Green) */}
      <div className="flex-1 flex flex-col justify-start overflow-y-auto min-h-0">
        {displayedBids.map((bid, idx) => (
          <div
            key={`bid-${idx}-${bid.price}`}
            onClick={() => {
              playSound('click');
              onSelectPrice(bid.price, bid.amount);
            }}
            className="relative grid grid-cols-12 px-3 py-0.5 items-center font-republic-mono text-[11px] cursor-pointer hover:bg-white/[0.05] group transition-colors"
          >
            {/* Green Depth bar behind */}
            <div
              className="absolute right-0 top-0 bottom-0 bg-[#10b981]/15 pointer-events-none transition-all duration-200"
              style={{ width: `${bid.depthPercent}%` }}
            />
            <span className="col-span-5 text-[#10b981] font-semibold text-left">
              {bid.price.toFixed(precision)}
            </span>
            <span className="col-span-3 text-gray-300 text-right">
              {bid.amount.toFixed(pair.qtyPrecision)}
            </span>
            <span className="col-span-4 text-gray-400 text-right">
              {bid.total.toFixed(pair.qtyPrecision)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
