import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Coins, 
  RefreshCw, 
  QrCode, 
  ShieldCheck, 
  ArrowRight,
  Zap
} from 'lucide-react';
import { playSound } from '../utils/sound';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimFaucet: (asset: string, amount: number) => void;
  onResetBalance: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onClaimFaucet,
  onResetBalance
}) => {
  const [selectedAsset, setSelectedAsset] = useState<string>('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('TRC20');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const demoAddresses: Record<string, string> = {
    TRC20: 'TX8uVb9jH7yP2KqA3sD5fG7hJ9kL2mN4pQ',
    ERC20: '0x71C...498d9e2A832644773A52e07e4e377404',
    Arbitrum: '0x71C...498d9e2A832644773A52e07e4e377404',
    Solana: '7XwK3n2B9pQ8mR1sT4uV5wY6zA7bC8dE9fG'
  };

  const copyToClipboard = () => {
    playSound('click');
    navigator.clipboard.writeText(demoAddresses[selectedNetwork] || '0x71C498d9e2A832644773A52e07e4e377404');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-republic">
      <div className="bg-[#12161f] border border-[#1e2330] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-[#12161f] border-b border-[#1e2330] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-white" />
            <h3 className="font-republic-display font-bold text-white text-sm">Deposit & Demo Faucet</h3>
          </div>
          <button
            id="deposit-modal-close-btn"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#181d28] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Instant Demo Faucet Section */}
          <div className="bg-[#181d28] border border-[#1e2330] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white text-xs flex items-center space-x-1 font-republic-display">
                <Zap className="w-3.5 h-3.5 text-white" />
                <span>Instant Testnet Faucet</span>
              </span>
              <span className="text-[10px] text-gray-400 font-republic-mono">1-click credited</span>
            </div>
            <p className="text-[11px] text-gray-300 mb-3">
              Add risk-free simulated test funds to test spot and 100x futures margin trades:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="faucet-usdt-btn"
                onClick={() => {
                  playSound('order_fill');
                  onClaimFaucet('USDT', 10000);
                }}
                className="py-2.5 px-3 bg-[#12161f] hover:bg-[#202838] hover:border-white border border-[#1e2330] rounded-xl text-left transition-all group"
              >
                <div className="text-[10px] text-gray-400 group-hover:text-gray-200 font-republic-mono">+10,000</div>
                <div className="font-bold text-white text-xs font-republic-display">USDT Cash</div>
              </button>

              <button
                id="faucet-btc-btn"
                onClick={() => {
                  playSound('order_fill');
                  onClaimFaucet('BTC', 0.5);
                }}
                className="py-2.5 px-3 bg-[#12161f] hover:bg-[#202838] hover:border-white border border-[#1e2330] rounded-xl text-left transition-all group"
              >
                <div className="text-[10px] text-gray-400 group-hover:text-gray-200 font-republic-mono">+0.50</div>
                <div className="font-bold text-white text-xs font-republic-display">Bitcoin (BTC)</div>
              </button>

              <button
                id="faucet-eth-btn"
                onClick={() => {
                  playSound('order_fill');
                  onClaimFaucet('ETH', 5.0);
                }}
                className="py-2.5 px-3 bg-[#12161f] hover:bg-[#202838] hover:border-white border border-[#1e2330] rounded-xl text-left transition-all group"
              >
                <div className="text-[10px] text-gray-400 group-hover:text-gray-200 font-republic-mono">+5.00</div>
                <div className="font-bold text-white text-xs font-republic-display">Ethereum (ETH)</div>
              </button>

              <button
                id="faucet-sol-btn"
                onClick={() => {
                  playSound('order_fill');
                  onClaimFaucet('SOL', 50.0);
                }}
                className="py-2.5 px-3 bg-[#12161f] hover:bg-[#202838] hover:border-white border border-[#1e2330] rounded-xl text-left transition-all group"
              >
                <div className="text-[10px] text-gray-400 group-hover:text-gray-200 font-republic-mono">+50.0</div>
                <div className="font-bold text-white text-xs font-republic-display">Solana (SOL)</div>
              </button>
            </div>
          </div>

          {/* Deposit Network & Simulated Address */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-gray-200 font-republic-display">Simulated Blockchain Address</div>

            {/* Network Selector */}
            <div className="flex items-center space-x-1.5">
              {['TRC20', 'ERC20', 'Arbitrum', 'Solana'].map(net => (
                <button
                  key={net}
                  onClick={() => {
                    playSound('click');
                    setSelectedNetwork(net);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-republic-mono font-medium transition-colors ${
                    selectedNetwork === net
                      ? 'bg-white text-black font-extrabold shadow-xs'
                      : 'bg-[#181d28] text-gray-400 hover:text-white border border-[#1e2330]'
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>

            {/* Address box */}
            <div className="bg-[#0e121a] border border-[#1e2330] rounded-xl p-3 flex items-center justify-between">
              <div className="truncate mr-2 font-republic-mono text-xs text-gray-300">
                {demoAddresses[selectedNetwork]}
              </div>
              <button
                onClick={copyToClipboard}
                className="p-1.5 bg-[#181d28] hover:bg-[#202838] text-gray-300 hover:text-white rounded-lg border border-[#1e2330] shrink-0 flex items-center space-x-1 text-[10px] font-republic-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-2 border-t border-[#1e2330] flex items-center justify-between">
            <button
              onClick={() => {
                playSound('cancel');
                onResetBalance();
              }}
              className="text-[11px] text-gray-400 hover:text-white flex items-center space-x-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset to default starting portfolio</span>
            </button>

            <button
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="px-4 py-1.5 bg-white hover:bg-gray-200 text-black text-xs font-extrabold rounded-xl transition-colors font-republic-display"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
