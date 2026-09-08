import { TradingPair, Candle, OrderBookLevel, RecentTrade, AssetBalance, Order, Position } from '../types';

export const TRADING_PAIRS: TradingPair[] = [
  {
    symbol: 'BTC/USDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    currentPrice: 67482.50,
    change24h: 3.48,
    high24h: 68120.00,
    low24h: 64950.00,
    volume24h: 24518.32,
    quoteVolume24h: 1642850420,
    precision: 2,
    qtyPrecision: 4,
    minQty: 0.0001,
    maxLeverage: 100,
    category: 'Layer 1',
    fundingRate: 0.0001, // 0.0100%
    nextFundingTime: Date.now() + 3 * 3600 * 1000 + 24 * 60 * 1000,
  },
  {
    symbol: 'ETH/USDT',
    baseAsset: 'ETH',
    quoteAsset: 'USDT',
    currentPrice: 3514.80,
    change24h: 2.14,
    high24h: 3580.00,
    low24h: 3410.50,
    volume24h: 142850.6,
    quoteVolume24h: 498210340,
    precision: 2,
    qtyPrecision: 3,
    minQty: 0.001,
    maxLeverage: 75,
    category: 'Layer 1',
    fundingRate: 0.00008,
    nextFundingTime: Date.now() + 3 * 3600 * 1000 + 24 * 60 * 1000,
  },
  {
    symbol: 'SOL/USDT',
    baseAsset: 'SOL',
    quoteAsset: 'USDT',
    currentPrice: 156.45,
    change24h: 7.82,
    high24h: 159.20,
    low24h: 144.10,
    volume24h: 890420.0,
    quoteVolume24h: 136502010,
    precision: 2,
    qtyPrecision: 2,
    minQty: 0.01,
    maxLeverage: 50,
    category: 'Layer 1',
    fundingRate: 0.00015,
    nextFundingTime: Date.now() + 3 * 3600 * 1000 + 24 * 60 * 1000,
  },
  {
    symbol: 'NEAR/USDT',
    baseAsset: 'NEAR',
    quoteAsset: 'USDT',
    currentPrice: 5.24,
    change24h: -1.45,
    high24h: 5.48,
    low24h: 5.10,
    volume24h: 4120300.0,
    quoteVolume24h: 21600100,
    precision: 3,
    qtyPrecision: 1,
    minQty: 0.1,
    maxLeverage: 50,
    category: 'AI',
    fundingRate: 0.0001,
    nextFundingTime: Date.now() + 3 * 3600 * 1000 + 24 * 60 * 1000,
  },
  {
    symbol: 'SUI/USDT',
    baseAsset: 'SUI',
    quoteAsset: 'USDT',
    currentPrice: 2.18,
    change24h: 11.45,
    high24h: 2.25,
    low24h: 1.92,
    volume24h: 12450000.0,
    quoteVolume24h: 26800000,
    precision: 4,
    qtyPrecision: 1,
    minQty: 1,
    maxLeverage: 50,
    category: 'Layer 1',
    fundingRate: 0.0002,
    nextFundingTime: Date.now() + 3 * 3600 * 1000 + 24 * 60 * 1000,
  },
  {
    symbol: 'AVAX/USDT',
    baseAsset: 'AVAX',
    quoteAsset: 'USDT',
    currentPrice: 29.80,
    change24h: 0.95,
    high24h: 30.50,
    low24h: 28.90,
    volume24h: 580000.0,
    quoteVolume24h: 17200000,
    precision: 2,
    qtyPrecision: 2,
    minQty: 0.05,
    maxLeverage: 50,
    category: 'Layer 1',
    fundingRate: 0.00009,
    nextFundingTime: Date.now() + 3 * 3600 * 1000 + 24 * 60 * 1000,
  },
  {
    symbol: 'UNI/USDT',
    baseAsset: 'UNI',
    quoteAsset: 'USDT',
    currentPrice: 9.42,
    change24h: 4.30,
    high24h: 9.75,
    low24h: 8.95,
    volume24h: 920000.0,
    quoteVolume24h: 8600000,
    precision: 3,
    qtyPrecision: 1,
    minQty: 0.1,
    maxLeverage: 25,
    category: 'DeFi',
    fundingRate: 0.0001,
    nextFundingTime: Date.now() + 3 * 3600 * 1000 + 24 * 60 * 1000,
  },
  {
    symbol: 'DOGE/USDT',
    baseAsset: 'DOGE',
    quoteAsset: 'USDT',
    currentPrice: 0.1742,
    change24h: 5.64,
    high24h: 0.1820,
    low24h: 0.1630,
    volume24h: 45000000.0,
    quoteVolume24h: 7800000,
    precision: 5,
    qtyPrecision: 0,
    minQty: 10,
    maxLeverage: 50,
    category: 'Meme',
    fundingRate: 0.00012,
    nextFundingTime: Date.now() + 3 * 3600 * 1000 + 24 * 60 * 1000,
  },
  {
    symbol: 'RENDER/USDT',
    baseAsset: 'RENDER',
    quoteAsset: 'USDT',
    currentPrice: 6.84,
    change24h: 8.92,
    high24h: 7.10,
    low24h: 6.20,
    volume24h: 2100000.0,
    quoteVolume24h: 14200000,
    precision: 3,
    qtyPrecision: 1,
    minQty: 0.1,
    maxLeverage: 50,
    category: 'AI',
    fundingRate: 0.00015,
    nextFundingTime: Date.now() + 3 * 3600 * 1000 + 24 * 60 * 1000,
  },
  {
    symbol: 'PEPE/USDT',
    baseAsset: 'PEPE',
    quoteAsset: 'USDT',
    currentPrice: 0.00001045,
    change24h: -2.85,
    high24h: 0.00001120,
    low24h: 0.00001010,
    volume24h: 120000000000.0,
    quoteVolume24h: 12500000,
    precision: 8,
    qtyPrecision: 0,
    minQty: 100000,
    maxLeverage: 25,
    category: 'Meme',
    fundingRate: 0.0002,
    nextFundingTime: Date.now() + 3 * 3600 * 1000 + 24 * 60 * 1000,
  }
];

export const INITIAL_BALANCES: AssetBalance[] = [
  { asset: 'USDT', free: 42500.00, locked: 2500.00, total: 45000.00, usdValue: 45000.00 },
  { asset: 'BTC', free: 0.4500, locked: 0.0500, total: 0.5000, usdValue: 33741.25 },
  { asset: 'ETH', free: 3.250, locked: 0.000, total: 3.250, usdValue: 11423.10 },
  { asset: 'SOL', free: 28.50, locked: 0.00, total: 28.50, usdValue: 4458.82 },
  { asset: 'SUI', free: 1500.0, locked: 0.0, total: 1500.0, usdValue: 3270.00 }
];

export const INITIAL_POSITIONS: Position[] = [
  {
    id: 'pos-1',
    pair: 'BTC/USDT',
    side: 'long',
    size: 0.25,
    entryPrice: 66250.00,
    markPrice: 67482.50,
    liqPrice: 59800.00,
    margin: 1656.25, // ~10x
    leverage: 10,
    marginType: 'cross',
    unrealizedPnl: 308.12,
    pnlPercent: 18.60,
    takeProfit: 71000.00,
    stopLoss: 64500.00
  },
  {
    id: 'pos-2',
    pair: 'SOL/USDT',
    side: 'long',
    size: 15.0,
    entryPrice: 148.20,
    markPrice: 156.45,
    liqPrice: 132.50,
    margin: 444.60, // ~5x
    leverage: 5,
    marginType: 'isolated',
    unrealizedPnl: 123.75,
    pnlPercent: 27.83,
    takeProfit: 175.00
  },
  {
    id: 'pos-3',
    pair: 'ETH/USDT',
    side: 'short',
    size: 1.80,
    entryPrice: 3550.00,
    markPrice: 3514.80,
    liqPrice: 3880.00,
    margin: 639.00, // ~10x
    leverage: 10,
    marginType: 'cross',
    unrealizedPnl: 63.36,
    pnlPercent: 9.91,
    takeProfit: 3380.00,
    stopLoss: 3650.00
  },
  {
    id: 'pos-4',
    pair: 'SUI/USDT',
    side: 'long',
    size: 800.0,
    entryPrice: 2.05,
    markPrice: 2.18,
    liqPrice: 1.82,
    margin: 205.00, // ~8x
    leverage: 8,
    marginType: 'isolated',
    unrealizedPnl: 104.00,
    pnlPercent: 50.73,
    takeProfit: 2.50
  },
  {
    id: 'pos-5',
    pair: 'AVAX/USDT',
    side: 'long',
    size: 40.0,
    entryPrice: 28.40,
    markPrice: 29.15,
    liqPrice: 24.50,
    margin: 227.20, // ~5x
    leverage: 5,
    marginType: 'cross',
    unrealizedPnl: 30.00,
    pnlPercent: 13.20,
    takeProfit: 32.00,
    stopLoss: 27.00
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    pair: 'BTC/USDT',
    side: 'buy',
    type: 'limit',
    price: 66500.00,
    amount: 0.15,
    filled: 0,
    status: 'open',
    timestamp: Date.now() - 42 * 60 * 1000,
    mode: 'spot'
  },
  {
    id: 'ord-102',
    pair: 'ETH/USDT',
    side: 'buy',
    type: 'limit',
    price: 3450.00,
    amount: 1.0,
    filled: 0,
    status: 'open',
    timestamp: Date.now() - 118 * 60 * 1000,
    mode: 'spot'
  },
  {
    id: 'ord-103',
    pair: 'BTC/USDT',
    side: 'sell',
    type: 'limit',
    price: 69200.00,
    amount: 0.1,
    filled: 0,
    status: 'open',
    timestamp: Date.now() - 15 * 60 * 1000,
    mode: 'perps',
    leverage: 10
  }
];

// Generate candles for chart
export function generateCandles(basePrice: number, count: number = 80, timeframeMinutes: number = 15): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  const intervalMs = timeframeMinutes * 60 * 1000;
  let currentPrice = basePrice * 0.94; // start slightly lower to show natural trend

  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * intervalMs;
    // Walk random with slight upward/cyclical bias
    const cycle = Math.sin((count - i) / 8) * 0.004;
    const changePercent = (Math.random() - 0.485) * 0.016 + cycle;
    const open = currentPrice;
    const close = open * (1 + changePercent);
    const wickHigh = Math.max(open, close) * (1 + Math.random() * 0.008);
    const wickLow = Math.min(open, close) * (1 - Math.random() * 0.008);
    const volume = (basePrice > 1000 ? 5 : 500) * (Math.random() * 15 + 3);

    candles.push({
      time,
      open: Number(open.toFixed(basePrice < 1 ? 6 : 2)),
      high: Number(wickHigh.toFixed(basePrice < 1 ? 6 : 2)),
      low: Number(wickLow.toFixed(basePrice < 1 ? 6 : 2)),
      close: Number(close.toFixed(basePrice < 1 ? 6 : 2)),
      volume: Number(volume.toFixed(2))
    });

    currentPrice = close;
  }

  // Force the last candle to match basePrice closely
  if (candles.length > 0) {
    const last = candles[candles.length - 1];
    last.close = basePrice;
    last.high = Math.max(last.high, basePrice);
    last.low = Math.min(last.low, basePrice);
  }

  return candles;
}

// Generate realistic Order Book bids and asks
export function generateOrderBook(midPrice: number, precision: number = 2, count: number = 24) {
  const step = midPrice > 10000 ? 0.5 : midPrice > 100 ? 0.1 : midPrice > 1 ? 0.01 : 0.0001;
  const asks: OrderBookLevel[] = [];
  const bids: OrderBookLevel[] = [];

  let askCumTotal = 0;
  for (let i = 1; i <= count; i++) {
    const price = Number((midPrice + i * step + (Math.random() * step * 0.4)).toFixed(precision));
    const amount = Number((Math.random() * (midPrice > 10000 ? 1.5 : 80) + (midPrice > 10000 ? 0.05 : 5)).toFixed(3));
    askCumTotal += amount;
    asks.push({
      price,
      amount,
      total: Number(askCumTotal.toFixed(3)),
      depthPercent: 0
    });
  }

  let bidCumTotal = 0;
  for (let i = 1; i <= count; i++) {
    const price = Number((midPrice - i * step - (Math.random() * step * 0.4)).toFixed(precision));
    const amount = Number((Math.random() * (midPrice > 10000 ? 1.5 : 80) + (midPrice > 10000 ? 0.05 : 5)).toFixed(3));
    bidCumTotal += amount;
    bids.push({
      price,
      amount,
      total: Number(bidCumTotal.toFixed(3)),
      depthPercent: 0
    });
  }

  const maxTotal = Math.max(askCumTotal, bidCumTotal);
  asks.forEach(a => a.depthPercent = Math.min(100, Math.round((a.total / maxTotal) * 100)));
  bids.forEach(b => b.depthPercent = Math.min(100, Math.round((b.total / maxTotal) * 100)));

  // Return asks sorted descending for display top-down, bids sorted descending
  return {
    asks: asks.reverse(), // Highest ask at top, lowest ask near spread
    bids: bids            // Highest bid near spread, lowest bid at bottom
  };
}

// Generate recent trades
export function generateInitialTrades(midPrice: number, count: number = 25): RecentTrade[] {
  const trades: RecentTrade[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const isBuy = Math.random() > 0.48;
    const priceVariance = (Math.random() - 0.5) * (midPrice * 0.0008);
    const price = Number((midPrice + priceVariance).toFixed(midPrice < 1 ? 6 : 2));
    const amount = Number((Math.random() * (midPrice > 10000 ? 0.8 : 40) + (midPrice > 10000 ? 0.01 : 1)).toFixed(midPrice > 10000 ? 4 : 2));

    trades.push({
      id: 'trade-' + (now - i * 1400),
      price,
      amount,
      time: now - i * (Math.random() * 2500 + 800),
      side: isBuy ? 'buy' : 'sell'
    });
  }

  return trades;
}
