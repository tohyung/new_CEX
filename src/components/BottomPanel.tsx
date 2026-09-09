import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Wallet,
  Search,
  Maximize2,
  FileText
} from 'lucide-react';
import { Order, Position, AssetBalance, TradingPair } from '../types';
import { playSound } from '../utils/sound';

interface BottomPanelProps {
  orders: Order[];
  positions: Position[];
  balances: AssetBalance[];
  pairs: TradingPair[];
  onCancelOrder: (orderId: string) => void;
  onCancelAllOrders: () => void;
  onClosePosition: (positionId: string) => void;
  onOpenDeposit: () => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  orders,
  positions,
  balances,
  pairs,
  onCancelOrder,
  onCancelAllOrders,
  onClosePosition,
  onOpenDeposit
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'open_orders' | 'order_history'>('positions');

  const openOrders = orders.filter(o => o.status === 'open');
  const pastOrders = orders.filter(o => o.status !== 'open');

  return (
    <div className="flex flex-col h-full bg-[#12141a]/70 backdrop-blur-md border border-white/[0.08] rounded-lg shadow-xs overflow-hidden text-xs select-none font-republic">
      {/* Tabs Header */}
      <div className="h-7 px-2 border-b border-white/[0.08] flex items-center justify-between bg-[#151720]/65 shrink-0">
        <div className="flex items-center space-x-1">
          {/* Positions Tab */}
          <button
            id="tab-positions"
            onClick={() => {
              playSound('click');
              setActiveTab('positions');
            }}
            className={`px-2.5 py-1 font-bold text-xs flex items-center space-x-1.5 transition-colors border-b-2 font-republic-display cursor-pointer ${
              activeTab === 'positions'
                ? 'text-white border-white font-extrabold'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            <span>Positions</span>
            {positions.length > 0 && (
              <span className="bg-white/15 text-white text-[10px] px-1.5 py-0.2 rounded font-republic-mono font-medium">
                {positions.length}
              </span>
            )}
          </button>

          {/* Open Orders Tab */}
          <button
            id="tab-open-orders"
            onClick={() => {
              playSound('click');
              setActiveTab('open_orders');
            }}
            className={`px-2.5 py-1 font-bold text-xs flex items-center space-x-1.5 transition-colors border-b-2 font-republic-display cursor-pointer ${
              activeTab === 'open_orders'
                ? 'text-white border-white font-extrabold'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            <span>Open Orders</span>
            {openOrders.length > 0 && (
              <span className="bg-white/15 text-white text-[10px] px-1.5 py-0.2 rounded font-republic-mono font-medium">
                {openOrders.length}
              </span>
            )}
          </button>

          {/* Order History */}
          <button
            id="tab-order-history"
            onClick={() => {
              playSound('click');
              setActiveTab('order_history');
            }}
            className={`px-2.5 py-1 font-bold text-xs transition-colors border-b-2 font-republic-display cursor-pointer ${
              activeTab === 'order_history'
                ? 'text-white border-white font-extrabold'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            Order History
          </button>
        </div>

        {/* Tab Right Actions & Terminal Window Controls */}
        <div className="flex items-center space-x-2">
          {activeTab === 'open_orders' && openOrders.length > 0 && (
            <button
              id="cancel-all-orders-btn"
              onClick={() => {
                playSound('cancel');
                onCancelAllOrders();
              }}
              className="text-[10px] text-gray-400 hover:text-[#ef4444] flex items-center space-x-1 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Cancel All ({openOrders.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
        {/* 1. POSITIONS VIEW */}
        {activeTab === 'positions' && (
          <div className="min-w-[660px]">
            {positions.length === 0 ? (
              <div className="py-8 px-4 text-center text-gray-500 flex flex-col items-center justify-center space-y-1.5 font-republic">
                <ShieldCheck className="w-6 h-6 text-gray-600 stroke-[1.5]" />
                <p className="text-[11px]">No active positions. Open a long or short position in Perpetual mode.</p>
              </div>
            ) : (
              <table className="w-full text-left font-republic-mono text-[11px]">
                <thead className="text-[10px] text-gray-400 bg-[#151720]/80 backdrop-blur-md border-b border-white/[0.08] font-republic sticky top-0 z-10">
                  <tr>
                    <th className="py-1 px-2.5">Contract / Mode</th>
                    <th className="py-1 px-2.5">Size</th>
                    <th className="py-1 px-2.5">Entry Price</th>
                    <th className="py-1 px-2.5">Mark Price</th>
                    <th className="py-1 px-2.5">Liq. Price</th>
                    <th className="py-1 px-2.5">Margin</th>
                    <th className="py-1 px-2.5">Unrealized PnL (ROI%)</th>
                    <th className="py-1 px-2.5">TP / SL</th>
                    <th className="py-1 px-2.5 text-right">Close Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {positions.map(pos => {
                    const isLong = pos.side === 'long';
                    const isProfit = pos.unrealizedPnl >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-white/[0.04] transition-colors">
                        {/* Contract */}
                        <td className="py-1 px-2.5">
                          <div className="flex items-center space-x-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              isLong ? 'bg-emerald-500/15 text-[#22c55e]' : 'bg-red-500/15 text-[#ef4444]'
                            }`}>
                              {isLong ? 'LONG' : 'SHORT'} {pos.leverage}x
                            </span>
                            <span className="font-bold text-white text-[11px]">{pos.pair}</span>
                            <span className="text-[8px] uppercase text-gray-400 bg-white/[0.04] border border-white/[0.08] px-1 py-0.2 rounded">
                              {pos.marginType}
                            </span>
                          </div>
                        </td>

                        {/* Size */}
                        <td className="py-1 px-2.5 text-white font-semibold">
                          {pos.size} {pos.pair.split('/')[0]}
                        </td>

                        {/* Entry Price */}
                        <td className="py-1 px-2.5 text-gray-300">
                          ${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Mark Price */}
                        <td className="py-1 px-2.5 text-gray-300">
                          ${pos.markPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Liq Price */}
                        <td className="py-1 px-2.5 text-[#ef4444] font-semibold">
                          ${pos.liqPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Margin */}
                        <td className="py-1 px-2.5 text-gray-300">
                          ${pos.margin.toFixed(2)} USDT
                        </td>

                        {/* Unrealized PnL */}
                        <td className="py-1 px-2.5">
                          <div className="flex flex-col">
                            <span className={`font-bold ${isProfit ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                              {isProfit ? '+' : ''}${pos.unrealizedPnl.toFixed(2)} USDT
                            </span>
                            <span className={`text-[9px] ${isProfit ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                              ({isProfit ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                            </span>
                          </div>
                        </td>

                        {/* TP / SL */}
                        <td className="py-1 px-2.5 text-[9px] text-gray-400">
                          <div>TP: {pos.takeProfit ? `$${pos.takeProfit}` : '--'}</div>
                          <div>SL: {pos.stopLoss ? `$${pos.stopLoss}` : '--'}</div>
                        </td>

                        {/* Close Action */}
                        <td className="py-1 px-2.5 text-right">
                          <button
                            id={`close-pos-${pos.id}`}
                            onClick={() => {
                              playSound('order_fill');
                              onClosePosition(pos.id);
                            }}
                            className="px-2 py-0.5 rounded bg-[#181a24] hover:bg-[#ef4444] text-gray-200 hover:text-white font-bold transition-all text-[9px] cursor-pointer"
                          >
                            Market Close
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 2. OPEN ORDERS VIEW */}
        {activeTab === 'open_orders' && (
          <div className="min-w-[660px]">
            {openOrders.length === 0 ? (
              <div className="py-8 px-4 text-center text-gray-500 flex flex-col items-center justify-center space-y-1.5 font-republic">
                <Clock className="w-6 h-6 text-gray-600 stroke-[1.5]" />
                <p className="text-[11px]">No open orders. Place a Limit or Stop-Limit order above.</p>
              </div>
            ) : (
              <table className="w-full text-left font-republic-mono text-[11px]">
                <thead className="text-[10px] text-gray-400 bg-[#151720]/80 backdrop-blur-md border-b border-white/[0.08] font-republic sticky top-0 z-10">
                  <tr>
                    <th className="py-1 px-2.5">Date / Time</th>
                    <th className="py-1 px-2.5">Pair</th>
                    <th className="py-1 px-2.5">Type</th>
                    <th className="py-1 px-2.5">Side</th>
                    <th className="py-1 px-2.5">Price</th>
                    <th className="py-1 px-2.5">Amount</th>
                    <th className="py-1 px-2.5">Filled</th>
                    <th className="py-1 px-2.5">Trigger Conditions</th>
                    <th className="py-1 px-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {openOrders.map(order => {
                    const isBuy = order.side === 'buy';
                    const time = new Date(order.timestamp).toLocaleString();
                    return (
                      <tr key={order.id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="py-1 px-2.5 text-gray-400 text-[10px]">{time}</td>
                        <td className="py-1 px-2.5 font-bold text-white">{order.pair}</td>
                        <td className="py-1 px-2.5 uppercase text-gray-300 text-[10px]">{order.type}</td>
                        <td className="py-1 px-2.5">
                          <span className={`font-bold uppercase ${isBuy ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                            {order.side}
                          </span>
                        </td>
                        <td className="py-1 px-2.5 text-white font-semibold">
                          ${order.price.toLocaleString()}
                        </td>
                        <td className="py-1 px-2.5 text-gray-300">
                          {order.amount} {order.pair.split('/')[0]}
                        </td>
                        <td className="py-1 px-2.5 text-gray-400">
                          0%
                        </td>
                        <td className="py-1 px-2.5 text-gray-400 text-[10px]">
                          {order.stopPrice ? `Stop: $${order.stopPrice}` : '--'}
                        </td>
                        <td className="py-1 px-2.5 text-right">
                          <button
                            id={`cancel-order-${order.id}`}
                            onClick={() => {
                              playSound('cancel');
                              onCancelOrder(order.id);
                            }}
                            className="p-1 text-gray-400 hover:text-[#f43f5e] rounded hover:bg-white/[0.08] transition-colors cursor-pointer"
                            title="Cancel Order"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 3. ORDER HISTORY VIEW */}
        {activeTab === 'order_history' && (
          <div className="min-w-[560px]">
            {pastOrders.length === 0 ? (
              <div className="py-8 px-4 text-center text-gray-500 font-republic text-[11px] flex flex-col items-center justify-center space-y-1.5">
                <FileText className="w-6 h-6 text-gray-600 stroke-[1.5]" />
                <p>No past orders in this session.</p>
              </div>
            ) : (
              <table className="w-full text-left font-republic-mono text-[11px]">
                <thead className="text-[10px] text-gray-400 bg-[#151720]/80 backdrop-blur-md border-b border-white/[0.08] font-republic sticky top-0 z-10">
                  <tr>
                    <th className="py-1 px-2.5">Time</th>
                    <th className="py-1 px-2.5">Pair</th>
                    <th className="py-1 px-2.5">Type</th>
                    <th className="py-1 px-2.5">Side</th>
                    <th className="py-1 px-2.5">Price</th>
                    <th className="py-1 px-2.5">Amount</th>
                    <th className="py-1 px-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {pastOrders.map(order => (
                    <tr key={order.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-1 px-2.5 text-gray-400 text-[10px]">
                        {new Date(order.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-1 px-2.5 font-bold text-white">{order.pair}</td>
                      <td className="py-1 px-2.5 uppercase text-gray-300 text-[10px]">{order.type}</td>
                      <td className={`py-1 px-2.5 font-bold uppercase ${order.side === 'buy' ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                        {order.side}
                      </td>
                      <td className="py-1 px-2.5">${order.price.toLocaleString()}</td>
                      <td className="py-1 px-2.5">{order.amount}</td>
                      <td className="py-1 px-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          order.status === 'filled'
                            ? 'bg-[#10b981]/15 text-[#10b981]'
                            : 'bg-gray-500/15 text-gray-400'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
