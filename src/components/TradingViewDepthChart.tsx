import React, { useRef, useEffect } from 'react';
import { TradingPair, OrderBookLevel } from '../types';

interface TradingViewDepthChartProps {
  pair: TradingPair;
  orderBookAsks: OrderBookLevel[];
  orderBookBids: OrderBookLevel[];
}

export const TradingViewDepthChart: React.FC<TradingViewDepthChartProps> = ({
  pair,
  orderBookAsks,
  orderBookBids,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // TradingView Dark background
    ctx.fillStyle = '#0b0e14';
    ctx.fillRect(0, 0, width, height);

    if (orderBookBids.length === 0 || orderBookAsks.length === 0) return;

    const midX = width / 2;
    const maxDepthH = height - 30;

    // Grid lines
    ctx.strokeStyle = '#1e222d';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    for (let i = 1; i <= 4; i++) {
      const y = (maxDepthH / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    const sortedBids = [...orderBookBids].sort((a, b) => b.price - a.price);
    const sortedAsks = [...orderBookAsks].sort((a, b) => a.price - b.price);

    const maxBidTotal = sortedBids[sortedBids.length - 1]?.total || 1;
    const maxAskTotal = sortedAsks[sortedAsks.length - 1]?.total || 1;
    const maxTotal = Math.max(maxBidTotal, maxAskTotal);

    // Green Bids Area (Left)
    ctx.fillStyle = 'rgba(8, 153, 129, 0.2)';
    ctx.strokeStyle = '#089981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, maxDepthH);

    sortedBids.forEach((bid, i) => {
      const x = midX - (i / sortedBids.length) * midX;
      const y = maxDepthH - (bid.total / maxTotal) * (maxDepthH - 40);
      ctx.lineTo(x, y);
    });

    ctx.lineTo(midX, maxDepthH - (sortedBids[0]?.total / maxTotal) * (maxDepthH - 40));
    ctx.lineTo(midX, maxDepthH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red Asks Area (Right)
    ctx.fillStyle = 'rgba(242, 54, 69, 0.2)';
    ctx.strokeStyle = '#f23645';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX, maxDepthH);

    sortedAsks.forEach((ask, i) => {
      const x = midX + (i / sortedAsks.length) * midX;
      const y = maxDepthH - (ask.total / maxTotal) * (maxDepthH - 40);
      ctx.lineTo(x, y);
    });

    ctx.lineTo(width, maxDepthH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Mid Price Divider & Label
    ctx.strokeStyle = '#2a2e39';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(midX, 20);
    ctx.lineTo(midX, maxDepthH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Header badge
    ctx.fillStyle = '#1e222d';
    ctx.beginPath();
    ctx.roundRect(midX - 80, 10, 160, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#2a2e39';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Mid: $${pair.currentPrice.toFixed(pair.precision)}`,
      midX,
      26
    );

    // X-Axis labels
    ctx.fillStyle = '#787b86';
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`$${sortedBids[sortedBids.length - 1]?.price.toFixed(pair.precision)}`, 10, height - 10);

    ctx.textAlign = 'right';
    ctx.fillText(`$${sortedAsks[sortedAsks.length - 1]?.price.toFixed(pair.precision)}`, width - 10, height - 10);
  }, [orderBookAsks, orderBookBids, pair]);

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
