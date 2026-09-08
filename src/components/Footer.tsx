import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Sparkles,
  Send,
  MessageCircle,
  Twitter,
  Youtube,
  Github,
  Linkedin,
  ArrowUpRight,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  Star,
  FileText,
  DollarSign,
  Coins,
  Rocket,
  MessageSquare,
  Search,
  Check
} from 'lucide-react';
import { playSound } from '../utils/sound';

type ActiveModalType = 
  | null 
  | 'about' 
  | 'privacy' 
  | 'terms' 
  | 'reports' 
  | 'announcements' 
  | 'help' 
  | 'feedback' 
  | 'fees' 
  | 'token_info' 
  | 'upcoming';

interface FooterProps {
  onOpenDeposit?: () => void;
  onOpenLogin?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDeposit,
  onShowToast
}) => {
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  
  // Feedback form state
  const [feedbackCategory, setFeedbackCategory] = useState('Feature Request');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Help search state
  const [helpSearch, setHelpSearch] = useState('');

  // Selected token filter in Token Info modal
  const [tokenFilter, setTokenFilter] = useState('All');

  const notify = (msg: string, type: 'success' | 'info' = 'info') => {
    playSound('click');
    if (onShowToast) {
      onShowToast(msg, type);
    }
  };

  const handleOpenModal = (modal: ActiveModalType) => {
    playSound('click');
    setActiveModal(modal);
    setFeedbackSubmitted(false);
  };

  const handleCloseModal = () => {
    playSound('click');
    setActiveModal(null);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    playSound('order_fill');
    setFeedbackSubmitted(true);
    notify('Thank you for your feedback! Our team has received your submission.', 'success');
    setTimeout(() => {
      setFeedbackText('');
      setActiveModal(null);
      setFeedbackSubmitted(false);
    }, 1800);
  };

  const socialLinks = [
    { name: 'X (Twitter)', handle: '@TradeRepublic', icon: Twitter, url: 'https://twitter.com', members: '185K followers' },
    { name: 'Discord', handle: 'Trade Republic Club', icon: MessageCircle, url: 'https://discord.com', members: '48K members' },
    { name: 'Telegram', handle: 'TR Official Crypto', icon: Send, url: 'https://telegram.org', members: '32K subscribers' },
    { name: 'YouTube', handle: 'Trade Republic Academy', icon: Youtube, url: 'https://youtube.com', members: '210K subscribers' },
    { name: 'LinkedIn', handle: 'Trade Republic Bank', icon: Linkedin, url: 'https://linkedin.com', members: '120K followers' },
    { name: 'GitHub', handle: 'TradeRepublic-OSS', icon: Github, url: 'https://github.com', members: 'Open Source APIs' },
  ];

  const tokenList = [
    { symbol: 'BTC', name: 'Bitcoin', consensus: 'Proof of Work (SHA-256)', category: 'Layer 1', supply: '19.7M / 21M BTC', desc: 'The benchmark decentralized digital currency and global reserve asset.' },
    { symbol: 'ETH', name: 'Ethereum', consensus: 'Proof of Stake', category: 'Layer 1 / Smart Contracts', supply: '120.2M ETH', desc: 'The leading decentralized computing platform powering DeFi, NFTs, and Layer 2 rollups.' },
    { symbol: 'SOL', name: 'Solana', consensus: 'Proof of History & PoS', category: 'High-Throughput L1', supply: '468M SOL', desc: 'High-performance blockchain built for widespread mainstream adoption and sub-second finality.' },
    { symbol: 'AVAX', name: 'Avalanche', consensus: 'Avalanche Consensus', category: 'Multi-Subnet L1', supply: '395M AVAX', desc: 'Subnet architecture powering custom appchains with institutional compliance.' },
    { symbol: 'SUI', name: 'Sui', consensus: 'Mysticeti DAG / Move', category: 'Object-Centric L1', supply: '2.8B SUI', desc: 'High-speed object-oriented blockchain designed for composable financial applications.' },
    { symbol: 'NEAR', name: 'NEAR Protocol', consensus: 'Nightshade Sharding', category: 'AI & User-Owned Web', supply: '1.2B NEAR', desc: 'Sharded blockchain optimized for AI agents and seamless account abstraction.' },
  ];

  const filteredTokens = tokenFilter === 'All' 
    ? tokenList 
    : tokenList.filter(t => t.category.toLowerCase().includes(tokenFilter.toLowerCase()));

  const helpFaqs = [
    { q: 'How do crypto settlements work on Trade Republic?', a: 'All crypto transactions are executed directly with institutional European liquidity partners. Custody is securely managed in cold storage adhering to BaFin and MiCA standards.' },
    { q: 'What is the €1 flat external settlement fee?', a: 'Unlike traditional platforms charging 1.5% to 3% variable commissions, Trade Republic charges €0 trading commission and a flat €1 per order to cover third-party clearing, custody, and settlement.' },
    { q: 'Are deposits protected under the statutory guarantee?', a: 'Cash deposits are held in escrow partner accounts (such as Deutsche Bank and J.P. Morgan) and are legally protected up to €100,000 per investor by the German Deposit Guarantee Scheme (EdB).' },
    { q: 'Can I automate crypto investments with a Sparplan?', a: 'Yes! You can set up zero-fee recurring savings plans (Sparplan) for Bitcoin, Ethereum, Solana, and more on a weekly, bi-weekly, or monthly schedule with as little as €1.' },
  ].filter(f => f.q.toLowerCase().includes(helpSearch.toLowerCase()) || f.a.toLowerCase().includes(helpSearch.toLowerCase()));

  return (
    <>
      {/* 4-Column Translucent Global Footer at the end of the site */}
      <footer 
        id="app-global-footer"
        className="w-full shrink-0 border-t border-white/[0.10] bg-white/[0.03] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.06)] text-gray-400 font-republic select-none relative z-20 overflow-hidden transition-all"
      >
        {/* Subtle glass specular highlight overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
          {/* Main 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Column 1: Logo & Brand Information (col-span-12 lg:col-span-3) */}
            <div className="lg:col-span-3 flex flex-col space-y-2.5">
              {/* Brand Logo & Name */}
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-xs text-black shrink-0">
                  <span className="font-republic-display text-xs font-black tracking-tighter">TR</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-republic-display font-extrabold text-xs tracking-tight text-white uppercase">
                    TRADE REPUBLIC
                  </span>
                  <span className="text-[9px] font-republic-mono text-gray-400 tracking-wider uppercase">
                    BANK • CRYPTO
                  </span>
                </div>
              </div>

              {/* Brief Tagline */}
              <p className="text-[11px] text-gray-400 leading-normal max-w-xs">
                Europe’s regulated digital asset & wealth accumulation bank.
              </p>

              {/* Copyright */}
              <div className="text-[10px] text-gray-400 pt-0.5 font-republic">
                © 2026 Trade Republic Bank GmbH
              </div>
            </div>

            {/* Column 2: (About us, Privacy policy, Terms of use, Market reports, Announcements) (col-span-6 lg:col-span-3) */}
            <div className="lg:col-span-3 flex flex-col space-y-2.5">
              <h4 className="font-republic-display font-extrabold text-xs uppercase tracking-wider text-white">
                Company & Legal
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenModal('about')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    About us
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenModal('privacy')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Privacy policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenModal('terms')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Terms of use
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenModal('reports')}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center space-x-1"
                  >
                    <span>Market reports</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold">NEW</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenModal('announcements')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Announcements
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: (Help center, Feedback, Fees, Token/Coin infor, Upcoming features) (col-span-6 lg:col-span-3) */}
            <div className="lg:col-span-3 flex flex-col space-y-2.5">
              <h4 className="font-republic-display font-extrabold text-xs uppercase tracking-wider text-white">
                Support & Info
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenModal('help')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Help center
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenModal('feedback')}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center space-x-1"
                  >
                    <span>Feedback</span>
                    <span className="px-1.5 py-0.2 rounded bg-white/10 text-gray-300 text-[9px] font-mono">Form</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenModal('fees')}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center space-x-1"
                  >
                    <span>Fees</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">€1 flat</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenModal('token_info')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Token/Coin infor
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenModal('upcoming')}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center space-x-1"
                  >
                    <span>Upcoming features</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Join the community with different social media logos (col-span-12 lg:col-span-3) */}
            <div className="lg:col-span-3 flex flex-col space-y-2.5">
              <h4 className="font-republic-display font-extrabold text-xs uppercase tracking-wider text-white">
                Join the community
              </h4>
              <p className="text-[11px] text-gray-400 leading-normal">
                Connect with over 4M European investors across our verified channels.
              </p>

              {/* Social Media Logos Grid */}
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <button
                      key={social.name}
                      type="button"
                      onClick={() => notify(`Opening Trade Republic community on ${social.name}`)}
                      title={`${social.name} (${social.members})`}
                      className="group flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5 text-gray-300 group-hover:text-white transition-colors" />
                      <span className="text-[9px] text-gray-400 group-hover:text-white font-medium mt-1 truncate max-w-[55px]">
                        {social.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* Interactive Modals for all requested Column 2 & Column 3 links */}
      {/* ========================================================================= */}

      {/* 1. About Us Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0e14]/95 border border-white/[0.12] rounded-2xl max-w-lg w-full p-6 shadow-2xl backdrop-blur-3xl text-white font-republic space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold text-xs">
                  TR
                </div>
                <div>
                  <h3 className="font-bold text-base">About Trade Republic</h3>
                  <p className="text-[11px] text-gray-400">Europe’s Largest Digital Asset Bank</p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-300 space-y-3.5 leading-relaxed">
              <p>
                Founded in 2015, <strong className="text-white">Trade Republic Bank GmbH</strong> is a full-service European credit institution licensed by the European Central Bank (ECB) and supervised by BaFin and the Deutsche Bundesbank.
              </p>
              <div className="grid grid-cols-2 gap-3 p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-center">
                <div>
                  <div className="text-lg font-extrabold text-white font-mono">4,000,000+</div>
                  <div className="text-[10px] text-gray-400">European Customers</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-white font-mono">€35+ Billion</div>
                  <div className="text-[10px] text-gray-400">Assets Under Administration</div>
                </div>
              </div>
              <p>
                Our mission is to empower everyone to build long-term wealth through accessible, fair, and transparent financial technology with zero commissions and direct bank-grade custody.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={handleCloseModal} className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0e14]/95 border border-white/[0.12] rounded-2xl max-w-lg w-full p-6 shadow-2xl backdrop-blur-3xl text-white font-republic space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Privacy Policy (GDPR)</h3>
              </div>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-300 space-y-3 leading-relaxed">
              <p>
                Trade Republic Bank GmbH complies strictly with the European General Data Protection Regulation (EU GDPR) and the German Federal Data Protection Act (BDSG).
              </p>
              <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-2">
                <div className="font-semibold text-white">Our Privacy Commitments:</div>
                <ul className="list-disc pl-4 space-y-1 text-gray-400">
                  <li>Zero sale of personal or trading data to third-party advertisers.</li>
                  <li>End-to-end cryptographic encryption for financial records and transactions.</li>
                  <li>EU-only sovereign server data residency in Frankfurt, Germany.</li>
                </ul>
              </div>
              <p className="text-[11px] text-gray-400">
                You retain full statutory rights to data portability, modification, and deletion pursuant to Articles 15–21 GDPR.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={handleCloseModal} className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200">
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Terms of Use Modal */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0e14]/95 border border-white/[0.12] rounded-2xl max-w-lg w-full p-6 shadow-2xl backdrop-blur-3xl text-white font-republic space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">Terms of Use & Execution Policy</h3>
              </div>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-300 space-y-3 leading-relaxed">
              <p>
                By accessing Trade Republic’s Spot and Perpetual trading interfaces, you agree to the customer agreement and relevant European MiCA digital asset directives.
              </p>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1 text-amber-200">
                <div className="font-bold text-xs">Risk Notice:</div>
                <p className="text-[11px] leading-relaxed">
                  Cryptographic assets are speculative instruments. Prices can fluctuate unpredictably. Past performance is not an indicator of future results. Never invest capital you cannot afford to lose.
                </p>
              </div>
              <p className="text-[11px] text-gray-400">
                All order executions are routed through best-execution institutional European venues with instant clearing.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={handleCloseModal} className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200">
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Market Reports Modal */}
      {activeModal === 'reports' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0e14]/95 border border-white/[0.12] rounded-2xl max-w-lg w-full p-6 shadow-2xl backdrop-blur-3xl text-white font-republic space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Weekly Market Reports & Research</h3>
              </div>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-300 space-y-3 leading-relaxed">
              <div className="p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-2">
                <div className="flex justify-between items-center text-white font-bold">
                  <span>Q3 Digital Asset Macro Outlook</span>
                  <span className="text-[10px] font-mono text-emerald-400">PDF • 14 Pages</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Institutional inflows, Bitcoin exchange reserve drawdowns, and Ethereum L2 TVL growth analysis.
                </p>
              </div>

              <div className="p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-2">
                <div className="flex justify-between items-center text-white font-bold">
                  <span>Solana & High-Throughput L1 Sector Analysis</span>
                  <span className="text-[10px] font-mono text-emerald-400">Research Brief</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  DEX volume flippening, DeFi yield dynamics, and validator decentralization metrics.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={handleCloseModal} className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Announcements Modal */}
      {activeModal === 'announcements' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0e14]/95 border border-white/[0.12] rounded-2xl max-w-lg w-full p-6 shadow-2xl backdrop-blur-3xl text-white font-republic space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <Rocket className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">Platform Announcements</h3>
              </div>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-300 space-y-3 leading-relaxed">
              <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">v2.6 Pro Terminal Launched</span>
                  <span className="text-[10px] text-gray-400 font-mono">Today</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Introducing the unified trading board, full TradingView candlestick engine, depth chart visualizer, and customizable viewport scaling.
                </p>
              </div>
              <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">3.75% Interest on Uninvested Cash</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Active</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Earn statutory interest credited monthly directly to your cash wallet balance.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={handleCloseModal} className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Help Center Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0e14]/95 border border-white/[0.12] rounded-2xl max-w-lg w-full p-6 shadow-2xl backdrop-blur-3xl text-white font-republic space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Help Center & FAQ</h3>
              </div>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={helpSearch}
                onChange={(e) => setHelpSearch(e.target.value)}
                placeholder="Search articles (fees, custody, deposits, sparplan)..."
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-hidden focus:border-white/40"
              />
            </div>

            {/* FAQ Accordion Items */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {helpFaqs.map((faq, i) => (
                <div key={i} className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-1">
                  <div className="font-bold text-white text-xs">{faq.q}</div>
                  <div className="text-[11px] text-gray-400 leading-relaxed">{faq.a}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-[11px] text-gray-400">Need human support? Average response: &lt; 5 mins</span>
              <button onClick={handleCloseModal} className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Feedback Modal */}
      {activeModal === 'feedback' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0e14]/95 border border-white/[0.12] rounded-2xl max-w-md w-full p-6 shadow-2xl backdrop-blur-3xl text-white font-republic space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">Share Your Feedback</h3>
              </div>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-white">Feedback Received!</div>
                <p className="text-xs text-gray-400">Thank you for helping us improve Trade Republic.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Category</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full bg-[#121620] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden"
                  >
                    <option value="Feature Request">Feature Request</option>
                    <option value="Trading UI/UX">Trading UI/UX Feedback</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="General Suggestion">General Suggestion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Rating</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= feedbackRating ? 'fill-amber-400' : 'text-gray-400'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Your comments</label>
                  <textarea
                    rows={3}
                    required
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us what you love or what we can build next..."
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl p-3 text-xs text-white placeholder-gray-400 focus:outline-hidden focus:border-white/40"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-white/[0.08] text-white text-xs font-bold rounded-xl hover:bg-white/[0.12]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white text-black text-xs font-extrabold rounded-xl hover:bg-gray-200 shadow-md font-republic-display"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 8. Fees Schedule Modal */}
      {activeModal === 'fees' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0e14]/95 border border-white/[0.12] rounded-2xl max-w-lg w-full p-6 shadow-2xl backdrop-blur-3xl text-white font-republic space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Trade Republic Pricing & Fee Schedule</h3>
              </div>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-300 space-y-3 leading-relaxed">
              <div className="p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-2.5">
                <div className="flex justify-between items-center py-1 border-b border-white/[0.06]">
                  <span>Order Commission</span>
                  <span className="font-mono text-emerald-400 font-bold">€0.00 (Zero Commission)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/[0.06]">
                  <span>Third-Party Settlement Fee</span>
                  <span className="font-mono text-white font-bold">€1.00 flat per trade</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/[0.06]">
                  <span>Crypto Savings Plan (Sparplan)</span>
                  <span className="font-mono text-emerald-400 font-bold">€0.00 (Free Execution)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/[0.06]">
                  <span>Custody & Account Maintenance</span>
                  <span className="font-mono text-emerald-400 font-bold">€0.00 / month</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Interest Paid on Cash</span>
                  <span className="font-mono text-emerald-400 font-bold">+3.75% p.a.</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400">
                100% transparent pricing with no hidden spread markups or inactivity penalties.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={handleCloseModal} className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Token/Coin Info Modal */}
      {activeModal === 'token_info' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0e14]/95 border border-white/[0.12] rounded-2xl max-w-xl w-full p-6 shadow-2xl backdrop-blur-3xl text-white font-republic space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Token & Coin Specifications</h3>
              </div>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter pills */}
            <div className="flex space-x-2 text-xs">
              {['All', 'Layer 1', 'Smart Contracts'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setTokenFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    tokenFilter === cat ? 'bg-white text-black border-white font-bold' : 'bg-white/[0.04] text-gray-400 border-white/[0.08] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
              {filteredTokens.map(token => (
                <div key={token.symbol} className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-white font-mono text-sm">{token.symbol}</span>
                      <span className="text-gray-400">• {token.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-gray-300">
                      {token.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 leading-relaxed">{token.desc}</div>
                  <div className="flex justify-between text-[10px] text-gray-400 pt-1 border-t border-white/[0.04]">
                    <span>Consensus: {token.consensus}</span>
                    <span className="font-mono">Supply: {token.supply}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={handleCloseModal} className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Upcoming Features Modal */}
      {activeModal === 'upcoming' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0e14]/95 border border-white/[0.12] rounded-2xl max-w-lg w-full p-6 shadow-2xl backdrop-blur-3xl text-white font-republic space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <Rocket className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base">Trade Republic Product Roadmap</h3>
              </div>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-300 space-y-3 leading-relaxed">
              <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Native Proof-of-Stake Staking</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">Testing</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Earn protocol rewards on ETH, SOL, and AVAX directly into your cash wallet balance.
                </p>
              </div>

              <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Automated Tax Reporting (FIFO)</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px]">In Development</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  One-click export of German and European tax certificates with certified cost basis calculations.
                </p>
              </div>

              <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Hardware Key FIDO2 & WebAuthn</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono text-[10px]">Planned</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Physical security key support (Yubikey, Apple Touch ID) for large institutional withdrawals.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={handleCloseModal} className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
