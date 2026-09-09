import React, { useState } from 'react';
import { X, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { playSound } from '../utils/sound';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setIsLoading(true);
    playSound('click');

    setTimeout(() => {
      setIsLoading(false);
      const name = email.split('@')[0] || 'Trader';
      onLoginSuccess({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
      });
      onClose();
    }, 600);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    playSound('click');
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: 'Alex Trader',
        email: 'alex.trader@traderepublic.com',
      });
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-republic">
      <div 
        id="login-modal-card"
        className="bg-[#12161f]/95 backdrop-blur-2xl border border-white/[0.12] rounded-3xl max-w-md w-full p-6 sm:p-7 relative shadow-[0_25px_60px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          id="close-login-modal-btn"
          onClick={() => {
            playSound('click');
            onClose();
          }}
          className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-white rounded-full bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/[0.10] flex items-center justify-center mb-3.5 shadow-xs">
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-republic-display font-black text-white tracking-tight">
            Log in to PTIT Exchange
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Access your crypto portfolio, €0 fee savings plans, and 3.75% cash interest.
          </p>
        </div>

        {/* Quick 1-Click Demo Login */}
        <button
          type="button"
          id="demo-login-quick-btn"
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full py-2.5 px-4 mb-4 bg-white hover:bg-gray-200 text-black rounded-xl text-xs font-republic-display font-black flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Quick Demo Log In</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-white/[0.08] w-full" />
          <span className="bg-[#12161f] px-3 text-[11px] text-gray-500 font-medium uppercase tracking-wider absolute">
            or with email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-gray-400 mb-1 block">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3" />
              <input
                type="email"
                id="login-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/[0.08] transition-all font-republic"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-semibold text-gray-400">PIN / Password</label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[10px] text-gray-400 hover:text-white">
                Forgot PIN?
              </a>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3" />
              <input
                type="password"
                id="login-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/[0.08] transition-all font-republic"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 text-xs text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-0"
              />
              <span>Keep me signed in</span>
            </label>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-98 flex items-center justify-center space-x-2 font-republic-display mt-2"
          >
            <span>{isLoading ? 'Authenticating...' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Regulatory Badge */}
        <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-center space-x-2 text-[11px] text-gray-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Regulated European Banking Security Standard</span>
        </div>
      </div>
    </div>
  );
};
