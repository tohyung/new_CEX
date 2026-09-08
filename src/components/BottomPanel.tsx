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
  Wallet
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
  const [activeTab, setActiveTab] = useState<'positions' | 'open_orders' | 'order_history' | 'trade_history' | 'assets'>('positions');

  const openOrders = orders.filter(o => o.status === 'open');
  const pastOrders = orders.filter(o => o.status !== 'open');

  return (
    <div className="flex flex-col h-full bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37),inset_0_1px_0_0_rgba(255,255,255,0.05)] overflow-hidden text-xs select-none font-republic">
      {/* Tabs Header */}
      <div className="h-9 px-3 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02] shrink-0">
        <div className="flex items-center space-x-1">
          {/* Positions Tab */}
          <button
            id="tab-positions"
            onClick={() => {
              playSound('click');
              setActiveTab('positions');
            }}
            className={`px-3 py-1.5 font-bold text-xs flex items-center space-x-1.5 transition-colors border-b-2 font-republic-display ${
              activeTab === 'positions'
                ? 'text-white border-white font-extrabold'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            <span>Positions</span>
            {positions.length > 0 && (
              <span className="bg-white/15 text-white text-[10px] px-1.5 py-0.2 rounded-md font-republic-mono font-medium">
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
            className={`px-3 py-1.5 font-bold text-xs flex items-center space-x-1.5 transition-colors border-b-2 font-republic-display ${
              activeTab === 'open_orders'
                ? 'text-white border-white font-extrabold'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            <span>Open Orders</span>
            {openOrders.length > 0 && (
              <span className="bg-white/15 text-white text-[10px] px-1.5 py-0.2 rounded-md font-republic-mono font-medium">
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
            className={`px-3 py-1.5 font-bold text-xs transition-colors border-b-2 font-republic-display ${
              activeTab === 'order_history'
                ? 'text-white border-white font-extrabold'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            Order History
          </button>

          {/* Assets Tab */}
          <button
            id="tab-assets"
            onClick={() => {
              playSound('click');
              setActiveTab('assets');
            }}
            className={`px-3 py-1.5 font-bold text-xs flex items-center space-x-1.5 transition-colors border-b-2 font-republic-display ${
              activeTab === 'assets'
                ? 'text-white border-white font-extrabold'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-white" />
            <span>Assets</span>
          </button>
        </div>

        {/* Tab Right Actions */}
        {activeTab === 'open_orders' && openOrders.length > 0 && (
          <button
            id="cancel-all-orders-btn"
            onClick={() => {
              playSound('cancel');
              onCancelAllOrders();
            }}
            className="text-[11px] text-gray-400 hover:text-[#f43f5e] flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#181d28] border border-[#1e2330] transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Cancel All ({openOrders.length})</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
        {/* 1. POSITIONS VIEW */}
        {activeTab === 'positions' && (
          <div className="min-w-[720px]">
            {positions.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center space-y-2 font-republic">
                <ShieldCheck className="w-8 h-8 text-gray-600 stroke-[1.5]" />
                <p>No active positions. Open a long or short position in Perpetual mode.</p>
              </div>
            ) : (
              <table className="w-full text-left font-republic-mono text-[11px]">
                <thead className="text-[10px] text-gray-400 bg-[#0c1018] border-b border-white/[0.08] font-republic sticky top-0 z-10">
                  <tr>
                    <th className="py-2 px-2.5">Contract / Mode</th>
                    <th className="py-2 px-2.5">Size</th>
                    <th className="py-2 px-2.5">Entry Price</th>
                    <th className="py-2 px-2.5">Mark Price</th>
                    <th className="py-2 px-2.5">Liq. Price</th>
                    <th className="py-2 px-2.5">Margin</th>
                    <th className="py-2 px-2.5">Unrealized PnL (ROI%)</th>
                    <th className="py-2 px-2.5">TP / SL</th>
                    <th className="py-2 px-2.5 text-right">Close Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {positions.map(pos => {
                    const isLong = pos.side === 'long';
                    const isProfit = pos.unrealizedPnl >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-white/[0.04] transition-colors">
                        {/* Contract */}
                        <td className="py-2 px-2.5">
                          <div className="flex items-center space-x-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              isLong ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#f43f5e]/15 text-[#f43f5e]'
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
                        <td className="py-2 px-2.5 text-white font-semibold">
                          {pos.size} {pos.pair.split('/')[0]}
                        </td>

                        {/* Entry Price */}
                        <td className="py-2 px-2.5 text-gray-300">
                          ${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Mark Price */}
                        <td className="py-2 px-2.5 text-gray-300">
                          ${pos.markPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Liq Price */}
                        <td className="py-2 px-2.5 text-rose-400 font-semibold">
                          ${pos.liqPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Margin */}
                        <td className="py-2 px-2.5 text-gray-300">
                          ${pos.margin.toFixed(2)} USDT
                        </td>

                        {/* Unrealized PnL */}
                        <td className="py-2 px-2.5">
                          <div className="flex flex-col">
                            <span className={`font-bold ${isProfit ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                              {isProfit ? '+' : ''}${pos.unrealizedPnl.toFixed(2)} USDT
                            </span>
                            <span className={`text-[9px] ${isProfit ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                              ({isProfit ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                            </span>
                          </div>
                        </td>

                        {/* TP / SL */}
                        <td className="py-2 px-2.5 text-[9px] text-gray-400">
                          <div>TP: {pos.takeProfit ? `$${pos.takeProfit}` : '--'}</div>
                          <div>SL: {pos.stopLoss ? `$${pos.stopLoss}` : '--'}</div>
                        </td>

                        {/* Close Action */}
                        <td className="py-2 px-2.5 text-right">
                          <button
                            id={`close-pos-${pos.id}`}
                            onClick={() => {
                              playSound('order_fill');
                              onClosePosition(pos.id);
                            }}
                            className="px-2 py-0.5 rounded bg-[#181d28] hover:bg-[#f43f5e] text-gray-200 hover:text-white font-bold transition-all text-[9px]"
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
          <div className="min-w-[800px]">
            {openOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center space-y-2 font-republic">
                <Clock className="w-8 h-8 text-gray-600 stroke-[1.5]" />
                <p>No open orders. Place a Limit or Stop-Limit order above.</p>
              </div>
            ) : (
              <table className="w-full text-left font-republic-mono text-[11px]">
                <thead className="text-[10px] text-gray-400 bg-white/[0.02] border-b border-white/[0.08] font-republic">
                  <tr>
                    <th className="py-2.5 px-3">Date / Time</th>
                    <th className="py-2.5 px-3">Pair</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Side</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Filled</th>
                    <th className="py-2.5 px-3">Trigger Conditions</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {openOrders.map(order => {
                    const isBuy = order.side === 'buy';
                    const time = new Date(order.timestamp).toLocaleString();
                    return (
                      <tr key={order.id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="py-2.5 px-3 text-gray-400 text-[10px]">{time}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{order.pair}</td>
                        <td className="py-2.5 px-3 uppercase text-gray-300 text-[10px]">{order.type}</td>
                        <td className="py-2.5 px-3">
                          <span className={`font-bold uppercase ${isBuy ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                            {order.side}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-white font-semibold">
                          ${order.price.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-gray-300">
                          {order.amount} {order.pair.split('/')[0]}
                        </td>
                        <td className="py-2.5 px-3 text-gray-400">
                          0%
                        </td>
                        <td className="py-2.5 px-3 text-gray-400 text-[10px]">
                          {order.stopPrice ? `Stop: $${order.stopPrice}` : '--'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            id={`cancel-order-${order.id}`}
                            onClick={() => {
                              playSound('cancel');
                              onCancelOrder(order.id);
                            }}
                            className="p-1 text-gray-400 hover:text-[#f43f5e] rounded-md hover:bg-white/[0.08] transition-colors"
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
          <div className="min-w-[800px]">
            {pastOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-republic">No past orders in this session.</div>
            ) : (
              <table className="w-full text-left font-republic-mono text-[11px]">
                <thead className="text-[10px] text-gray-400 bg-white/[0.02] border-b border-white/[0.08] font-republic">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Pair</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Side</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {pastOrders.map(order => (
                    <tr key={order.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-2.5 px-3 text-gray-400 text-[10px]">
                        {new Date(order.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">{order.pair}</td>
                      <td className="py-2.5 px-3 uppercase text-gray-300 text-[10px]">{order.type}</td>
                      <td className={`py-2.5 px-3 font-bold uppercase ${order.side === 'buy' ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                        {order.side}
                      </td>
                      <td className="py-2.5 px-3">${order.price.toLocaleString()}</td>
                      <td className="py-2.5 px-3">{order.amount}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
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

        {/* 4. ASSETS / BALANCES VIEW */}
        {activeTab === 'assets' && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3 bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.08]">
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Spot & Margin Wallet Overview</div>
                <div className="text-xl font-republic-mono font-bold text-white mt-1">
                  ${balances.reduce((sum, b) => sum + b.usdValue, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                </div>
              </div>
              <button
                id="wallet-deposit-cta"
                onClick={onOpenDeposit}
                className="bg-white hover:bg-gray-200 text-black font-extrabold px-3.5 py-2 rounded-xl text-xs transition-colors flex items-center space-x-1.5 font-republic-display"
              >
                <span>Deposit Demo Funds</span>
              </button>
            </div>

            <table className="w-full text-left font-republic-mono text-[11px]">
              <thead className="text-[10px] text-gray-400 bg-white/[0.02] border-b border-white/[0.08] font-republic">
                <tr>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Total Balance</th>
                  <th className="py-2.5 px-3">Available Free</th>
                  <th className="py-2.5 px-3">In Orders / Margin</th>
                  <th className="py-2.5 px-3 text-right">Est. USD Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {balances.map(b => (
                  <tr key={b.asset} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-[10px]">
                          {b.asset.slice(0, 1)}
                        </span>
                        <span className="font-bold text-white">{b.asset}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {b.total.toLocaleString(undefined, { minimumFractionDigits: b.asset === 'USDT' ? 2 : 4 })}
                    </td>
                    <td className="py-2.5 px-3 text-[#10b981]">
                      {b.free.toLocaleString(undefined, { minimumFractionDigits: b.asset === 'USDT' ? 2 : 4 })}
                    </td>
                    <td className="py-2.5 px-3 text-gray-400">
                      {b.locked.toLocaleString(undefined, { minimumFractionDigits: b.asset === 'USDT' ? 2 : 4 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-200">
                      ${b.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
