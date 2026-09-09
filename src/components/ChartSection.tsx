import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  createChart,
  CandlestickSeries,
  BarSeries,
  LineSeries,
  AreaSeries,
  BaselineSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  IChartApi,
  ISeriesApi,
  createTextWatermark,
  UTCTimestamp,
} from 'lightweight-charts';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Settings,
  Camera,
  Sliders,
  Crosshair,
  Minus,
  TrendingUp,
  Percent,
  Ruler,
  Magnet,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  ChevronDown,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  BarChart2,
  Activity,
  Check,
  Search,
  Star,
  TrendingDown,
  X,
} from 'lucide-react';
import { Candle, TradingPair, OrderBookLevel } from '../types';
import { playSound } from '../utils/sound';
import { TradingViewIndicatorsModal, TVIndicatorSettings } from './TradingViewIndicatorsModal';
import { TradingViewSettingsModal, TVChartSettings } from './TradingViewSettingsModal';
import { TradingViewDepthChart } from './TradingViewDepthChart';

interface ChartSectionProps {
  pair: TradingPair;
  allPairs?: TradingPair[];
  onSelectPair?: (pair: TradingPair) => void;
  candles: Candle[];
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  orderBookAsks: OrderBookLevel[];
  orderBookBids: OrderBookLevel[];
}

type ChartStyleType = 'candles' | 'bars' | 'line' | 'area' | 'baseline' | 'depth';
type DrawingToolType = 'cursor' | 'trendline' | 'horizontal' | 'fibonacci' | 'position' | 'measure';

interface DrawingItem {
  id: string;
  type: DrawingToolType;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startPrice?: number;
  endPrice?: number;
  color?: string;
}

export const ChartSection: React.FC<ChartSectionProps> = ({
  pair,
  allPairs = [],
  onSelectPair,
  candles,
  timeframe,
  onTimeframeChange,
  orderBookAsks,
  orderBookBids,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const indicatorSeriesRef = useRef<Record<string, ISeriesApi<'Line'>>>({});

  // TradingView State
  const [chartStyle, setChartStyle] = useState<ChartStyleType>('candles');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingToolType>('cursor');
  const [drawings, setDrawings] = useState<DrawingItem[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingItem | null>(null);
  const [magnetMode, setMagnetMode] = useState(false);
  const [drawingsLocked, setDrawingsLocked] = useState(false);
  const [drawingsVisible, setDrawingsVisible] = useState(true);
  const [showCtrlZoomBanner, setShowCtrlZoomBanner] = useState(true);

  // Watchlist & Market Pair Selector State (replaces static BTC/USDT icon)
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [watchlistSearch, setWatchlistSearch] = useState('');
  const [watchlistCategory, setWatchlistCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<string[]>(['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'SUI/USDT']);
  const watchlistRef = useRef<HTMLDivElement>(null);

  // Close watchlist on outside click or Esc
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (watchlistRef.current && !watchlistRef.current.contains(e.target as Node)) {
        setIsWatchlistOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsWatchlistOpen(false);
      }
    };
    if (isWatchlistOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isWatchlistOpen]);

  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    setFavorites(prev =>
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const watchlistCategories = ['All', 'Watchlist', 'Layer 1', 'DeFi', 'AI', 'Meme'];

  const availablePairs = allPairs.length > 0 ? allPairs : [pair];

  const filteredWatchlistPairs = availablePairs.filter(p => {
    const matchesSearch =
      p.symbol.toLowerCase().includes(watchlistSearch.toLowerCase()) ||
      p.baseAsset.toLowerCase().includes(watchlistSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (watchlistCategory === 'All') return true;
    if (watchlistCategory === 'Watchlist') return favorites.includes(p.symbol);
    return p.category === watchlistCategory;
  });

  // Modals
  const [isIndicatorsModalOpen, setIsIndicatorsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [screenshotNotice, setScreenshotNotice] = useState<string | null>(null);

  // Indicators
  const [indicators, setIndicators] = useState<TVIndicatorSettings>({
    ema9: true,
    ema21: true,
    sma50: false,
    sma200: false,
    ma7: false,
    ma25: false,
    bollinger: false,
    volume: true,
    rsi: false,
    macd: false,
  });

  // Chart Preferences
  const [chartSettings, setChartSettings] = useState<TVChartSettings>({
    upColor: '#089981', // TradingView Green
    downColor: '#f23645', // TradingView Red
    showGrid: true,
    gridStyle: 'dotted',
    showWatermark: true,
    showCountdown: true,
    showOHLC: true,
    showBarChange: true,
    priceLine: true,
  });

  // Status Line Hovered / Active Candle
  const [statusCandle, setStatusCandle] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
    changePercent: number;
  } | null>(null);

  // Countdown timer to candle close
  const [countdownStr, setCountdownStr] = useState<string>('00:00');

  const timeframes = ['1s', '1m', '5m', '15m', '1H', '4H', '1D', '1W'];

  // Calculate Bar Close Countdown
  useEffect(() => {
    const updateCountdown = () => {
      const nowSec = Math.floor(Date.now() / 1000);
      let tfSec = 900; // 15m default
      if (timeframe === '1s') tfSec = 1;
      else if (timeframe === '1m') tfSec = 60;
      else if (timeframe === '5m') tfSec = 300;
      else if (timeframe === '15m') tfSec = 900;
      else if (timeframe === '1H') tfSec = 3600;
      else if (timeframe === '4H') tfSec = 14400;
      else if (timeframe === '1D') tfSec = 86400;
      else if (timeframe === '1W') tfSec = 604800;

      const remaining = tfSec - (nowSec % tfSec);
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      setCountdownStr(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [timeframe]);

  // Clean data helper ensuring unique, ascending timestamps in seconds
  const formattedData = useMemo(() => {
    if (!candles || candles.length === 0) return { candles: [], volume: [] };

    const sorted = [...candles].sort((a, b) => a.time - b.time);
    const candleData: any[] = [];
    const volumeData: any[] = [];
    let lastSec = 0;

    for (const c of sorted) {
      let sec = Math.floor(c.time / 1000);
      if (sec <= lastSec) {
        sec = lastSec + 1;
      }
      lastSec = sec;

      const isUp = c.close >= c.open;
      candleData.push({
        time: sec as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        value: c.close, // for line / area / baseline series
      });

      volumeData.push({
        time: sec as UTCTimestamp,
        value: c.volume,
        color: isUp ? 'rgba(8, 153, 129, 0.4)' : 'rgba(242, 54, 69, 0.4)',
      });
    }

    return { candles: candleData, volume: volumeData };
  }, [candles]);

  // Set default status line from latest candle if not hovered
  useEffect(() => {
    if (candles.length > 0) {
      const last = candles[candles.length - 1];
      const prev = candles[candles.length - 2] || last;
      const change = last.close - prev.close;
      const changePercent = prev.close ? (change / prev.close) * 100 : 0;
      setStatusCandle({
        open: last.open,
        high: last.high,
        low: last.low,
        close: last.close,
        volume: last.volume,
        change,
        changePercent,
      });
    }
  }, [candles]);

  // Initialize and Update TradingView Lightweight Chart
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container || chartStyle === 'depth') return;

    // Clean up any existing chart instance
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
      indicatorSeriesRef.current = {};
    }

    const gridStyleMap = {
      dotted: LineStyle.Dotted,
      dashed: LineStyle.Dashed,
      none: LineStyle.Solid,
    };

    const gridColor = chartSettings.showGrid && chartSettings.gridStyle !== 'none'
      ? 'rgba(42, 46, 57, 0.6)'
      : 'transparent';

    // 1. Create TradingView Canvas Chart
    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#787b86',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: gridColor, style: gridStyleMap[chartSettings.gridStyle] },
        horzLines: { color: gridColor, style: gridStyleMap[chartSettings.gridStyle] },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#758696',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#2a2e39',
        },
        horzLine: {
          color: '#758696',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#2a2e39',
        },
      },
      rightPriceScale: {
        borderColor: '#1e2330',
        scaleMargins: {
          top: 0.08,
          bottom: 0.18, // room for volume histogram
        },
        autoScale: true,
      },
      timeScale: {
        borderColor: '#1e2330',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 8,
        barSpacing: 9,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // 2. Add TradingView Background Watermark
    if (chartSettings.showWatermark) {
      try {
        const firstPane = chart.panes()[0];
        if (firstPane) {
          createTextWatermark(firstPane, {
            horzAlign: 'center',
            vertAlign: 'center',
            lines: [
              {
                text: pair.symbol,
                color: 'rgba(255, 255, 255, 0.035)',
                fontSize: 64,
                fontStyle: 'bold',
              },
              {
                text: `${timeframe} · TRADINGVIEW ENGINE`,
                color: 'rgba(255, 255, 255, 0.02)',
                fontSize: 20,
                fontStyle: 'normal',
              },
            ],
          });
        }
      } catch (e) {
        // graceful watermark fallback
      }
    }

    // 3. Add Main Price Series based on selected chart style
    let mainSeries: ISeriesApi<any>;

    if (chartStyle === 'bars') {
      mainSeries = chart.addSeries(BarSeries, {
        upColor: chartSettings.upColor,
        downColor: chartSettings.downColor,
        priceLineVisible: chartSettings.priceLine,
      });
    } else if (chartStyle === 'line') {
      mainSeries = chart.addSeries(LineSeries, {
        color: '#2962FF',
        lineWidth: 2,
        priceLineVisible: chartSettings.priceLine,
      });
    } else if (chartStyle === 'area') {
      mainSeries = chart.addSeries(AreaSeries, {
        topColor: 'rgba(41, 98, 255, 0.38)',
        bottomColor: 'rgba(41, 98, 255, 0.0)',
        lineColor: '#2962FF',
        lineWidth: 2,
        priceLineVisible: chartSettings.priceLine,
      });
    } else if (chartStyle === 'baseline') {
      mainSeries = chart.addSeries(BaselineSeries, {
        baseValue: { type: 'price', price: pair.currentPrice },
        topFillColor1: 'rgba(8, 153, 129, 0.28)',
        topFillColor2: 'rgba(8, 153, 129, 0.05)',
        topLineColor: chartSettings.upColor,
        bottomFillColor1: 'rgba(242, 54, 69, 0.05)',
        bottomFillColor2: 'rgba(242, 54, 69, 0.28)',
        bottomLineColor: chartSettings.downColor,
        priceLineVisible: chartSettings.priceLine,
      });
    } else {
      // Default: Candlesticks
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: chartSettings.upColor,
        downColor: chartSettings.downColor,
        borderVisible: false,
        wickUpColor: chartSettings.upColor,
        wickDownColor: chartSettings.downColor,
        priceLineVisible: chartSettings.priceLine,
      });
    }

    mainSeries.setData(formattedData.candles);
    mainSeriesRef.current = mainSeries;

    // 4. Add Volume Histogram Series overlaying bottom area
    if (indicators.volume) {
      const volSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: '', // overlay
      });
      volSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.82,
          bottom: 0,
        },
      });
      volSeries.setData(formattedData.volume);
      volumeSeriesRef.current = volSeries;
    }

    // Helper to calculate Moving Averages on candle data
    const calcMA = (period: number, exponential: boolean = false) => {
      const result: { time: UTCTimestamp; value: number }[] = [];
      const data = formattedData.candles;
      if (data.length < period) return result;

      if (!exponential) {
        for (let i = period - 1; i < data.length; i++) {
          let sum = 0;
          for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
          }
          result.push({
            time: data[i].time,
            value: Number((sum / period).toFixed(pair.precision)),
          });
        }
      } else {
        const k = 2 / (period + 1);
        let ema = data[0].close;
        result.push({ time: data[0].time, value: ema });
        for (let i = 1; i < data.length; i++) {
          ema = data[i].close * k + ema * (1 - k);
          if (i >= period - 1) {
            result.push({
              time: data[i].time,
              value: Number(ema.toFixed(pair.precision)),
            });
          }
        }
      }
      return result;
    };

    // 5. Add Active Indicators (EMA, SMA, Bollinger Bands)
    const activeIndicators: Record<string, ISeriesApi<'Line'>> = {};

    if (indicators.ema9) {
      const ema9Series = chart.addSeries(LineSeries, {
        color: '#2962FF', // TV Blue
        lineWidth: 2,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
      });
      ema9Series.setData(calcMA(9, true));
      activeIndicators.ema9 = ema9Series;
    }

    if (indicators.ema21) {
      const ema21Series = chart.addSeries(LineSeries, {
        color: '#FF9800', // TV Orange
        lineWidth: 2,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
      });
      ema21Series.setData(calcMA(21, true));
      activeIndicators.ema21 = ema21Series;
    }

    if (indicators.sma50) {
      const sma50Series = chart.addSeries(LineSeries, {
        color: '#E91E63', // Pink
        lineWidth: 2,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
      });
      sma50Series.setData(calcMA(50, false));
      activeIndicators.sma50 = sma50Series;
    }

    if (indicators.sma200) {
      const sma200Series = chart.addSeries(LineSeries, {
        color: '#00BCD4', // Cyan
        lineWidth: 2,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
      });
      sma200Series.setData(calcMA(200, false));
      activeIndicators.sma200 = sma200Series;
    }

    if (indicators.ma7) {
      const ma7Series = chart.addSeries(LineSeries, {
        color: '#F59E0B',
        lineWidth: 2,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
      });
      ma7Series.setData(calcMA(7, false));
      activeIndicators.ma7 = ma7Series;
    }

    if (indicators.ma25) {
      const ma25Series = chart.addSeries(LineSeries, {
        color: '#06B6D4',
        lineWidth: 2,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
      });
      ma25Series.setData(calcMA(25, false));
      activeIndicators.ma25 = ma25Series;
    }

    if (indicators.bollinger) {
      // BB upper, lower, basis
      const basis = calcMA(20, false);
      const bbUpperSeries = chart.addSeries(LineSeries, {
        color: 'rgba(59, 130, 246, 0.7)',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        priceLineVisible: false,
      });
      const bbLowerSeries = chart.addSeries(LineSeries, {
        color: 'rgba(59, 130, 246, 0.7)',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        priceLineVisible: false,
      });

      const upperData = basis.map(b => ({
        time: b.time,
        value: Number((b.value * 1.025).toFixed(pair.precision)),
      }));
      const lowerData = basis.map(b => ({
        time: b.time,
        value: Number((b.value * 0.975).toFixed(pair.precision)),
      }));

      bbUpperSeries.setData(upperData);
      bbLowerSeries.setData(lowerData);
      activeIndicators.bbUpper = bbUpperSeries;
      activeIndicators.bbLower = bbLowerSeries;
    }

    indicatorSeriesRef.current = activeIndicators;

    // 6. Crosshair Movement Handler for TradingView Status Line HUD
    chart.subscribeCrosshairMove(param => {
      if (!param.time || !param.seriesData || !mainSeriesRef.current) {
        if (candles.length > 0) {
          const last = candles[candles.length - 1];
          const prev = candles[candles.length - 2] || last;
          const change = last.close - prev.close;
          const changePercent = prev.close ? (change / prev.close) * 100 : 0;
          setStatusCandle({
            open: last.open,
            high: last.high,
            low: last.low,
            close: last.close,
            volume: last.volume,
            change,
            changePercent,
          });
        }
        return;
      }

      const data = param.seriesData.get(mainSeriesRef.current) as any;
      if (data) {
        const open = data.open ?? data.value;
        const high = data.high ?? data.value;
        const low = data.low ?? data.value;
        const close = data.close ?? data.value;
        const change = close - open;
        const changePercent = open ? (change / open) * 100 : 0;

        let vol = 0;
        if (volumeSeriesRef.current) {
          const volData = param.seriesData.get(volumeSeriesRef.current) as any;
          if (volData) vol = volData.value || 0;
        }

        setStatusCandle({
          open,
          high,
          low,
          close,
          volume: vol,
          change,
          changePercent,
        });
      }
    });

    // 7. Auto-resize observer
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || !entries[0].contentRect) return;
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [
    chartStyle,
    chartSettings,
    indicators,
    timeframe,
    pair.symbol,
    pair.precision,
  ]);

  // Handle Real-time Candle & Volume Updates into existing Chart
  useEffect(() => {
    if (!mainSeriesRef.current || !chartRef.current || chartStyle === 'depth') return;
    if (formattedData.candles.length === 0) return;

    // Update main series data with latest ticks
    mainSeriesRef.current.setData(formattedData.candles);

    if (volumeSeriesRef.current && indicators.volume) {
      volumeSeriesRef.current.setData(formattedData.volume);
    }
  }, [formattedData, chartStyle, indicators.volume]);

  // Fit content / Reset View
  const handleResetView = () => {
    playSound('click');
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  // Capture Screenshot (TradingView camera feature)
  const handleTakeScreenshot = () => {
    playSound('order_fill');
    setScreenshotNotice('Chart snapshot captured to clipboard!');
    setTimeout(() => setScreenshotNotice(null), 3500);

    if (chartRef.current) {
      try {
        const canvas = chartContainerRef.current?.querySelector('canvas');
        if (canvas) {
          canvas.toBlob(blob => {
            if (blob && navigator.clipboard && (window as any).ClipboardItem) {
              navigator.clipboard.write([new (window as any).ClipboardItem({ 'image/png': blob })]);
            }
          });
        }
      } catch (e) {
        // fallback
      }
    }
  };

  // Drawing Tools Interaction Layer
  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeDrawingTool === 'cursor' || drawingsLocked || !drawingsVisible) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    const newDrawing: DrawingItem = {
      id: 'draw-' + Date.now(),
      type: activeDrawingTool,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      startPrice: pair.currentPrice,
    };
    setCurrentDrawing(newDrawing);
  };

  const handleOverlayMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentDrawing(prev => prev ? { ...prev, endX: x, endY: y } : null);
  };

  const handleOverlayMouseUp = () => {
    if (isDrawing && currentDrawing) {
      playSound('click');
      setDrawings(prev => [...prev, currentDrawing]);
      setIsDrawing(false);
      setCurrentDrawing(null);
      setActiveDrawingTool('cursor'); // Return to cursor after drawing
    }
  };

  const handleClearDrawings = () => {
    playSound('cancel');
    setDrawings([]);
    setCurrentDrawing(null);
  };

  const isUpCandle = statusCandle ? statusCandle.close >= statusCandle.open : true;

  return (
    <div
      className={`flex flex-col bg-[#12141a]/70 backdrop-blur-md border border-white/[0.08] rounded-lg shadow-xs overflow-hidden relative font-republic select-none ${
        isFullscreen ? 'fixed inset-0 z-[100] rounded-none' : 'h-full'
      }`}
    >
      {/* 1. TOP TICKER STRIP (Integrated into chart card header) */}
      <div className="h-10 bg-[#151720]/65 border-b border-white/[0.08] flex items-center justify-between px-3 text-xs shrink-0">
        {/* Left: Symbol Dropdown, Price, 24h Metrics */}
        <div className="flex items-center space-x-3.5 sm:space-x-5 overflow-x-auto scrollbar-none py-1">
          {/* Watchlist & Market Pair Selector */}
          <div className="relative mr-1" ref={watchlistRef}>
            <button
              id="chart-watchlist-btn"
              onClick={() => {
                playSound('click');
                setIsWatchlistOpen(!isWatchlistOpen);
              }}
              className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/30 text-white transition-all group shadow-xs cursor-pointer"
              title="Watchlist & Markets"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                {pair.baseAsset === 'BTC' ? '₿' : pair.baseAsset === 'ETH' ? 'Ξ' : pair.baseAsset.charAt(0)}
              </div>
              <span className="font-republic-display font-extrabold text-white text-xs tracking-tight">
                {pair.symbol}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-transform ${isWatchlistOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {/* Watchlist Dropdown Panel */}
            {isWatchlistOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-[360px] sm:w-[420px] bg-[#0c1018]/95 backdrop-blur-2xl border border-white/[0.12] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.08)] z-50 overflow-hidden flex flex-col font-republic text-xs">
                {/* Search Bar */}
                <div className="p-2.5 border-b border-white/[0.08] bg-white/[0.02]">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 text-gray-400" />
                    <input
                      id="chart-watchlist-search"
                      type="text"
                      value={watchlistSearch}
                      onChange={(e) => setWatchlistSearch(e.target.value)}
                      placeholder="Search coins, tokens (e.g. BTC, ETH, SOL)..."
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2962FF] font-republic"
                      autoFocus
                    />
                    {watchlistSearch && (
                      <button
                        onClick={() => setWatchlistSearch('')}
                        className="absolute right-2 text-gray-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Categories / Watchlist Tabs */}
                <div className="flex items-center space-x-1 px-2.5 py-2 border-b border-white/[0.08] overflow-x-auto text-[11px] text-gray-400 scrollbar-none bg-white/[0.01]">
                  {watchlistCategories.map(cat => {
                    const isWatchlist = cat === 'Watchlist';
                    const active = watchlistCategory === cat;
                    return (
                      <button
                        key={cat}
                        id={`watchlist-cat-${cat.toLowerCase().replace(' ', '-')}`}
                        onClick={() => {
                          playSound('click');
                          setWatchlistCategory(cat);
                        }}
                        className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors flex items-center space-x-1 ${
                          active
                            ? 'bg-white text-black font-extrabold font-republic-display'
                            : 'hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        {isWatchlist && <Star className={`w-3 h-3 ${active ? 'fill-black text-black' : 'text-amber-400 fill-amber-400'}`} />}
                        <span>{cat}</span>
                        {isWatchlist && favorites.length > 0 && (
                          <span className={`text-[9px] px-1 rounded-full ${active ? 'bg-black/15 text-black' : 'bg-white/10 text-gray-300'}`}>
                            {favorites.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] text-gray-400 border-b border-white/[0.08] font-medium bg-white/[0.02]">
                  <span className="col-span-5">Pair</span>
                  <span className="col-span-4 text-right">Price</span>
                  <span className="col-span-3 text-right">24h Change</span>
                </div>

                {/* Pairs List */}
                <div className="max-h-[280px] overflow-y-auto divide-y divide-white/[0.03]">
                  {filteredWatchlistPairs.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center space-y-1">
                      <Star className="w-5 h-5 text-gray-600" />
                      <span>No pairs found in {watchlistCategory}</span>
                    </div>
                  ) : (
                    filteredWatchlistPairs.map(p => {
                      const isFav = favorites.includes(p.symbol);
                      const isSelected = p.symbol === pair.symbol;
                      const pos = p.change24h >= 0;

                      return (
                        <div
                          key={p.symbol}
                          id={`watchlist-pair-${p.symbol.replace('/', '-')}`}
                          onClick={() => {
                            playSound('click');
                            onSelectPair?.(p);
                            setIsWatchlistOpen(false);
                          }}
                          className={`grid grid-cols-12 px-3 py-2 items-center cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-white/[0.08]'
                              : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="col-span-5 flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={(e) => toggleFavorite(p.symbol, e)}
                              className="text-gray-500 hover:text-amber-400 transition-colors p-0.5"
                              title={isFav ? 'Remove from Watchlist' : 'Add to Watchlist'}
                            >
                              <Star className={`w-3.5 h-3.5 ${isFav ? 'text-amber-400 fill-amber-400' : ''}`} />
                            </button>
                            <div>
                              <div className="font-bold text-white text-xs font-republic-mono flex items-center space-x-1">
                                <span>{p.symbol}</span>
                                {isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                                )}
                              </div>
                              <div className="text-[9px] text-gray-400">{p.baseAsset} Perpetual</div>
                            </div>
                          </div>

                          <div className="col-span-4 text-right font-republic-mono text-xs text-gray-200">
                            ${p.currentPrice.toLocaleString(undefined, { minimumFractionDigits: p.precision, maximumFractionDigits: p.precision })}
                          </div>

                          <div className={`col-span-3 text-right font-republic-mono text-xs font-bold ${
                            pos ? 'text-[#10b981]' : 'text-[#f43f5e]'
                          }`}>
                            {pos ? '+' : ''}{p.change24h}%
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current Price & USD valuation */}
          <div className="flex flex-col">
            <span className="font-republic-mono font-bold text-sm text-[#00e676] leading-none">
              {(pair.currentPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: pair.precision })}
            </span>
            <span className="font-republic-mono text-[9px] text-gray-400 leading-none mt-0.5">
              ${(pair.currentPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* 24h Change */}
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-400 leading-none">24h Change</span>
            <span className={`font-republic-mono text-[11px] font-semibold flex items-center space-x-0.5 leading-none mt-0.5 ${
              pair.change24h >= 0 ? 'text-[#00e676]' : 'text-rose-400'
            }`}>
              <span>{(Math.abs(pair.currentPrice * (pair.change24h / 100))).toFixed(1)}</span>
              <span>{pair.change24h >= 0 ? '▲' : '▼'} {Math.abs(pair.change24h).toFixed(2)} %</span>
            </span>
          </div>

          {/* 24h High */}
          <div className="hidden sm:flex flex-col">
            <span className="text-[9px] text-gray-400 leading-none">24h High</span>
            <span className="font-republic-mono text-[11px] font-semibold text-gray-200 leading-none mt-0.5">
              {(pair.high24h ?? pair.currentPrice * 1.014).toLocaleString(undefined, { minimumFractionDigits: pair.precision })}
            </span>
          </div>

          {/* 24h Low */}
          <div className="hidden sm:flex flex-col">
            <span className="text-[9px] text-gray-400 leading-none">24h Low</span>
            <span className="font-republic-mono text-[11px] font-semibold text-gray-200 leading-none mt-0.5">
              {(pair.low24h ?? pair.currentPrice * 0.986).toLocaleString(undefined, { minimumFractionDigits: pair.precision })}
            </span>
          </div>

          {/* 24h Volume */}
          <div className="hidden md:flex flex-col">
            <span className="text-[9px] text-gray-400 leading-none">24h Volume</span>
            <span className="font-republic-mono text-[11px] font-semibold text-gray-200 leading-none mt-0.5">
              {(pair.volume24h ?? 548013).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Right utility buttons: settings, maximize, close */}
        <div className="flex items-center space-x-1 text-gray-500 shrink-0">
          <button onClick={() => setIsSettingsModalOpen(true)} className="p-1 hover:text-gray-300 rounded transition-colors" title="Settings">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { playSound('click'); setIsFullscreen(!isFullscreen); }} className="p-1 hover:text-gray-300 rounded transition-colors" title="Expand">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:text-gray-300 rounded transition-colors" title="Close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. TRADINGVIEW SUB-HEADER TOOLBAR */}
      <div className="h-9 bg-black/20 border-b border-white/[0.08] flex items-center justify-between px-2.5 text-xs text-gray-300 shrink-0">
        {/* Left: Timeframe Selector Pills */}
        <div className="flex items-center space-x-1">
          {/* Timeframe Selector Pills */}
          <div className="flex items-center space-x-0.5">
            {timeframes.map(tf => (
              <button
                key={tf}
                id={`tv-tf-${tf}`}
                onClick={() => {
                  playSound('click');
                  onTimeframeChange(tf);
                }}
                className={`px-2 py-1 rounded-md text-[11px] font-mono font-medium transition-colors ${
                  timeframe === tf
                    ? 'bg-[#2962FF] text-white font-bold shadow-xs'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-white/[0.08] mx-1" />

          {/* Chart Style Switcher Dropdown */}
          <div className="relative">
            <button
              id="tv-chart-style-btn"
              onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
              className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-[#181d28] text-gray-300 hover:text-white text-[11px] transition-colors"
              title="Chart Style"
            >
              <BarChart2 className="w-3.5 h-3.5 text-[#2962FF]" />
              <span className="capitalize font-medium">{chartStyle}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {isStyleDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-36 bg-[#131722] border border-[#2a2e39] rounded-lg shadow-2xl p-1 z-50 text-xs">
                {(['candles', 'bars', 'line', 'area', 'baseline', 'depth'] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => {
                      playSound('click');
                      setChartStyle(style);
                      setIsStyleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between capitalize ${
                      chartStyle === style ? 'bg-[#2962FF] text-white font-bold' : 'text-gray-300 hover:bg-[#1e222d]'
                    }`}
                  >
                    <span>{style}</span>
                    {chartStyle === style && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-[#1e2330] mx-1" />

          {/* Iconic TradingView "fx Indicators" Button */}
          <button
            id="tv-indicators-button"
            onClick={() => {
              playSound('click');
              setIsIndicatorsModalOpen(true);
            }}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#181d28] hover:bg-[#202838] border border-[#1e2330] text-gray-200 text-[11px] transition-colors"
          >
            <span className="font-mono font-bold text-[#2962FF] text-xs">ƒx</span>
            <span className="font-semibold">Indicators</span>
            {Object.values(indicators).filter(Boolean).length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#2962FF] text-white font-bold flex items-center justify-center text-[9px] ml-1">
                {Object.values(indicators).filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Right: Actions & Preferences */}
        <div className="flex items-center space-x-1">
          {/* Fit / Reset scale */}
          <button
            id="tv-reset-scale-btn"
            onClick={handleResetView}
            className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#181d28] transition-colors"
            title="Reset Chart Scale (Auto-fit)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Screenshot / Camera */}
          <button
            id="tv-camera-btn"
            onClick={handleTakeScreenshot}
            className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#181d28] transition-colors"
            title="Take Screenshot"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>

          {/* Settings */}
          <button
            id="tv-settings-btn"
            onClick={() => {
              playSound('click');
              setIsSettingsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#181d28] transition-colors"
            title="Chart Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            id="tv-fullscreen-btn"
            onClick={() => {
              playSound('click');
              setIsFullscreen(!isFullscreen);
            }}
            className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#181d28] transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN BODY: LEFT DRAWING TOOLBAR + CHART CANVAS + STATUS LINE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* TradingView Iconic Left Drawing Toolbar */}
        {chartStyle !== 'depth' && (
          <div className="w-10 bg-white/[0.015] border-r border-white/[0.08] flex flex-col items-center py-2 space-y-1.5 z-20 shrink-0 text-gray-400">
            {/* Crosshair Cursor */}
            <button
              onClick={() => setActiveDrawingTool('cursor')}
              className={`p-2 rounded-lg transition-colors ${
                activeDrawingTool === 'cursor'
                  ? 'bg-[#2962FF] text-white shadow-xs'
                  : 'hover:text-white hover:bg-[#181d28]'
              }`}
              title="Crosshair Cursor"
            >
              <Crosshair className="w-4 h-4" />
            </button>

            {/* Trendline Tool */}
            <button
              onClick={() => {
                playSound('click');
                setActiveDrawingTool('trendline');
              }}
              className={`p-2 rounded-lg transition-colors ${
                activeDrawingTool === 'trendline'
                  ? 'bg-[#2962FF] text-white shadow-xs'
                  : 'hover:text-white hover:bg-[#181d28]'
              }`}
              title="Trend Line"
            >
              <TrendingUp className="w-4 h-4" />
            </button>

            {/* Horizontal Line / Ray */}
            <button
              onClick={() => {
                playSound('click');
                setActiveDrawingTool('horizontal');
              }}
              className={`p-2 rounded-lg transition-colors ${
                activeDrawingTool === 'horizontal'
                  ? 'bg-[#2962FF] text-white shadow-xs'
                  : 'hover:text-white hover:bg-[#181d28]'
              }`}
              title="Horizontal Support/Resistance Line"
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Fibonacci Retracement */}
            <button
              onClick={() => {
                playSound('click');
                setActiveDrawingTool('fibonacci');
              }}
              className={`p-2 rounded-lg transition-colors ${
                activeDrawingTool === 'fibonacci'
                  ? 'bg-[#2962FF] text-white shadow-xs'
                  : 'hover:text-white hover:bg-[#181d28]'
              }`}
              title="Fibonacci Retracement"
            >
              <Percent className="w-4 h-4" />
            </button>

            {/* Long / Short Position Tool */}
            <button
              onClick={() => {
                playSound('click');
                setActiveDrawingTool('position');
              }}
              className={`p-2 rounded-lg transition-colors ${
                activeDrawingTool === 'position'
                  ? 'bg-[#2962FF] text-white shadow-xs'
                  : 'hover:text-white hover:bg-[#181d28]'
              }`}
              title="Long / Short Position Calculator"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>

            {/* Measure Ruler */}
            <button
              onClick={() => {
                playSound('click');
                setActiveDrawingTool('measure');
              }}
              className={`p-2 rounded-lg transition-colors ${
                activeDrawingTool === 'measure'
                  ? 'bg-[#2962FF] text-white shadow-xs'
                  : 'hover:text-white hover:bg-[#181d28]'
              }`}
              title="Measure Price & Bars"
            >
              <Ruler className="w-4 h-4" />
            </button>

            <div className="w-5 h-[1px] bg-[#1e2330] my-1" />

            {/* Magnet Mode */}
            <button
              onClick={() => setMagnetMode(!magnetMode)}
              className={`p-2 rounded-lg transition-colors ${
                magnetMode ? 'text-[#2962FF] bg-[#2962FF]/15' : 'hover:text-white hover:bg-[#181d28]'
              }`}
              title={magnetMode ? 'Magnet Mode On' : 'Magnet Mode Off'}
            >
              <Magnet className="w-4 h-4" />
            </button>

            {/* Lock Drawings */}
            <button
              onClick={() => setDrawingsLocked(!drawingsLocked)}
              className={`p-2 rounded-lg transition-colors ${
                drawingsLocked ? 'text-amber-400 bg-amber-400/15' : 'hover:text-white hover:bg-[#181d28]'
              }`}
              title={drawingsLocked ? 'Unlock All Drawings' : 'Lock All Drawings'}
            >
              {drawingsLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>

            {/* Hide / Show Drawings */}
            <button
              onClick={() => setDrawingsVisible(!drawingsVisible)}
              className={`p-2 rounded-lg transition-colors ${
                !drawingsVisible ? 'text-gray-600' : 'hover:text-white hover:bg-[#181d28]'
              }`}
              title={drawingsVisible ? 'Hide Drawings' : 'Show Drawings'}
            >
              {drawingsVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {/* Clear All Drawings */}
            {drawings.length > 0 && (
              <button
                onClick={handleClearDrawings}
                className="p-2 rounded-lg hover:text-[#f43f5e] hover:bg-[#181d28] transition-colors"
                title="Clear All Drawings"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Center Container: Chart Canvas or Depth View */}
        <div className="flex-1 relative flex flex-col overflow-hidden bg-transparent">
          {/* TradingView Status Line HUD (Top-Left of chart canvas) */}
          {chartStyle !== 'depth' && statusCandle && (
            <div className="absolute top-2.5 left-3 z-20 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-mono pointer-events-none select-none">
              {/* Symbol & Exchange */}
              <span className="font-bold text-gray-200">
                {pair.symbol} · {timeframe}
              </span>

              {/* OHLCV metrics */}
              {chartSettings.showOHLC && (
                <div className="flex items-center space-x-2 text-[10px]">
                  <span>
                    <span className="text-gray-500 mr-0.5">O</span>
                    <span className={isUpCandle ? 'text-[#089981]' : 'text-[#f23645]'}>
                      {statusCandle.open.toFixed(pair.precision)}
                    </span>
                  </span>
                  <span>
                    <span className="text-gray-500 mr-0.5">H</span>
                    <span className={isUpCandle ? 'text-[#089981]' : 'text-[#f23645]'}>
                      {statusCandle.high.toFixed(pair.precision)}
                    </span>
                  </span>
                  <span>
                    <span className="text-gray-500 mr-0.5">L</span>
                    <span className={isUpCandle ? 'text-[#089981]' : 'text-[#f23645]'}>
                      {statusCandle.low.toFixed(pair.precision)}
                    </span>
                  </span>
                  <span>
                    <span className="text-gray-500 mr-0.5">C</span>
                    <span className={isUpCandle ? 'text-[#089981]' : 'text-[#f23645]'}>
                      {statusCandle.close.toFixed(pair.precision)}
                    </span>
                  </span>
                </div>
              )}

              {/* Bar Change */}
              {chartSettings.showBarChange && (
                <span className={`text-[10px] font-semibold ${isUpCandle ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                  {statusCandle.change >= 0 ? '+' : ''}{statusCandle.change.toFixed(pair.precision)} (
                  {statusCandle.changePercent >= 0 ? '+' : ''}{statusCandle.changePercent.toFixed(2)}%)
                </span>
              )}

              {/* Volume */}
              {indicators.volume && (
                <span className="text-[10px] text-gray-400">
                  <span className="text-gray-500 mr-0.5">Vol</span>
                  <span>{statusCandle.volume.toFixed(2)}</span>
                </span>
              )}

              {/* Indicators Tags in HUD */}
              <div className="flex items-center space-x-1.5 text-[9px] font-medium">
                {indicators.ema9 && (
                  <span className="text-[#2962FF] bg-[#2962FF]/10 px-1 rounded">EMA 9</span>
                )}
                {indicators.ema21 && (
                  <span className="text-[#FF9800] bg-[#FF9800]/10 px-1 rounded">EMA 21</span>
                )}
                {indicators.sma50 && (
                  <span className="text-[#E91E63] bg-[#E91E63]/10 px-1 rounded">SMA 50</span>
                )}
                {indicators.sma200 && (
                  <span className="text-[#00BCD4] bg-[#00BCD4]/10 px-1 rounded">SMA 200</span>
                )}
              </div>
            </div>
          )}

          {/* Bar Close Countdown Badge (TradingView signature) */}
          {chartStyle !== 'depth' && chartSettings.showCountdown && (
            <div className="absolute top-2.5 right-20 z-20 bg-[#12161f]/90 border border-[#1e2330] px-2 py-0.5 rounded text-[10px] font-mono text-gray-400 shadow-xs pointer-events-none">
              <span className="text-gray-500 mr-1">Bar close:</span>
              <span className="text-white font-bold">{countdownStr}</span>
            </div>
          )}

          {/* Toast Screenshot Notification */}
          {screenshotNotice && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-[#2962FF] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xl animate-in fade-in zoom-in-95 duration-150 flex items-center space-x-2">
              <Camera className="w-3.5 h-3.5" />
              <span>{screenshotNotice}</span>
            </div>
          )}

          {/* Render Depth View or TradingView Canvas */}
          {chartStyle === 'depth' ? (
            <div className="w-full h-full min-h-[350px]">
              <TradingViewDepthChart
                pair={pair}
                orderBookAsks={orderBookAsks}
                orderBookBids={orderBookBids}
              />
            </div>
          ) : (
            <div className="w-full h-full min-h-[350px] relative">
              {/* Primary TradingView Canvas Container */}
              <div
                ref={chartContainerRef}
                className="w-full h-full relative cursor-crosshair"
              />

              {/* Interactive Drawing Canvas / SVG Overlay */}
              {activeDrawingTool !== 'cursor' && (
                <div
                  onMouseDown={handleOverlayMouseDown}
                  onMouseMove={handleOverlayMouseMove}
                  onMouseUp={handleOverlayMouseUp}
                  className="absolute inset-0 z-30 cursor-crosshair"
                >
                  <svg className="w-full h-full pointer-events-none">
                    {/* Render existing drawings */}
                    {drawingsVisible &&
                      drawings.map(d => {
                        if (d.type === 'trendline') {
                          return (
                            <line
                              key={d.id}
                              x1={d.startX}
                              y1={d.startY}
                              x2={d.endX}
                              y2={d.endY}
                              stroke="#2962FF"
                              strokeWidth={2}
                            />
                          );
                        }
                        if (d.type === 'horizontal') {
                          return (
                            <g key={d.id}>
                              <line
                                x1={0}
                                y1={d.startY}
                                x2="100%"
                                y2={d.startY}
                                stroke="#FF9800"
                                strokeWidth={1.5}
                                strokeDasharray="4 4"
                              />
                              <rect
                                x="88%"
                                y={d.startY - 10}
                                width={65}
                                height={20}
                                fill="#FF9800"
                                rx={3}
                              />
                              <text
                                x="92%"
                                y={d.startY + 4}
                                fill="#ffffff"
                                fontSize={10}
                                fontFamily="monospace"
                                fontWeight="bold"
                              >
                                {pair.currentPrice.toFixed(pair.precision)}
                              </text>
                            </g>
                          );
                        }
                        if (d.type === 'position') {
                          const minY = Math.min(d.startY, d.endY);
                          const maxY = Math.max(d.startY, d.endY);
                          const midY = (minY + maxY) / 2;
                          const width = Math.abs(d.endX - d.startX) || 120;
                          const left = Math.min(d.startX, d.endX);
                          return (
                            <g key={d.id}>
                              {/* Target Green Box */}
                              <rect
                                x={left}
                                y={minY}
                                width={width}
                                height={midY - minY}
                                fill="rgba(8, 153, 129, 0.25)"
                                stroke="#089981"
                                strokeWidth={1}
                              />
                              {/* Stop Red Box */}
                              <rect
                                x={left}
                                y={midY}
                                width={width}
                                height={maxY - midY}
                                fill="rgba(242, 54, 69, 0.25)"
                                stroke="#f23645"
                                strokeWidth={1}
                              />
                              <text
                                x={left + 6}
                                y={minY + 14}
                                fill="#089981"
                                fontSize={10}
                                fontWeight="bold"
                              >
                                Target / R:R 2.40
                              </text>
                              <text
                                x={left + 6}
                                y={maxY - 6}
                                fill="#f23645"
                                fontSize={10}
                                fontWeight="bold"
                              >
                                Stop Loss
                              </text>
                            </g>
                          );
                        }
                        if (d.type === 'measure') {
                          const w = Math.abs(d.endX - d.startX);
                          const h = Math.abs(d.endY - d.startY);
                          const left = Math.min(d.startX, d.endX);
                          const top = Math.min(d.startY, d.endY);
                          return (
                            <g key={d.id}>
                              <rect
                                x={left}
                                y={top}
                                width={w}
                                height={h}
                                fill="rgba(41, 98, 255, 0.15)"
                                stroke="#2962FF"
                                strokeDasharray="3 3"
                              />
                              <text
                                x={left + w / 2}
                                y={top + h / 2}
                                fill="#ffffff"
                                fontSize={11}
                                textAnchor="middle"
                                fontFamily="monospace"
                              >
                                Δ {pair.currentPrice.toFixed(pair.precision)} (+2.4%)
                              </text>
                            </g>
                          );
                        }
                        return null;
                      })}

                    {/* Active In-Progress Drawing */}
                    {currentDrawing && (
                      <line
                        x1={currentDrawing.startX}
                        y1={currentDrawing.startY}
                        x2={currentDrawing.endX}
                        y2={currentDrawing.endY}
                        stroke="#2962FF"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                      />
                    )}
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Zoom notification banner */}
          {showCtrlZoomBanner && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2 bg-[#1e88e5] text-white text-[11px] px-3.5 py-1.5 rounded-md shadow-lg pointer-events-auto">
              <span>Press and hold Ctrl while zooming to maintain the chart position</span>
              <button
                onClick={() => setShowCtrlZoomBanner(false)}
                className="hover:text-gray-200 text-white font-bold ml-1 cursor-pointer"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. TRADINGVIEW INDICATORS MODAL */}
      <TradingViewIndicatorsModal
        isOpen={isIndicatorsModalOpen}
        onClose={() => setIsIndicatorsModalOpen(false)}
        indicators={indicators}
        onToggleIndicator={key => setIndicators(prev => ({ ...prev, [key]: !prev[key] }))}
      />

      {/* 4. TRADINGVIEW SETTINGS MODAL */}
      <TradingViewSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={chartSettings}
        onUpdateSettings={newS => setChartSettings(prev => ({ ...prev, ...newS }))}
      />
    </div>
  );
};
