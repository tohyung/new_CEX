import React, { useState, useEffect, useRef } from 'react';
import { 
  Percent, 
  ShieldAlert, 
  HelpCircle, 
  Sliders, 
  ChevronRight,
  ArrowRight,
  Settings,
  SlidersHorizontal,
  Check,
  Search,
  Maximize2,
  X
} from 'lucide-react';
import { TradingPair, TradingMode, OrderSide, OrderType, MarginType, AssetBalance } from '../types';
import { playSound } from '../utils/sound';

interface OrderEntryProps {
  pair: TradingPair;
  mode: TradingMode;
  onModeChange?: (mode: TradingMode) => void;
  currentPrice: number;
  selectedPriceFromBook: number | null;
  selectedAmountFromBook: number | null;
  usdtBalance: AssetBalance;
  baseAssetBalance: AssetBalance;
  onSubmitOrder: (order: {
    side: OrderSide;
    type: OrderType;
    price: number;
    stopPrice?: number;
    amount: number;
    leverage?: number;
    marginType?: MarginType;
    takeProfit?: number;
    stopLoss?: number;
  }) => void;
  onOpenDeposit: () => void;
}

export const OrderEntry: React.FC<OrderEntryProps> = ({
  pair,
  mode,
  onModeChange,
  currentPrice,
  selectedPriceFromBook,
  selectedAmountFromBook,
  usdtBalance,
  baseAssetBalance,
  onSubmitOrder,
  onOpenDeposit
}) => {
  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [priceInput, setPriceInput] = useState<string>(currentPrice.toString());
  const [stopPriceInput, setStopPriceInput] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [sliderPercent, setSliderPercent] = useState<number>(0);
  const [validationHint, setValidationHint] = useState<string | null>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Perps / Futures settings
  const [leverage, setLeverage] = useState<number>(10);
  const [marginType, setMarginType] = useState<MarginType>('cross');
  const [showLeverageModal, setShowLeverageModal] = useState(false);

  // TP / SL optional settings
  const [enableTpSl, setEnableTpSl] = useState(false);
  const [takeProfitInput, setTakeProfitInput] = useState<string>('');
  const [stopLossInput, setStopLossInput] = useState<string>('');

  // Sync price when pair changes
  useEffect(() => {
    setPriceInput(currentPrice.toFixed(pair.precision));
    setAmountInput('');
    setSliderPercent(0);
    setValidationHint(null);
  }, [pair.symbol]);

  // Update price when clicked from order book
  useEffect(() => {
    if (selectedPriceFromBook !== null && selectedPriceFromBook > 0) {
      setPriceInput(selectedPriceFromBook.toFixed(pair.precision));
      setValidationHint(null);
    }
  }, [selectedPriceFromBook, pair.precision]);

  // Update amount when clicked from order book
  useEffect(() => {
    if (selectedAmountFromBook !== null && selectedAmountFromBook > 0) {
      setAmountInput(selectedAmountFromBook.toFixed(pair.qtyPrecision));
      setValidationHint(null);
    }
  }, [selectedAmountFromBook, pair.qtyPrecision]);

  // Available balance based on side and mode
  const effectivePrice = orderType === 'market' ? currentPrice : Number(priceInput) || currentPrice;
  const availableUsdt = usdtBalance?.free || 0;
  const availableBase = baseAssetBalance?.free || 0;

  // Calculate maximum buyable and sellable amount
  const maxBuyBase = mode === 'perps' 
    ? (availableUsdt * leverage) / (effectivePrice || 1)
    : availableUsdt / (effectivePrice || 1);

  const maxSellBase = mode === 'perps'
    ? (availableUsdt * leverage) / (effectivePrice || 1)
    : availableBase;

  // Percentage buttons handler with floor rounding to avoid 'insufficient funds' precision errors
  const handlePercentage = (pct: number) => {
    playSound('click');
    setSliderPercent(pct);
    setValidationHint(null);
    const max = side === 'buy' ? maxBuyBase : maxSellBase;
    const calc = (max * (pct / 100));
    const factor = Math.pow(10, pair.qtyPrecision);
    const truncated = Math.floor(calc * factor) / factor;
    setAmountInput(truncated.toFixed(pair.qtyPrecision));
  };

  const parsedAmount = Number(amountInput) || 0;
  const parsedPrice = orderType === 'market' ? currentPrice : Number(priceInput) || 0;
  const totalValueUsd = parsedAmount * parsedPrice;
  const requiredMargin = mode === 'perps' ? totalValueUsd / leverage : totalValueUsd;
  const estFee = totalValueUsd * (orderType === 'market' ? 0.0004 : 0.0002); // 0.04% vs 0.02%

  // Estimated Liquidation Price for Perps
  const estLiqPrice = mode === 'perps' && parsedPrice > 0 && parsedAmount > 0
    ? side === 'buy'
      ? parsedPrice * (1 - (1 / leverage) * 0.9)
      : parsedPrice * (1 + (1 / leverage) * 0.9)
    : null;

  // Submission handler with direct validation and interactive guidance
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      setValidationHint(`Please enter an amount of ${pair.baseAsset} to ${side === 'buy' ? 'buy' : 'sell'}`);
      amountInputRef.current?.focus();
      return;
    }
    if (orderType !== 'market' && parsedPrice <= 0) {
      setValidationHint('Please specify a valid limit price');
      return;
    }

    const max = side === 'buy' ? maxBuyBase : maxSellBase;
    if (parsedAmount > max * 1.0001) {
      setValidationHint(`Amount exceeds your available ${side === 'buy' ? 'USDT' : pair.baseAsset} balance`);
      return;
    }

    setValidationHint(null);
    onSubmitOrder({
      side,
      type: orderType,
      price: parsedPrice,
      stopPrice: orderType === 'stop_limit' ? Number(stopPriceInput) : undefined,
      amount: parsedAmount,
      leverage: mode === 'perps' ? leverage : undefined,
      marginType: mode === 'perps' ? marginType : undefined,
      takeProfit: enableTpSl && takeProfitInput ? Number(takeProfitInput) : undefined,
      stopLoss: enableTpSl && stopLossInput ? Number(stopLossInput) : undefined,
    });

    // Reset amount
    setAmountInput('');
    setSliderPercent(0);
  };

  const leverageSteps = [1, 2, 5, 10, 20, 50, 75, 100].filter(l => l <= pair.maxLeverage);

  return (
    <div className="h-full flex flex-col bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37),inset_0_1px_0_0_rgba(255,255,255,0.05)] overflow-hidden text-xs select-none font-republic">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/[0.08] select-none">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Order Entry
          </span>
          <div className="flex items-center bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.08]">
            <button
              id="order-mode-spot-btn"
              type="button"
              onClick={() => {
                playSound('click');
                onModeChange?.('spot');
              }}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-republic-display font-bold transition-all ${
                mode === 'spot'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Spot
            </button>
            <button
              id="order-mode-futures-btn"
              type="button"
              onClick={() => {
                playSound('click');
                onModeChange?.('perps');
              }}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-republic-display font-bold transition-all flex items-center space-x-1 ${
                mode === 'perps'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Futures</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-gray-500">
          {mode === 'perps' && (
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setShowLeverageModal(true);
              }}
              className="flex items-center space-x-1 text-[10px] font-republic-mono text-gray-300 bg-white/[0.04] hover:bg-white/[0.08] px-1.5 py-0.5 rounded border border-white/[0.08] transition-colors mr-1"
            >
              <span className="capitalize text-gray-400">{marginType}</span>
              <span className="text-emerald-400 font-bold">{leverage}x</span>
            </button>
          )}
          <button onClick={() => setShowLeverageModal(true)} className="p-1 hover:text-gray-300 rounded transition-colors" title="Settings">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:text-gray-300 rounded transition-colors" title="Maximize">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:text-gray-300 rounded transition-colors" title="Close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Margin & Leverage Configuration Modal */}
      {showLeverageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#0b0e14] border border-white/[0.12] rounded-2xl p-5 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white font-republic-display">Margin & Leverage</h3>
                <p className="text-[11px] text-gray-400">{pair.symbol} Futures Contract</p>
              </div>
              <button
                onClick={() => setShowLeverageModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Margin Mode Selection (Cross vs Isolated) */}
            <div className="mb-4">
              <label className="text-[11px] text-gray-400 font-medium block mb-1.5">Margin Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setMarginType('cross');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    marginType === 'cross'
                      ? 'bg-white/10 border-white text-white'
                      : 'bg-white/[0.02] border-white/[0.08] text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>Cross</span>
                    {marginType === 'cross' && <Check className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Shared balance, lower liq risk</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setMarginType('isolated');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    marginType === 'isolated'
                      ? 'bg-white/10 border-white text-white'
                      : 'bg-white/[0.02] border-white/[0.08] text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>Isolated</span>
                    {marginType === 'isolated' && <Check className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Risk capped to allocated margin</p>
                </button>
              </div>
            </div>

            {/* Leverage Big Readout */}
            <div className="text-center my-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-3xl font-black font-republic-mono text-white">{leverage}x</span>
              <p className="text-[10px] text-gray-400 mt-1">
                Max Position: <span className="text-white font-mono font-bold">${((usdtBalance?.free || 0) * leverage).toLocaleString(undefined, { maximumFractionDigits: 0 })} USDT</span>
              </p>
            </div>

            {/* Steps grid */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {leverageSteps.map(step => (
                <button
                  key={step}
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setLeverage(step);
                  }}
                  className={`py-2 rounded-xl font-republic-mono font-bold text-xs border transition-all ${
                    leverage === step
                      ? 'bg-white text-black border-white shadow-md'
                      : 'bg-white/[0.04] text-gray-300 border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  {step}x
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                playSound('click');
                if (mode !== 'perps') {
                  onModeChange?.('perps');
                }
                setShowLeverageModal(false);
              }}
              className="w-full py-2.5 bg-white hover:bg-gray-200 text-black font-extrabold rounded-xl transition-colors font-republic-display text-xs shadow-xs"
            >
              Confirm {marginType.toUpperCase()} {leverage}x
            </button>
          </div>
        </div>
      )}

      {/* Buy / Sell Tabs */}
      <div className="grid grid-cols-2 p-1.5 bg-white/[0.02] border-b border-white/[0.08] gap-1.5">
        <button
          id="order-side-buy-btn"
          type="button"
          onClick={() => {
            playSound('click');
            setSide('buy');
            setValidationHint(null);
          }}
          className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
            side === 'buy'
              ? 'bg-[#10b981] text-black font-extrabold shadow-sm'
              : 'text-gray-400 hover:text-white bg-[#161c28]'
          }`}
        >
          {mode === 'perps' ? 'Long' : 'Buy'}
        </button>

        <button
          id="order-side-sell-btn"
          type="button"
          onClick={() => {
            playSound('click');
            setSide('sell');
            setValidationHint(null);
          }}
          className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
            side === 'sell'
              ? 'bg-[#f43f5e] text-white font-extrabold shadow-sm'
              : 'text-gray-400 hover:text-white bg-[#161c28]'
          }`}
        >
          {mode === 'perps' ? 'Short' : 'Sell'}
        </button>
      </div>

      {/* Order Type Tabs */}
      <div className="flex items-center space-x-3 px-3 pt-2.5 text-[11px]">
        {(['limit', 'market', 'stop_limit'] as OrderType[]).map(t => (
          <button
            key={t}
            id={`order-type-${t}-btn`}
            onClick={() => {
              playSound('click');
              setOrderType(t);
            }}
            className={`pb-1 font-semibold capitalize transition-colors border-b-2 ${
              orderType === t
                ? 'text-white border-white'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            {t.replace('_', '-')}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col justify-between overflow-y-auto custom-scrollbar p-2.5 space-y-2">
        <div className="space-y-2">
          {/* Available balance indicator */}
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Available:</span>
            <div className="flex items-center space-x-1 font-republic-mono">
              <span className="text-gray-200 font-semibold">
                {side === 'buy' || mode === 'perps'
                  ? `${availableUsdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
                  : `${availableBase.toLocaleString(undefined, { minimumFractionDigits: pair.qtyPrecision })} ${pair.baseAsset}`}
              </span>
              <button
                type="button"
                onClick={onOpenDeposit}
                className="text-white hover:text-gray-300 font-bold ml-1 text-xs bg-white/10 w-4 h-4 rounded-full flex items-center justify-center"
                title="Deposit / Add Demo Funds"
              >
                +
              </button>
            </div>
          </div>

          {/* Stop Price Input (Only for Stop-Limit) */}
          {orderType === 'stop_limit' && (
            <div>
              <div className="text-[10px] text-gray-400 mb-1 font-medium">Stop Price</div>
              <div className="flex items-center bg-[#161c28] border border-[#1e2330] rounded-lg px-2.5 py-1.5 focus-within:border-white transition-colors">
                <input
                  id="order-stop-price-input"
                  type="number"
                  step="any"
                  value={stopPriceInput}
                  onChange={(e) => setStopPriceInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent font-republic-mono text-white text-xs focus:outline-none"
                  required
                />
                <span className="text-[10px] text-gray-400 font-republic-mono ml-2">USDT</span>
              </div>
            </div>
          )}

          {/* Price Input (Limit or Stop-Limit) */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1 font-medium">
              <span>Price</span>
              {orderType !== 'market' && (
                <div className="flex items-center space-x-1 text-[9px]">
                  <button
                    type="button"
                    onClick={() => setPriceInput(currentPrice.toFixed(pair.precision))}
                    className="text-white hover:underline font-republic-mono"
                  >
                    Last
                  </button>
                </div>
              )}
            </div>

            <div className={`flex items-center bg-[#161c28] border border-[#1e2330] rounded-lg px-2.5 py-1.5 transition-colors ${
              orderType === 'market' ? 'opacity-50 bg-[#0e121a]' : 'focus-within:border-white'
            }`}>
              <input
                id="order-price-input"
                type="number"
                step="any"
                disabled={orderType === 'market'}
                value={orderType === 'market' ? currentPrice : priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent font-republic-mono text-white text-xs focus:outline-none disabled:cursor-not-allowed"
                required={orderType !== 'market'}
              />
              <span className="text-[10px] text-gray-400 font-republic-mono ml-2">
                {orderType === 'market' ? 'Market' : 'USDT'}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1 font-medium">
              <span>Amount</span>
              <span className="text-[10px] text-gray-400 font-republic-mono">
                Max: {(side === 'buy' || mode === 'perps' ? maxBuyBase : maxSellBase).toFixed(pair.qtyPrecision)} {pair.baseAsset}
              </span>
            </div>

            <div className="flex items-center bg-[#161c28] border border-[#1e2330] rounded-lg px-2.5 py-1.5 focus-within:border-white transition-colors">
              <input
                ref={amountInputRef}
                id="order-amount-input"
                type="number"
                step="any"
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  setSliderPercent(0);
                  setValidationHint(null);
                }}
                placeholder="0.00"
                className="w-full bg-transparent font-republic-mono text-white text-xs focus:outline-none"
              />
              <span className="text-[10px] text-gray-300 font-republic-mono ml-2 font-bold">
                {pair.baseAsset}
              </span>
            </div>
          </div>

          {/* Percentage quick chips */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentage(pct)}
                className={`py-1 rounded-md text-[10px] font-republic-mono font-semibold transition-all ${
                  sliderPercent === pct
                    ? 'bg-white text-black font-extrabold shadow-xs'
                    : 'bg-[#181d28] text-gray-400 hover:text-white hover:bg-[#202838] border border-[#1e2330]'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* TP / SL Toggle and inputs */}
          <div className="pt-1">
            <label className="flex items-center space-x-1.5 text-[11px] text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={enableTpSl}
                onChange={(e) => setEnableTpSl(e.target.checked)}
                className="accent-white rounded"
              />
              <span>Take Profit / Stop Loss</span>
            </label>

            {enableTpSl && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="text-[9px] text-[#10b981] block mb-0.5 font-republic-mono">TP (USDT)</span>
                  <input
                    type="number"
                    step="any"
                    value={takeProfitInput}
                    onChange={(e) => setTakeProfitInput(e.target.value)}
                    placeholder="Take Profit"
                    className="w-full bg-[#161c28] border border-[#1e2330] rounded-lg px-2.5 py-1.5 text-[11px] text-white font-republic-mono focus:outline-none focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-[#f43f5e] block mb-0.5 font-republic-mono">SL (USDT)</span>
                  <input
                    type="number"
                    step="any"
                    value={stopLossInput}
                    onChange={(e) => setStopLossInput(e.target.value)}
                    placeholder="Stop Loss"
                    className="w-full bg-[#161c28] border border-[#1e2330] rounded-lg px-2.5 py-1.5 text-[11px] text-white font-republic-mono focus:outline-none focus:border-[#f43f5e]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary & Execution Button */}
        <div className="space-y-2 pt-2 border-t border-white/[0.08]">
          <div className="space-y-1 text-[10px] text-gray-400">
            <div className="flex justify-between">
              <span>Order Value:</span>
              <span className="font-republic-mono text-gray-200">
                ${totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
              </span>
            </div>

            {mode === 'perps' && (
              <>
                <div className="flex justify-between">
                  <span>Cost (Margin):</span>
                  <span className="font-republic-mono text-gray-200">
                    ${requiredMargin.toFixed(2)} USDT
                  </span>
                </div>
                {estLiqPrice && (
                  <div className="flex justify-between text-rose-400">
                    <span>Est. Liq Price:</span>
                    <span className="font-republic-mono font-semibold">
                      ${estLiqPrice.toFixed(pair.precision)}
                    </span>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between">
              <span>Est. Fee:</span>
              <span className="font-republic-mono text-gray-400">
                ${estFee.toFixed(3)} USDT
              </span>
            </div>
          </div>

          {/* Validation Feedback Hint if user clicks without amount or exceeds balance */}
          {validationHint && (
            <div className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg flex items-center justify-between animate-fadeIn">
              <span>{validationHint}</span>
              {side === 'buy' && maxBuyBase > 0 && (
                <button
                  type="button"
                  onClick={() => handlePercentage(100)}
                  className="text-[9px] underline text-amber-200 font-bold ml-2 hover:text-white cursor-pointer"
                >
                  Set 100%
                </button>
              )}
            </div>
          )}

          {/* Big Action Submit Button */}
          <button
            id="order-submit-btn"
            type="submit"
            className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-md active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer ${
              side === 'buy'
                ? parsedAmount <= 0
                  ? 'bg-[#10b981]/90 hover:bg-[#10b981] text-black shadow-[#10b981]/20'
                  : 'bg-[#10b981] hover:bg-[#0ea371] text-black shadow-[#10b981]/25'
                : parsedAmount <= 0
                  ? 'bg-[#f43f5e]/90 hover:bg-[#f43f5e] text-white shadow-[#f43f5e]/20'
                  : 'bg-[#f43f5e] hover:bg-[#e11d48] text-white shadow-[#f43f5e]/25'
            }`}
          >
            <span>
              {parsedAmount <= 0
                ? (side === 'buy' 
                    ? (mode === 'perps' ? `Enter Amount to Long ${pair.baseAsset}` : `Enter Amount to Buy ${pair.baseAsset}`) 
                    : (mode === 'perps' ? `Enter Amount to Short ${pair.baseAsset}` : `Enter Amount to Sell ${pair.baseAsset}`))
                : (side === 'buy' 
                    ? (mode === 'perps' ? `Buy / Long ${pair.baseAsset}` : `Buy ${pair.baseAsset}`) 
                    : (mode === 'perps' ? `Sell / Short ${pair.baseAsset}` : `Sell ${pair.baseAsset}`))}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
