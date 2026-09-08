import React, { useState } from 'react';
import { ChevronDown, ArrowUp, ArrowDown, AlignJustify, AlignLeft, AlignRight } from 'lucide-react';
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
      {/* Header bar: Title, View Switchers, Precision */}
      <div className="h-10 px-3 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center space-x-2">
          <h3 className="font-republic-display font-bold text-white text-xs tracking-tight">
            Order Book
          </h3>
          <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.2 rounded font-republic-mono font-medium">
            L2
          </span>
        </div>

        {/* View Mode Icons */}
        <div className="flex items-center space-x-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.08]">
          <button
            id="orderbook-view-both"
            onClick={() => {
              playSound('click');
              setViewMode('both');
            }}
            title="Show Bids & Asks"
            className={`p-1 rounded-md transition-colors ${viewMode === 'both' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
          >
            <div className="w-3.5 h-3.5 flex flex-col justify-between">
              <span className={`w-full h-1 rounded-xs ${viewMode === 'both' ? 'bg-rose-500' : 'bg-[#f43f5e]'}`}></span>
              <span className={`w-full h-1 rounded-xs ${viewMode === 'both' ? 'bg-emerald-600' : 'bg-[#10b981]'}`}></span>
            </div>
          </button>

          <button
            id="orderbook-view-bids"
            onClick={() => {
              playSound('click');
              setViewMode('bids');
            }}
            title="Show Bids Only"
            className={`p-1 rounded-md transition-colors ${viewMode === 'bids' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
          >
            <div className="w-3.5 h-3.5 flex flex-col justify-center">
              <span className="w-full h-2.5 bg-[#10b981] rounded-xs"></span>
            </div>
          </button>

          <button
            id="orderbook-view-asks"
            onClick={() => {
              playSound('click');
              setViewMode('asks');
            }}
            title="Show Asks Only"
            className={`p-1 rounded-md transition-colors ${viewMode === 'asks' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
          >
            <div className="w-3.5 h-3.5 flex flex-col justify-center">
              <span className="w-full h-2.5 bg-[#f43f5e] rounded-xs"></span>
            </div>
          </button>
        </div>

        {/* Precision / Aggregation Selector */}
        <div className="flex items-center space-x-1 text-[11px] text-gray-400">
          <select
            id="orderbook-precision-select"
            value={precision}
            onChange={(e) => setPrecision(Number(e.target.value))}
            className="bg-white/[0.04] border border-white/[0.08] rounded-md px-1.5 py-0.5 text-gray-200 font-republic-mono text-[10px] focus:outline-none"
          >
            <option value={pair.precision} className="bg-[#0b0e14]">{pair.precision === 2 ? '0.01' : pair.precision === 4 ? '0.0001' : '0.1'}</option>
            <option value={Math.max(0, pair.precision - 1)} className="bg-[#0b0e14]">{pair.precision === 2 ? '0.1' : '1.0'}</option>
            <option value={Math.max(0, pair.precision - 2)} className="bg-[#0b0e14]">{pair.precision === 2 ? '1.0' : '10.0'}</option>
          </select>
        </div>
      </div>

      {/* Table Column Headers */}
      <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] text-gray-400 font-medium border-b border-white/[0.08] bg-white/[0.02]">
        <span className="col-span-5 text-left">Price ({pair.quoteAsset})</span>
        <span className="col-span-3 text-right">Size ({pair.baseAsset})</span>
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
            <span className="col-span-3 text-gray-300 text-right">
              {ask.amount.toFixed(pair.qtyPrecision)}
            </span>
            <span className="col-span-4 text-gray-400 text-right">
              {ask.total.toFixed(pair.qtyPrecision)}
            </span>
          </div>
        ))}
      </div>

      {/* Mid Market Price Bar */}
      <div className="px-3 py-2 bg-white/[0.02] border-y border-white/[0.08] flex items-center justify-between font-republic-mono">
        <div className="flex items-center space-x-2">
          <span
            className={`text-sm font-extrabold flex items-center space-x-1 ${
              priceTickDirection === 'up'
                ? 'text-[#10b981]'
                : priceTickDirection === 'down'
                ? 'text-[#f43f5e]'
                : 'text-white'
            }`}
          >
            <span>{lastPrice.toFixed(pair.precision)}</span>
            {priceTickDirection === 'up' && <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />}
            {priceTickDirection === 'down' && <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />}
          </span>
          <span className="text-[10px] text-gray-400">
            ${lastPrice.toFixed(pair.precision)}
          </span>
        </div>

        {/* Spread Info */}
        <div className="text-[10px] text-gray-400 text-right">
          <span className="text-gray-400">Spread: </span>
          <span className="text-gray-200 font-semibold">{spread.toFixed(precision)}</span>
          <span className="text-gray-400 ml-1">({spreadPercent.toFixed(3)}%)</span>
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
