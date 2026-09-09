import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TRADING_PAIRS, 
  INITIAL_BALANCES, 
  INITIAL_POSITIONS, 
  INITIAL_ORDERS,
  generateCandles,
  generateOrderBook,
  generateInitialTrades 
} from './data/mockData';
import { 
  TradingPair, 
  TradingMode, 
  Candle, 
  OrderBookLevel, 
  RecentTrade, 
  Order, 
  Position, 
  AssetBalance, 
  OrderSide, 
  OrderType, 
  MarginType,
  AppViewMode
} from './types';
import { Navbar } from './components/Navbar';
import { DepositModal } from './components/DepositModal';
import { LoginModal } from './components/LoginModal';
import { MarketView } from './components/MarketView';
import { TradeRepublicView } from './components/TradeRepublicView';
import { CommunityView } from './components/CommunityView';
import { SquareView } from './components/SquareView';
import { OrderBook } from './components/OrderBook';
import { ChartSection } from './components/ChartSection';
import { OrderEntry } from './components/OrderEntry';
import { WalletBoard } from './components/WalletBoard';
import { MarketTrades } from './components/MarketTrades';
import { BottomPanel } from './components/BottomPanel';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { playSound, setSoundEnabled, getSoundEnabled } from './utils/sound';

export default function App() {
  // 1. Trading State
  const [appViewMode, setAppViewMode] = useState<AppViewMode>('trade_republic');
  const [pairs, setPairs] = useState<TradingPair[]>(TRADING_PAIRS);
  const [currentPairSymbol, setCurrentPairSymbol] = useState<string>('BTC/USDT');
  const [tradingMode, setTradingMode] = useState<TradingMode>('spot');
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [soundActive, setSoundActive] = useState<boolean>(true);

  // Theme state: dark vs light mode with localStorage persistence
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('tr_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('tr_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Sub-tab for Pro Terminal left column (Order Book vs Recent Market Trades)
  const [terminalLeftTab, setTerminalLeftTab] = useState<'orderbook' | 'trades'>('orderbook');

  // Active pair
  const currentPair = pairs.find(p => p.symbol === currentPairSymbol) || pairs[0];

  // 2. Market Data States
  const [candles, setCandles] = useState<Candle[]>(() => 
    generateCandles(currentPair.currentPrice, 80, 15)
  );
  const [orderBook, setOrderBook] = useState<{ asks: OrderBookLevel[]; bids: OrderBookLevel[] }>(() => 
    generateOrderBook(currentPair.currentPrice, currentPair.precision)
  );
  const [trades, setTrades] = useState<RecentTrade[]>(() => 
    generateInitialTrades(currentPair.currentPrice, 25)
  );
  const [priceTickDirection, setPriceTickDirection] = useState<'up' | 'down' | 'neutral'>('neutral');

  // 3. User Portfolio & Orders State
  const [balances, setBalances] = useState<AssetBalance[]>(INITIAL_BALANCES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);

  // Order Book selection -> Form autofill
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  // UI Modals & Toasts
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Ref to hold latest state for interval tick engine
  const stateRef = useRef({
    currentPair,
    orders,
    positions,
    balances,
    candles,
    timeframe
  });

  useEffect(() => {
    stateRef.current = {
      currentPair,
      orders,
      positions,
      balances,
      candles,
      timeframe
    };
  }, [currentPair, orders, positions, balances, candles, timeframe]);

  // Add toast helper
  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev.slice(-4), { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Toggle pair
  const handleSelectPair = (pair: TradingPair) => {
    setCurrentPairSymbol(pair.symbol);
    const tfMinutes = timeframe === '1s' ? 0.016 : timeframe === '1m' ? 1 : timeframe === '5m' ? 5 : timeframe === '15m' ? 15 : timeframe === '1H' ? 60 : timeframe === '4H' ? 240 : 1440;
    setCandles(generateCandles(pair.currentPrice, 80, tfMinutes));
    setOrderBook(generateOrderBook(pair.currentPrice, pair.precision));
    setTrades(generateInitialTrades(pair.currentPrice, 25));
    setSelectedPrice(null);
    setSelectedAmount(null);
  };

  // Change timeframe
  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
    const tfMinutes = tf === '1s' ? 0.016 : tf === '1m' ? 1 : tf === '5m' ? 5 : tf === '15m' ? 15 : tf === '1H' ? 60 : tf === '4H' ? 240 : 1440;
    setCandles(generateCandles(currentPair.currentPrice, 80, tfMinutes));
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) playSound('click');
  };

  // --- Real-time High-Frequency Market Simulation & Order Matching Engine ---
  useEffect(() => {
    const interval = setInterval(() => {
      const { currentPair: pair, orders: currentOrders, positions: currentPositions } = stateRef.current;
      
      // Calculate micro volatility tick (around ±0.03% to ±0.08%)
      const volatility = 0.0006;
      const deltaPercent = (Math.random() - 0.495) * volatility;
      const oldPrice = pair.currentPrice;
      const rawNewPrice = oldPrice * (1 + deltaPercent);
      const newPrice = Number(rawNewPrice.toFixed(pair.precision));

      if (newPrice === oldPrice) return;

      const isUp = newPrice > oldPrice;
      setPriceTickDirection(isUp ? 'up' : 'down');

      // 1. Update current pair price in pairs list
      setPairs(prevPairs => 
        prevPairs.map(p => {
          if (p.symbol === pair.symbol) {
            const high = Math.max(p.high24h, newPrice);
            const low = Math.min(p.low24h, newPrice);
            return {
              ...p,
              currentPrice: newPrice,
              high24h: high,
              low24h: low
            };
          }
          return p;
        })
      );

      // 2. Generate new live market trade tick
      const tradeAmount = Number((Math.random() * (pair.currentPrice > 1000 ? 0.5 : 25) + 0.01).toFixed(pair.qtyPrecision));
      const newTrade: RecentTrade = {
        id: 't-' + Date.now(),
        price: newPrice,
        amount: tradeAmount,
        time: Date.now(),
        side: isUp ? 'buy' : 'sell'
      };
      setTrades(prev => [newTrade, ...prev.slice(0, 40)]);

      // 3. Update Order Book with micro adjustments
      setOrderBook(generateOrderBook(newPrice, pair.precision));

      // 4. Update latest candle with real-time price & volume
      setCandles(prevCandles => {
        if (prevCandles.length === 0) return prevCandles;
        const copy = [...prevCandles];
        const lastCandle = { ...copy[copy.length - 1] };
        lastCandle.close = newPrice;
        lastCandle.high = Math.max(lastCandle.high, newPrice);
        lastCandle.low = Math.min(lastCandle.low, newPrice);
        lastCandle.volume = Number((lastCandle.volume + tradeAmount * 0.1).toFixed(2));
        copy[copy.length - 1] = lastCandle;
        return copy;
      });

      // 5. MATCHING ENGINE: Check if any Open Orders can be filled!
      currentOrders.forEach(order => {
        if (order.status !== 'open' || order.pair !== pair.symbol) return;

        let shouldFill = false;
        if (order.side === 'buy' && newPrice <= order.price) {
          shouldFill = true;
        } else if (order.side === 'sell' && newPrice >= order.price) {
          shouldFill = true;
        }

        if (shouldFill) {
          // Execute order!
          executeFilledOrder(order, newPrice);
        }
      });

      // 6. Update Unrealized PnL for active positions
      if (currentPositions.length > 0) {
        setPositions(prevPositions => 
          prevPositions.map(pos => {
            if (pos.pair === pair.symbol) {
              const markPrice = newPrice;
              const isLong = pos.side === 'long';
              const priceDiff = isLong ? markPrice - pos.entryPrice : pos.entryPrice - markPrice;
              const unrealizedPnl = Number((priceDiff * pos.size).toFixed(2));
              const pnlPercent = Number(((unrealizedPnl / pos.margin) * 100).toFixed(2));
              return {
                ...pos,
                markPrice,
                unrealizedPnl,
                pnlPercent
              };
            }
            return pos;
          })
        );
      }

    }, 900);

    return () => clearInterval(interval);
  }, []);

  // Execute a filled limit order
  const executeFilledOrder = (order: Order, executionPrice: number) => {
    playSound('order_fill');
    addToast('success', 'Limit Order Executed!', `${order.side.toUpperCase()} ${order.amount} ${order.pair} filled at $${executionPrice.toLocaleString()}`);

    // Mark order as filled
    setOrders(prev => 
      prev.map(o => o.id === order.id ? { ...o, status: 'filled', price: executionPrice } : o)
    );

    // If spot, update wallet balances
    if (order.mode === 'spot') {
      const baseAsset = order.pair.split('/')[0];
      const costUsdt = order.amount * executionPrice;

      setBalances(prev => {
        return prev.map(b => {
          if (b.asset === 'USDT') {
            const free = order.side === 'buy' ? b.free - costUsdt : b.free + costUsdt;
            return { ...b, free, total: free + b.locked, usdValue: free + b.locked };
          }
          if (b.asset === baseAsset) {
            const free = order.side === 'buy' ? b.free + order.amount : b.free - order.amount;
            return { ...b, free, total: free + b.locked, usdValue: (free + b.locked) * executionPrice };
          }
          return b;
        });
      });
    } else {
      // In Perps mode, create or add to position
      const lev = order.leverage || 10;
      const margin = (order.amount * executionPrice) / lev;
      const isLong = order.side === 'buy';
      const liqPrice = isLong 
        ? executionPrice * (1 - (1 / lev) * 0.9)
        : executionPrice * (1 + (1 / lev) * 0.9);

      const newPos: Position = {
        id: 'pos-' + Date.now(),
        pair: order.pair,
        side: isLong ? 'long' : 'short',
        size: order.amount,
        entryPrice: executionPrice,
        markPrice: executionPrice,
        liqPrice: Number(liqPrice.toFixed(2)),
        margin: Number(margin.toFixed(2)),
        leverage: lev,
        marginType: order.marginType || 'cross',
        unrealizedPnl: 0,
        pnlPercent: 0,
        takeProfit: order.takeProfit,
        stopLoss: order.stopLoss
      };

      setPositions(prev => [newPos, ...prev]);
    }
  };

  // Place a new Order from the Form
  const handlePlaceOrder = (orderData: {
    side: OrderSide;
    type: OrderType;
    price: number;
    stopPrice?: number;
    amount: number;
    leverage?: number;
    marginType?: MarginType;
    takeProfit?: number;
    stopLoss?: number;
  }) => {
    const isMarket = orderData.type === 'market';
    const execPrice = isMarket ? currentPair.currentPrice : orderData.price;
    const totalCostUsdt = orderData.amount * execPrice;
    const requiredMargin = tradingMode === 'perps' ? totalCostUsdt / (orderData.leverage || 10) : totalCostUsdt;

    // Check USDT balance for buy / perps
    const usdtBal = balances.find(b => b.asset === 'USDT');
    const baseBal = balances.find(b => b.asset === currentPair.baseAsset);

    if (tradingMode === 'perps' || orderData.side === 'buy') {
      const tolerance = 0.10; // 10 cents margin tolerance for decimal precision when calculating max amount
      if ((usdtBal?.free || 0) + tolerance < requiredMargin) {
        addToast('error', 'Insufficient Funds', `You need at least $${requiredMargin.toFixed(2)} USDT available.`);
        return;
      }
    } else {
      // Spot sell
      const tolerance = 0.00001;
      if ((baseBal?.free || 0) + tolerance < orderData.amount) {
        addToast('error', 'Insufficient Crypto Balance', `You only have ${baseBal?.free || 0} ${currentPair.baseAsset} free to sell.`);
        return;
      }
    }

    // If Market Order -> execute immediately!
    if (isMarket) {
      playSound('order_fill');
      addToast(
        'success', 
        `Market Order Filled`, 
        `${orderData.side.toUpperCase()} ${orderData.amount} ${currentPair.baseAsset} filled at $${execPrice.toLocaleString()}`
      );

      const filledOrder: Order = {
        id: 'ord-' + Date.now(),
        pair: currentPair.symbol,
        side: orderData.side,
        type: 'market',
        price: execPrice,
        amount: orderData.amount,
        filled: orderData.amount,
        status: 'filled',
        timestamp: Date.now(),
        mode: tradingMode,
        leverage: orderData.leverage,
        marginType: orderData.marginType,
        takeProfit: orderData.takeProfit,
        stopLoss: orderData.stopLoss
      };

      setOrders(prev => [filledOrder, ...prev]);

      if (tradingMode === 'spot') {
        // Adjust spot balances
        setBalances(prev => 
          prev.map(b => {
            if (b.asset === 'USDT') {
              const free = orderData.side === 'buy' ? b.free - totalCostUsdt : b.free + totalCostUsdt;
              return { ...b, free, total: free + b.locked, usdValue: free + b.locked };
            }
            if (b.asset === currentPair.baseAsset) {
              const free = orderData.side === 'buy' ? b.free + orderData.amount : b.free - orderData.amount;
              return { ...b, free, total: free + b.locked, usdValue: (free + b.locked) * execPrice };
            }
            return b;
          })
        );
      } else {
        // Create perps position
        const lev = orderData.leverage || 10;
        const margin = totalCostUsdt / lev;
        const isLong = orderData.side === 'buy';
        const liqPrice = isLong 
          ? execPrice * (1 - (1 / lev) * 0.9)
          : execPrice * (1 + (1 / lev) * 0.9);

        // Deduct margin from free USDT
        setBalances(prev => prev.map(b => b.asset === 'USDT' ? { ...b, free: b.free - margin, locked: b.locked + margin } : b));

        const newPos: Position = {
          id: 'pos-' + Date.now(),
          pair: currentPair.symbol,
          side: isLong ? 'long' : 'short',
          size: orderData.amount,
          entryPrice: execPrice,
          markPrice: execPrice,
          liqPrice: Number(liqPrice.toFixed(2)),
          margin: Number(margin.toFixed(2)),
          leverage: lev,
          marginType: orderData.marginType || 'cross',
          unrealizedPnl: 0,
          pnlPercent: 0,
          takeProfit: orderData.takeProfit,
          stopLoss: orderData.stopLoss
        };

        setPositions(prev => [newPos, ...prev]);
      }
    } else {
      // Limit / Stop-Limit order -> place into Open Orders
      playSound('order_placed');
      addToast(
        'info', 
        `Limit Order Placed`, 
        `${orderData.side.toUpperCase()} ${orderData.amount} ${currentPair.baseAsset} at $${orderData.price.toLocaleString()}`
      );

      const newOrder: Order = {
        id: 'ord-' + Date.now(),
        pair: currentPair.symbol,
        side: orderData.side,
        type: orderData.type,
        price: orderData.price,
        stopPrice: orderData.stopPrice,
        amount: orderData.amount,
        filled: 0,
        status: 'open',
        timestamp: Date.now(),
        mode: tradingMode,
        leverage: orderData.leverage,
        marginType: orderData.marginType,
        takeProfit: orderData.takeProfit,
        stopLoss: orderData.stopLoss
      };

      setOrders(prev => [newOrder, ...prev]);
    }
  };

  // Cancel single order
  const handleCancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    addToast('info', 'Order Cancelled', `Order #${orderId} was cancelled.`);
  };

  // Cancel all open orders
  const handleCancelAllOrders = () => {
    setOrders(prev => prev.map(o => o.status === 'open' ? { ...o, status: 'cancelled' } : o));
    addToast('info', 'All Orders Cancelled', 'All open limit orders have been cancelled.');
  };

  // Close Position (Market Close)
  const handleClosePosition = (positionId: string) => {
    const pos = positions.find(p => p.id === positionId);
    if (!pos) return;

    // Credit margin + realized PnL back to USDT free balance
    const returnedEquity = pos.margin + pos.unrealizedPnl;
    setBalances(prev => 
      prev.map(b => {
        if (b.asset === 'USDT') {
          const free = b.free + returnedEquity;
          const locked = Math.max(0, b.locked - pos.margin);
          return { ...b, free, locked, total: free + locked, usdValue: free + locked };
        }
        return b;
      })
    );

    // Remove from positions
    setPositions(prev => prev.filter(p => p.id !== positionId));
    addToast(
      pos.unrealizedPnl >= 0 ? 'success' : 'error',
      'Position Closed',
      `Closed ${pos.side.toUpperCase()} ${pos.pair}. Realized PnL: ${pos.unrealizedPnl >= 0 ? '+' : ''}$${pos.unrealizedPnl.toFixed(2)} USDT`
    );
  };

  // Claim Faucet demo assets
  const handleClaimFaucet = (asset: string, amount: number) => {
    setBalances(prev => {
      const exists = prev.some(b => b.asset === asset);
      if (exists) {
        return prev.map(b => {
          if (b.asset === asset) {
            const free = b.free + amount;
            const total = free + b.locked;
            const price = asset === 'USDT' ? 1 : (pairs.find(p => p.baseAsset === asset)?.currentPrice || 1);
            return { ...b, free, total, usdValue: total * price };
          }
          return b;
        });
      } else {
        const price = pairs.find(p => p.baseAsset === asset)?.currentPrice || 1;
        return [...prev, { asset, free: amount, locked: 0, total: amount, usdValue: amount * price }];
      }
    });

    addToast('success', 'Demo Funds Credited!', `Added +${amount} ${asset} into your account.`);
  };

  // Reset demo portfolio
  const handleResetBalance = () => {
    setBalances(INITIAL_BALANCES);
    setPositions(INITIAL_POSITIONS);
    setOrders(INITIAL_ORDERS);
    addToast('info', 'Portfolio Reset', 'Demo balances & positions restored to factory defaults.');
    setIsDepositOpen(false);
  };

  // Balances calculations
  const totalBalanceUsd = balances.reduce((sum, b) => sum + b.usdValue, 0);
  const totalPnlUsd = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const currentUsdtBalance = balances.find(b => b.asset === 'USDT') || { asset: 'USDT', free: 0, locked: 0, total: 0, usdValue: 0 };
  const currentBaseBalance = balances.find(b => b.asset === currentPair.baseAsset) || { asset: currentPair.baseAsset, free: 0, locked: 0, total: 0, usdValue: 0 };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#070a0f] text-[#d1d4dc] bg-[radial-gradient(ellipse_100%_50%_at_50%_0%,rgba(56,189,248,0.06),transparent_50%),radial-gradient(ellipse_100%_40%_at_50%_100%,rgba(16,185,129,0.04),transparent_40%)]' : 'bg-[#f4f5f8] text-[#111827]'} flex flex-col font-republic selection:bg-white/20 overflow-x-clip relative transition-colors duration-200`}>
      {/* 1. Header / Navbar (Sticky translucent top bar) */}
      <Navbar
        currentPair={currentPair}
        allPairs={pairs}
        onSelectPair={handleSelectPair}
        tradingMode={tradingMode}
        onSelectMode={setTradingMode}
        appViewMode={appViewMode}
        onSelectAppViewMode={setAppViewMode}
        soundEnabled={soundActive}
        onToggleSound={handleToggleSound}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        user={user}
        onLogout={() => {
          setUser(null);
          addToast('info', 'Logged Out', 'Logged out successfully');
        }}
        totalBalanceUsd={totalBalanceUsd}
        totalPnlUsd={totalPnlUsd}
        onShowToast={(msg, type) => addToast(type || 'info', type === 'success' ? 'Success' : 'Notice', msg)}
      />

      {/* 2. Main View Area: Trade (Pro Terminal), Market, Community, Square */}
      <div className="flex-1 flex flex-col min-h-0">
        {appViewMode === 'market' ? (
          <MarketView
            allPairs={pairs}
            currentPair={currentPair}
            onSelectPair={handleSelectPair}
            onSwitchToTrade={() => setAppViewMode('pro_terminal')}
            onOpenDeposit={() => setIsDepositOpen(true)}
          />
        ) : appViewMode === 'trade_republic' ? (
          <TradeRepublicView
            currentPair={currentPair}
            allPairs={pairs}
            onSelectPair={handleSelectPair}
            balances={balances}
            onExecuteTrade={(orderData) => {
              handlePlaceOrder({
                side: orderData.side,
                type: orderData.type,
                price: orderData.price,
                amount: orderData.amount
              });
            }}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onSwitchToProTerminal={() => setAppViewMode('pro_terminal')}
          />
        ) : appViewMode === 'community' ? (
          <CommunityView
            currentPair={currentPair}
            onSelectPair={handleSelectPair}
            onSwitchToTrade={() => setAppViewMode('pro_terminal')}
            user={user}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        ) : appViewMode === 'square' ? (
          <SquareView
            currentPair={currentPair}
            onSelectPair={handleSelectPair}
            onSwitchToTrade={() => setAppViewMode('pro_terminal')}
          />
        ) : (
          /* Restored Multi-Board Pro Trading Terminal with Minimalist Sharper Theme */
          <div className="flex-1 flex flex-col p-2 sm:p-2.5 gap-2 min-h-0">
            {/* Main Section: Left+Center Block (Top: Order Book + Chart with equal height; Bottom: Stretched Positions Board) & Right Column (Order Entry + Lengthened Assets) */}
            <div className="flex flex-col lg:flex-row gap-2 min-h-[720px] lg:h-[calc(100vh-75px)]">
              {/* Left + Center Area: Top row contains Order Book & Chart (equal height); Bottom row contains Positions Board stretched to the left */}
              <div className="flex-1 min-w-0 flex flex-col h-full gap-2 min-h-[500px]">
                {/* Top Row: Order Book & Chart side-by-side with equal height */}
                <div className="flex-1 min-h-[380px] flex flex-col lg:flex-row gap-2">
                  {/* Order Book & Market Trades - Shortened to equal the chart height */}
                  <div className="w-full lg:w-[260px] xl:w-[275px] shrink-0 flex flex-col h-full">
                    {terminalLeftTab === 'orderbook' ? (
                      <OrderBook
                        pair={currentPair}
                        asks={orderBook.asks}
                        bids={orderBook.bids}
                        lastPrice={currentPair.currentPrice}
                        priceTickDirection={priceTickDirection}
                        onSelectPrice={(price, amount) => {
                          setSelectedPrice(price);
                          if (amount) setSelectedAmount(amount);
                        }}
                        activeTab={terminalLeftTab}
                        onTabChange={setTerminalLeftTab}
                      />
                    ) : (
                      <MarketTrades
                        pair={currentPair}
                        trades={trades}
                        onSelectPrice={(price) => setSelectedPrice(price)}
                        activeTab={terminalLeftTab}
                        onTabChange={setTerminalLeftTab}
                      />
                    )}
                  </div>

                  {/* Chart Section - Takes remaining horizontal space, exact same height as Order Book */}
                  <div className="flex-1 min-w-0 flex flex-col h-full">
                    <ChartSection
                      pair={currentPair}
                      allPairs={pairs}
                      onSelectPair={handleSelectPair}
                      candles={candles}
                      timeframe={timeframe}
                      onTimeframeChange={handleTimeframeChange}
                      orderBookAsks={orderBook.asks}
                      orderBookBids={orderBook.bids}
                    />
                  </div>
                </div>

                {/* Stretched Positions Board - Extends all the way to the left to fill the blank underneath the Order Book and Chart */}
                <div className="h-[235px] shrink-0">
                  <BottomPanel
                    orders={orders}
                    positions={positions}
                    balances={balances}
                    pairs={pairs}
                    onCancelOrder={handleCancelOrder}
                    onCancelAllOrders={() => {
                      setOrders([]);
                      addToast('info', 'Orders Canceled', 'All open limit orders canceled.');
                    }}
                    onClosePosition={handleClosePosition}
                    onOpenDeposit={() => setIsDepositOpen(true)}
                  />
                </div>
              </div>

              {/* Right Column: Order Entry & Real-time Wallet Board - Thinner, exact same width as left column */}
              <div className="w-full lg:w-[260px] xl:w-[275px] shrink-0 flex flex-col gap-2 h-full min-h-[620px]">
                {/* Trading Board (no scrolling needed for info) */}
                <div className="h-[420px] shrink-0">
                  <OrderEntry
                    pair={currentPair}
                    mode={tradingMode}
                    onModeChange={setTradingMode}
                    currentPrice={currentPair.currentPrice}
                    selectedPriceFromBook={selectedPrice}
                    selectedAmountFromBook={selectedAmount}
                    usdtBalance={currentUsdtBalance}
                    baseAssetBalance={currentBaseBalance}
                    onSubmitOrder={handlePlaceOrder}
                    onOpenDeposit={() => setIsDepositOpen(true)}
                  />
                </div>

                {/* Lengthened Asset Board - Fills all blank space in the right column down to the bottom */}
                <div className="flex-1 min-h-[250px]">
                  <WalletBoard
                    balances={balances}
                    pair={currentPair}
                    positions={positions}
                    onOpenDeposit={() => setIsDepositOpen(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Global 4-Column Translucent Footer (at the end of the site) */}
      <Footer
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onShowToast={(msg, type) => addToast(msg, type || 'info')}
      />

      {/* Deposit & Testnet Faucet Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onClaimFaucet={handleClaimFaucet}
        onResetBalance={handleResetBalance}
      />

      {/* Login & Authentication Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          addToast(`Welcome back, ${loggedInUser.name}!`, 'success');
        }}
      />

      {/* Floating Toast Notification Stack */}
      <ToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
      />
    </div>
  );
}
