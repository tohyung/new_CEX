export type TradingMode = 'spot' | 'perps';
export type OrderSide = 'buy' | 'sell';
export type OrderType = 'limit' | 'market' | 'stop_limit';
export type OrderStatus = 'open' | 'filled' | 'cancelled';
export type MarginType = 'cross' | 'isolated';

export interface TradingPair {
  symbol: string;         // e.g. "BTC/USDT"
  baseAsset: string;      // e.g. "BTC"
  quoteAsset: string;     // e.g. "USDT"
  currentPrice: number;
  change24h: number;      // percentage, e.g. +3.42
  high24h: number;
  low24h: number;
  volume24h: number;      // in base asset
  quoteVolume24h: number; // in USDT
  precision: number;      // decimal places for price
  qtyPrecision: number;   // decimal places for quantity
  minQty: number;
  maxLeverage: number;    // e.g. 100 for BTC, 50 for altcoins
  category: 'All' | 'Layer 1' | 'DeFi' | 'AI' | 'Meme';
  fundingRate: number;    // e.g. 0.0001 (0.0100%)
  nextFundingTime: number; // timestamp
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookLevel {
  price: number;
  amount: number;
  total: number;
  depthPercent: number;
}

export interface RecentTrade {
  id: string;
  price: number;
  amount: number;
  time: number;
  side: OrderSide;
}

export interface Order {
  id: string;
  pair: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  stopPrice?: number;
  amount: number;
  filled: number;
  status: OrderStatus;
  timestamp: number;
  mode: TradingMode;
  leverage?: number;
  marginType?: MarginType;
  takeProfit?: number;
  stopLoss?: number;
}

export interface Position {
  id: string;
  pair: string;
  side: 'long' | 'short';
  size: number;          // in base asset
  entryPrice: number;
  markPrice: number;
  liqPrice: number;
  margin: number;        // in USDT
  leverage: number;
  marginType: MarginType;
  unrealizedPnl: number; // in USDT
  pnlPercent: number;    // in %
  takeProfit?: number;
  stopLoss?: number;
}

export interface AssetBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
  usdValue: number;
}

export interface IndicatorSettings {
  ma7: boolean;
  ma25: boolean;
  ma99: boolean;
  bollinger: boolean;
  volume: boolean;
  rsi: boolean;
}

export type AppViewMode = 'pro_terminal' | 'trade_republic' | 'trade' | 'market' | 'community' | 'square';

export interface SavingsPlan {
  id: string;
  pairSymbol: string;
  asset: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  nextExecution: string;
  totalInvested: number;
  active: boolean;
}

export interface TradeRepublicScrubPoint {
  time: number;
  price: number;
  change: number;
  label: string;
}
