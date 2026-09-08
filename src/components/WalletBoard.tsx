import React from 'react';
import { Wallet, Plus, Shield, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import { AssetBalance, Position, TradingPair } from '../types';
import { playSound } from '../utils/sound';

interface WalletBoardProps {
  balances: AssetBalance[];
  pair: TradingPair;
  positions: Position[];
  onOpenDeposit: () => void;
}

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
  const baseBal = balances.find(b => b.asset === pair.baseAsset) || { free: 0, locked: 0, total: 0, usdValue: 0 };

  return (
    <div className="flex flex-col h-full bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37),inset_0_1px_0_0_rgba(255,255,255,0.05)] overflow-hidden text-xs select-none font-republic">
      {/* Header Bar */}
      <div className="h-9 px-3 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02] shrink-0">
        <div className="flex items-center space-x-2">
          <Wallet className="w-3.5 h-3.5 text-white/70" />
          <h3 className="font-republic-display font-bold text-white text-xs tracking-tight">
            Wallet Overview
          </h3>
        </div>

        <button
          id="wallet-board-deposit-btn"
          onClick={() => {
            playSound('click');
            onOpenDeposit();
          }}
          className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-[10px] border border-white/10 transition-colors active:scale-95"
        >
          <Plus className="w-3 h-3" />
          <span>Deposit</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-2.5 flex flex-col justify-between overflow-y-auto min-h-0 space-y-2">
        {/* Total Valuation & PnL */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-medium">Net Valuation</span>
            <div className="flex items-center space-x-1 text-[10px] font-republic-mono">
              {totalUnrealizedPnl !== 0 && (
                <span className={`flex items-center space-x-0.5 ${totalUnrealizedPnl >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
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
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/[0.05] text-[10px] font-republic-mono">
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

        {/* Current Pair Balance Snapshot */}
        <div className="space-y-1 text-[10px] font-republic-mono">
          <div className="flex items-center justify-between text-gray-400 text-[9px] px-1 uppercase tracking-wider">
            <span>Asset</span>
            <span>Available</span>
            <span>USD Value</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] p-1.5 rounded-lg border border-white/[0.04] transition-colors">
              <div className="flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold flex items-center justify-center">
                  ₮
                </span>
                <span className="text-white font-semibold">USDT</span>
              </div>
              <span className="text-gray-200">
                {usdtBal.free.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-gray-400 text-[9px]">
                ${usdtBal.usdValue.toFixed(2)}
              </span>
            </div>

            {pair.baseAsset !== 'USDT' && (
              <div className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] p-1.5 rounded-lg border border-white/[0.04] transition-colors">
                <div className="flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-bold flex items-center justify-center">
                    {pair.baseAsset.charAt(0)}
                  </span>
                  <span className="text-white font-semibold">{pair.baseAsset}</span>
                </div>
                <span className="text-gray-200">
                  {baseBal.free.toLocaleString(undefined, { minimumFractionDigits: pair.qtyPrecision, maximumFractionDigits: pair.qtyPrecision })}
                </span>
                <span className="text-gray-400 text-[9px]">
                  ${baseBal.usdValue.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
