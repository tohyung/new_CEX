import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { playSound } from '../utils/sound';

export interface TVChartSettings {
  upColor: string;
  downColor: string;
  showGrid: boolean;
  gridStyle: 'dotted' | 'dashed' | 'none';
  showWatermark: boolean;
  showCountdown: boolean;
  showOHLC: boolean;
  showBarChange: boolean;
  priceLine: boolean;
}

interface TradingViewSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TVChartSettings;
  onUpdateSettings: (newSettings: Partial<TVChartSettings>) => void;
}

export const TradingViewSettingsModal: React.FC<TradingViewSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'symbol' | 'status' | 'scales' | 'canvas'>('symbol');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 font-republic select-none animate-in fade-in duration-150">
      <div className="bg-[#131722] border border-[#2a2e39] rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-12 px-4 border-b border-[#2a2e39] flex items-center justify-between bg-[#1e222d]">
          <span className="text-white font-bold text-sm tracking-wide font-republic-display">
            Chart Settings
          </span>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#2a2e39] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2a2e39] bg-[#1e222d]/50 text-xs">
          {[
            { id: 'symbol', label: 'Symbol / Candles' },
            { id: 'status', label: 'Status Line' },
            { id: 'scales', label: 'Scales' },
            { id: 'canvas', label: 'Canvas' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 text-center font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#2962FF] text-white font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-4 text-xs">
          {activeTab === 'symbol' && (
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 block mb-1.5 font-semibold">Candle Body Colors</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 bg-[#1e222d] p-2 rounded-lg border border-[#2a2e39]">
                    <span className="text-gray-400 text-[11px]">Bullish (Up):</span>
                    <input
                      type="color"
                      value={settings.upColor}
                      onChange={e => onUpdateSettings({ upColor: e.target.value })}
                      className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-white text-[11px]">{settings.upColor}</span>
                  </div>

                  <div className="flex items-center space-x-2 bg-[#1e222d] p-2 rounded-lg border border-[#2a2e39]">
                    <span className="text-gray-400 text-[11px]">Bearish (Down):</span>
                    <input
                      type="color"
                      value={settings.downColor}
                      onChange={e => onUpdateSettings({ downColor: e.target.value })}
                      className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-white text-[11px]">{settings.downColor}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2a2e39] space-y-2">
                <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.priceLine}
                    onChange={e => onUpdateSettings({ priceLine: e.target.checked })}
                    className="accent-[#2962FF] rounded"
                  />
                  <span>Show Real-Time Last Price Line</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showOHLC}
                  onChange={e => onUpdateSettings({ showOHLC: e.target.checked })}
                  className="accent-[#2962FF] rounded"
                />
                <span>Show Open, High, Low, Close (OHLC) values</span>
              </label>

              <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showBarChange}
                  onChange={e => onUpdateSettings({ showBarChange: e.target.checked })}
                  className="accent-[#2962FF] rounded"
                />
                <span>Show Bar Change Values (%)</span>
              </label>
            </div>
          )}

          {activeTab === 'scales' && (
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showCountdown}
                  onChange={e => onUpdateSettings({ showCountdown: e.target.checked })}
                  className="accent-[#2962FF] rounded"
                />
                <span>Countdown to Current Bar Close</span>
              </label>
            </div>
          )}

          {activeTab === 'canvas' && (
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 block mb-1.5 font-semibold">Grid Lines</label>
                <div className="flex space-x-2">
                  {(['dotted', 'dashed', 'none'] as const).map(style => (
                    <button
                      key={style}
                      onClick={() => onUpdateSettings({ gridStyle: style, showGrid: style !== 'none' })}
                      className={`px-3 py-1.5 rounded-lg border capitalize transition-colors ${
                        settings.gridStyle === style
                          ? 'bg-[#2962FF] text-white border-[#2962FF]'
                          : 'bg-[#1e222d] text-gray-300 border-[#2a2e39] hover:text-white'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#2a2e39]">
                <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showWatermark}
                    onChange={e => onUpdateSettings({ showWatermark: e.target.checked })}
                    className="accent-[#2962FF] rounded"
                  />
                  <span>Show Symbol Background Watermark</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#2a2e39] bg-[#1e222d] flex justify-end">
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="px-4 py-1.5 bg-[#2962FF] hover:bg-[#1e53e5] text-white font-bold rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
