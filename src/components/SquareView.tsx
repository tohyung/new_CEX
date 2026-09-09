import React, { useState } from 'react';
import { 
  Compass, 
  Flame, 
  TrendingUp, 
  Search, 
  Clock, 
  Share2, 
  Bookmark, 
  ThumbsUp, 
  MessageSquare, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2,
  Filter,
  Eye,
  Hash
} from 'lucide-react';
import { TradingPair } from '../types';
import { playSound } from '../utils/sound';

interface SquareViewProps {
  currentPair: TradingPair;
  onSelectPair: (pair: TradingPair) => void;
  onSwitchToTrade: () => void;
}

interface SquareArticle {
  id: string;
  author: string;
  handle: string;
  verified: boolean;
  avatar: string;
  time: string;
  category: string;
  title: string;
  summary: string;
  symbol?: string;
  likes: number;
  views: number;
  comments: number;
  tags: string[];
  isLiked?: boolean;
}

const SQUARE_ARTICLES: SquareArticle[] = [
  {
    id: 'sq-1',
    author: 'PTIT Exchange Research',
    handle: '@TR_Research',
    verified: true,
    avatar: 'TR',
    time: '22m ago',
    category: 'Macro & Institutional',
    title: 'Spot Bitcoin ETF Net Inflows Cross $1.2B In Single Week As Liquidity Broadens',
    summary: 'Institutional allocation accelerated across regulated custody desks. CME futures open interest reached multi-month highs alongside declining exchange reserves, signaling high conviction spot accumulation rather than delta-hedged basis trading.',
    symbol: 'BTC/USDT',
    likes: 312,
    views: 4890,
    comments: 42,
    tags: ['#Bitcoin', '#ETF', '#Macro', '#Institutional']
  },
  {
    id: 'sq-2',
    author: 'OnChain Intel',
    handle: '@OnchainIntel',
    verified: true,
    avatar: 'OI',
    time: '1h ago',
    category: 'Derivatives & Flows',
    title: 'Perpetual Funding Rate Reset Signals Clean Slate For Momentum Breakouts',
    summary: 'Over-leveraged long liquidations cleared out clustered stop-losses at the $76,800 band. Open interest has re-anchored at sustainable levels with cross-exchange basis holding positive.',
    symbol: 'BTC/USDT',
    likes: 198,
    views: 2940,
    comments: 18,
    tags: ['#Derivatives', '#Funding', '#Liquidity']
  },
  {
    id: 'sq-3',
    author: 'Solana Ecosystem Watch',
    handle: '@SolanaWatch',
    verified: false,
    avatar: 'SW',
    time: '2h ago',
    category: 'Layer 1 & Ecosystem',
    title: 'Solana DEX Volume Flips Major Competitors With 24H Swaps Exceeding $3.8B',
    summary: 'Active wallets on decentralized exchanges surged by 34% week-on-week, led by memecoin velocity and decentralized infrastructure (DePIN) bandwidth tokens.',
    symbol: 'SOL/USDT',
    likes: 154,
    views: 2120,
    comments: 26,
    tags: ['#Solana', '#DeFi', '#DEX']
  },
  {
    id: 'sq-4',
    author: 'Crypto Economy Daily',
    handle: '@CryptoDaily',
    verified: true,
    avatar: 'CD',
    time: '4h ago',
    category: 'Market Intelligence',
    title: 'Global Central Bank Easing Cycle: Historical Precedents for Digital Assets',
    summary: 'Examining global liquidity cycles (M2 money supply expansion) and their direct statistical correlation with risk assets over rolling 180-day holding periods.',
    likes: 245,
    views: 3780,
    comments: 31,
    tags: ['#MacroEconomy', '#Liquidity', '#CentralBanks']
  }
];

const TRENDING_TOPICS = [
  { tag: '#BitcoinHalving', posts: '142.5k posts', hot: true },
  { tag: '#ETFInflows', posts: '89.2k posts', hot: true },
  { tag: '#SolanaEcosystem', posts: '64.1k posts', hot: false },
  { tag: '#Layer2Rollups', posts: '43.8k posts', hot: false },
  { tag: '#FedRateCuts', posts: '38.2k posts', hot: false }
];

export const SquareView: React.FC<SquareViewProps> = ({
  currentPair,
  onSelectPair,
  onSwitchToTrade
}) => {
  const [articles, setArticles] = useState<SquareArticle[]>(SQUARE_ARTICLES);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Macro & Institutional', 'Derivatives & Flows', 'Layer 1 & Ecosystem', 'Market Intelligence'];

  const handleLike = (id: string) => {
    playSound('click');
    setArticles(prev => prev.map(a => {
      if (a.id === id) {
        const isLiked = !a.isLiked;
        return {
          ...a,
          isLiked,
          likes: isLiked ? a.likes + 1 : a.likes - 1
        };
      }
      return a;
    }));
  };

  const filteredArticles = articles.filter(a => {
    const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
    const matchesSearch = !searchQuery || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#07090e] text-white p-4 sm:p-6 lg:p-8 font-republic select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Square Banner */}
        <div className="bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Square Feeds
              </span>
              <span className="text-xs text-gray-400 font-republic-mono">
                Curated News & Alpha Intelligence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-republic-display font-extrabold tracking-tight mt-2 text-white">
              Crypto Square
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Follow top market analysts, breaking institutional alerts, on-chain metrics, and social pulse.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, tags..."
                className="bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-white/20 w-48 sm:w-64 transition-all"
              />
            </div>

            <button
              onClick={() => {
                playSound('click');
                onSwitchToTrade();
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white text-black font-extrabold text-xs font-republic-display shadow-md hover:bg-gray-100 transition-all active:scale-95"
            >
              <span>Trade Now</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Grid: Feed (8 cols) + Trending & Featured (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Feed */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Category Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    playSound('click');
                    setActiveCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-white text-black font-extrabold shadow-xs'
                      : 'bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Articles List */}
            <div className="space-y-4">
              {filteredArticles.map(article => (
                <article
                  key={article.id}
                  className="bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-3.5 transition-all hover:border-white/[0.14]"
                >
                  {/* Article Author Strip */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                        {article.avatar}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-white">{article.author}</span>
                          {article.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                          )}
                          <span className="text-[10px] text-gray-500">{article.handle}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-gray-400">
                          <span>{article.time}</span>
                          <span>•</span>
                          <span className="text-amber-400/90 font-medium">{article.category}</span>
                        </div>
                      </div>
                    </div>

                    {article.symbol && (
                      <button
                        onClick={() => {
                          playSound('click');
                          onSwitchToTrade();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/15 border border-white/[0.10] text-xs font-republic-mono text-white font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <span>{article.symbol}</span>
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      </button>
                    )}
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white hover:text-amber-400 transition-colors leading-snug">
                      {article.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mt-2">
                      {article.summary}
                    </p>
                  </div>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {article.tags.map(tag => (
                      <span
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="text-[11px] text-gray-400 hover:text-white bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer & Engagement */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-xs text-gray-400">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(article.id)}
                        className={`flex items-center space-x-1.5 transition-colors cursor-pointer ${
                          article.isLiked ? 'text-rose-400 font-bold' : 'hover:text-white'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${article.isLiked ? 'fill-rose-400' : ''}`} />
                        <span>{article.likes}</span>
                      </button>

                      <div className="flex items-center space-x-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{article.comments}</span>
                      </div>

                      <div className="flex items-center space-x-1.5 text-gray-500">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{article.views} views</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => playSound('click')}
                        className="p-1 hover:text-white rounded transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => playSound('click')}
                        className="p-1 hover:text-white rounded transition-colors"
                        title="Bookmark"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Right Column: Trending Hashtags & Square Highlights */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Trending Square Topics */}
            <div className="bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-republic-display font-bold text-sm text-white flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Trending Topics</span>
                </h3>
                <span className="text-[10px] text-gray-400 font-republic-mono">Live Ranking</span>
              </div>

              <div className="divide-y divide-white/[0.06]">
                {TRENDING_TOPICS.map((topic, i) => (
                  <div
                    key={topic.tag}
                    onClick={() => setSearchQuery(topic.tag)}
                    className="py-2.5 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="font-republic-mono text-xs text-gray-500 font-bold w-4">
                        0{i + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-gray-200 group-hover:text-amber-400 transition-colors">
                          {topic.tag}
                        </div>
                        <div className="text-[10px] text-gray-500">{topic.posts}</div>
                      </div>
                    </div>

                    {topic.hot && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        HOT
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Trade CTA Card */}
            <div className="bg-linear-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-2xl border border-white/[0.10] rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-republic-display font-bold text-sm text-white">
                Ready to take action?
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Spot deep liquidity order books, zero-latency price matching, and comprehensive risk management.
              </p>
              <button
                onClick={() => {
                  playSound('click');
                  onSwitchToTrade();
                }}
                className="w-full py-2.5 rounded-xl bg-white text-black font-extrabold text-xs flex items-center justify-center space-x-2 shadow-md hover:bg-gray-100 transition-all active:scale-95 cursor-pointer font-republic-display"
              >
                <span>Launch Pro Terminal</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
