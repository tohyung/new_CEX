import React from 'react';
import { Wallet, Plus, Shield, TrendingUp, TrendingDown } from 'lucide-react';
import { AssetBalance, Position, TradingPair } from '../types';
import { playSound } from '../utils/sound';

interface WalletBoardProps {
  balances: AssetBalance[];
  pair: TradingPair;
  positions: Position[];
  onOpenDeposit: () => void;
}

const getAssetBadge = (asset: string) => {
  switch (asset) {
    case 'USDT':
      return { symbol: '₮', color: 'bg-emerald-500/20 text-[#22c55e]' };
    case 'BTC':
      return { symbol: '₿', color: 'bg-amber-500/20 text-amber-400' };
    case 'ETH':
      return { symbol: 'Ξ', color: 'bg-blue-500/20 text-blue-400' };
    case 'SOL':
      return { symbol: '◎', color: 'bg-violet-500/20 text-violet-400' };
    case 'SUI':
      return { symbol: '💧', color: 'bg-sky-500/20 text-sky-400' };
    case 'XRP':
      return { symbol: '✕', color: 'bg-cyan-500/20 text-cyan-400' };
    case 'DOGE':
      return { symbol: 'Ð', color: 'bg-yellow-500/20 text-yellow-400' };
    default:
      return { symbol: asset.charAt(0), color: 'bg-white/10 text-white' };
  }
};

export const WalletBoard: React.FC<WalletBoardProps> = ({
  balances,
  pair,
  positions,
  onOpenDeposit
}) => {
  const totalUsdValue = balances.reduce((sum, b) => sum + b.usdValue, 0);
  const totalUnrealizedPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const totalMarginUsed = positions.reduce((sum, p) => sum + p.margin, 0);

  const usdtBal = balances.find(b => b.asset === 'USDT') || { free: 0, locked: 0, total: 0, usdValue: 0 };

  // Sort balances: USDT first, then active pair asset, then others by USD value descending
  const sortedBalances = [...balances].sort((a, b) => {
    if (a.asset === 'USDT') return -1;
    if (b.asset === 'USDT') return 1;
    if (a.asset === pair.baseAsset) return -1;
    if (b.asset === pair.baseAsset) return 1;
    return b.usdValue - a.usdValue;
  });

  return (
    <div className="flex flex-col h-full bg-[#12141a]/70 backdrop-blur-md border border-white/[0.08] rounded-lg shadow-xs overflow-hidden text-xs select-none font-republic">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#151720]/65 border-b border-white/[0.08] select-none shrink-0">
        <div className="flex items-center space-x-1.5 text-white">
          <Wallet className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-[11px] font-bold tracking-wide font-republic-display">
            Assets
          </span>
        </div>

        <button
          id="wallet-board-deposit-btn"
          onClick={() => {
            playSound('click');
            onOpenDeposit();
          }}
          className="flex items-center space-x-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-medium text-[10px] border border-white/10 transition-colors active:scale-95 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Deposit</span>
        </button>
      </div>

      {/* Main Content Area - Expands vertically to fill all space */}
      <div className="flex-1 min-h-0 p-2.5 flex flex-col justify-between space-y-2 overflow-hidden">
        {/* Total Valuation & PnL Card */}
        <div className="bg-black/30 border border-white/[0.06] rounded-md p-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-medium">Net Valuation</span>
            <div className="flex items-center space-x-1 text-[10px] font-republic-mono">
              {totalUnrealizedPnl !== 0 && (
                <span className={`flex items-center space-x-0.5 ${totalUnrealizedPnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {totalUnrealizedPnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toFixed(2)}</span>
                </span>
              )}
            </div>
          </div>
          <div className="text-base font-republic-mono font-bold text-white tracking-tight mt-0.5">
            ${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-[10px] text-gray-400 font-normal ml-1">USD</span>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-2 mt-1.5 pt-1.5 border-t border-white/[0.06] text-[10px] font-republic-mono">
            <div>
              <span className="text-gray-400 text-[9px] block">Free USDT</span>
              <span className="text-gray-200 font-semibold">
                ${usdtBal.free.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-[9px] block">Margin in Use</span>
              <span className="text-gray-200 font-semibold">
                ${totalMarginUsed.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Asset Holdings List - Lengthened to fill all blank space */}
        <div className="flex-1 min-h-0 flex flex-col space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-[9px] px-1 uppercase tracking-wider font-semibold shrink-0">
            <span>Asset</span>
            <div className="flex items-center space-x-4">
              <span>Available</span>
              <span className="w-16 text-right">USD Value</span>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-1 pr-0.5">
            {sortedBalances.map(b => {
              const badge = getAssetBadge(b.asset);
              const isCurrentPair = b.asset === pair.baseAsset;
              return (
                <div
                  key={b.asset}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md border transition-colors ${
                    isCurrentPair
                      ? 'bg-white/[0.08] border-white/20'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <span className={`w-4 h-4 shrink-0 rounded-full text-[9px] font-bold flex items-center justify-center ${badge.color}`}>
                      {badge.symbol}
                    </span>
                    <div className="flex items-center space-x-1 min-w-0">
                      <span className="text-white font-bold text-[11px] truncate">{b.asset}</span>
                      {isCurrentPair && (
                        <span className="text-[8px] bg-white/15 text-gray-200 px-1 py-0.2 rounded font-medium shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-right font-republic-mono text-[10px]">
                    <span className="text-gray-200 font-medium">
                      {b.free.toLocaleString(undefined, {
                        minimumFractionDigits: b.asset === 'USDT' ? 2 : Math.min(b.free < 1 ? 4 : 2, 4),
                        maximumFractionDigits: b.asset === 'USDT' ? 2 : 4
                      })}
                    </span>
                    <span className="w-16 text-gray-400 text-[9px] text-right font-medium">
                      ${b.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Health & Equity Bar */}
        <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[9px] text-gray-400 font-republic shrink-0">
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3 text-[#22c55e]" />
            <span className="text-gray-300">Account Health: Normal</span>
          </div>
          <span className="font-republic-mono text-gray-400">
            Equity: ${(totalUsdValue + totalUnrealizedPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};
