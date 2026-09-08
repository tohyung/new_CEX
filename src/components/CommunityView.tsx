import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Flame, 
  Sparkles, 
  Send, 
  ArrowUpRight, 
  Filter, 
  Search,
  MessageCircle,
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import { TradingPair } from '../types';
import { playSound } from '../utils/sound';

interface CommunityViewProps {
  currentPair: TradingPair;
  onSelectPair: (pair: TradingPair) => void;
  onSwitchToTrade: () => void;
  user?: { name: string; email: string } | null;
  onOpenLogin: () => void;
}

interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  badge?: string;
  time: string;
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  title: string;
  content: string;
  targetPrice?: number;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'p1',
    author: 'CryptoWhale_Alpha',
    avatar: 'CW',
    badge: 'Pro Trader',
    time: '12m ago',
    symbol: 'BTC/USDT',
    sentiment: 'bullish',
    title: 'BTC Liquidity Sweep Complete - Eyes on $82k Resistance',
    content: 'Massive order absorption at $77,500. Order books show aggressive bid stacking on funding reset. Looking for an expansion candle toward $82,400 if $78,200 holds as fresh support on 4H close.',
    targetPrice: 82400,
    likes: 142,
    comments: 28
  },
  {
    id: 'p2',
    author: 'MacroQuant',
    avatar: 'MQ',
    badge: 'Verified Analyst',
    time: '34m ago',
    symbol: 'ETH/USDT',
    sentiment: 'bullish',
    title: 'Ethereum Layer 2 Gas Burns Reaching 3-Month Highs',
    content: 'Structural supply tightening on mainnet while Layer-2 throughput hit new all-time records. ETH/BTC ratio printed a clean double bottom on the daily timeframe.',
    targetPrice: 3850,
    likes: 89,
    comments: 15
  },
  {
    id: 'p3',
    author: 'DerivativesEdge',
    avatar: 'DE',
    badge: 'Quant Model',
    time: '1h ago',
    symbol: 'SOL/USDT',
    sentiment: 'bullish',
    title: 'SOL Breakout Continuation with Spot Delta Dominance',
    content: 'Spot cumulative volume delta (CVD) divergence confirming genuine accumulation rather than perp leverage churn. Tight invalidation below recent swing low.',
    targetPrice: 210,
    likes: 67,
    comments: 9
  },
  {
    id: 'p4',
    author: 'DeltaNeutral_Dan',
    avatar: 'DN',
    time: '2h ago',
    symbol: 'BTC/USDT',
    sentiment: 'neutral',
    title: 'Funding Rate Heatmap: Weekend Volatility Ahead',
    content: 'Perpetual funding rate has settled around neutral 0.010%. Open interest remains elevated, indicating a potential squeeze setup if range extremes are tested.',
    likes: 45,
    comments: 12
  }
];

const TOP_TRADERS = [
  { rank: 1, name: 'ApexScalper', pnl30d: '+342.8%', winRate: '86.4%', trades: 412, followers: '14.2k' },
  { rank: 2, name: 'SatoshiFlow', pnl30d: '+218.4%', winRate: '78.2%', trades: 189, followers: '9.8k' },
  { rank: 3, name: 'ZeroTheta', pnl30d: '+176.1%', winRate: '81.0%', trades: 260, followers: '7.5k' },
  { rank: 4, name: 'MomentumRider', pnl30d: '+142.3%', winRate: '74.5%', trades: 310, followers: '5.1k' }
];

export const CommunityView: React.FC<CommunityViewProps> = ({
  currentPair,
  onSelectPair,
  onSwitchToTrade,
  user,
  onOpenLogin
}) => {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostSymbol, setNewPostSymbol] = useState('BTC/USDT');
  const [newPostSentiment, setNewPostSentiment] = useState<'bullish' | 'bearish' | 'neutral'>('bullish');
  const [isPosting, setIsPosting] = useState(false);

  const handleLike = (id: string) => {
    playSound('click');
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likes: isLiked ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    playSound('order_placed');
    const newPost: CommunityPost = {
      id: `p-${Date.now()}`,
      author: user ? user.name : 'CryptoTrader_You',
      avatar: user ? user.name.slice(0, 2).toUpperCase() : 'ME',
      badge: 'Community Member',
      time: 'Just now',
      symbol: newPostSymbol,
      sentiment: newPostSentiment,
      title: `${newPostSymbol} Quick Market Insight`,
      content: newPostContent,
      likes: 1,
      comments: 0,
      isLiked: true
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setIsPosting(false);
  };

  const tags = ['All', 'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'Alpha Calls', 'Technical Analysis'];

  const filteredPosts = posts.filter(p => {
    if (selectedTag === 'All') return true;
    if (selectedTag === 'Alpha Calls') return p.badge?.includes('Pro') || p.badge?.includes('Quant');
    return p.symbol === selectedTag;
  });

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#07090e] text-white p-4 sm:p-6 lg:p-8 font-republic select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Community Header Strip */}
        <div className="bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Community Hub
              </span>
              <span className="flex items-center space-x-1 text-xs text-emerald-400 font-republic-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>48,290 Online Traders</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-republic-display font-extrabold tracking-tight mt-2 text-white">
              Global Trader Community
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Real-time trading ideas, market sentiment, technical charts, and verified PnL leaderboards.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                playSound('click');
                onSwitchToTrade();
              }}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs font-republic-display shadow-md hover:bg-gray-100 transition-all active:scale-95"
            >
              <span>Open Pro Terminal</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grid: Main Feed (8 cols) + Leaderboard & Sentiment (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left / Main Feed Column */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Post Creator Box */}
            <div className="bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-4 shadow-sm">
              {!isPosting ? (
                <div 
                  onClick={() => {
                    playSound('click');
                    setIsPosting(true);
                  }}
                  className="flex items-center space-x-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 cursor-pointer hover:bg-white/[0.06] transition-colors text-gray-400 text-xs sm:text-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {user ? user.name.charAt(0) : 'U'}
                  </div>
                  <span className="flex-1">Share your trading idea, technical analysis, or market thoughts...</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
              ) : (
                <form onSubmit={handleCreatePost} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <select
                        value={newPostSymbol}
                        onChange={(e) => setNewPostSymbol(e.target.value)}
                        className="bg-white/[0.06] border border-white/[0.10] rounded-lg px-2.5 py-1 text-xs text-white outline-hidden font-republic-mono"
                      >
                        <option value="BTC/USDT">BTC/USDT</option>
                        <option value="ETH/USDT">ETH/USDT</option>
                        <option value="SOL/USDT">SOL/USDT</option>
                        <option value="BNB/USDT">BNB/USDT</option>
                      </select>

                      <div className="flex items-center space-x-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.08]">
                        <button
                          type="button"
                          onClick={() => setNewPostSentiment('bullish')}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            newPostSentiment === 'bullish' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-400'
                          }`}
                        >
                          Bullish
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewPostSentiment('bearish')}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            newPostSentiment === 'bearish' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-gray-400'
                          }`}
                        >
                          Bearish
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewPostSentiment('neutral')}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            newPostSentiment === 'neutral' ? 'bg-white/20 text-white' : 'text-gray-400'
                          }`}
                        >
                          Neutral
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPosting(false)}
                      className="text-gray-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Provide detailed market context, entry/exit levels, and risk parameters..."
                    className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl p-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-white/20 focus:outline-hidden resize-none"
                    autoFocus
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-gray-500">
                      Markdown supported • Respect community guidelines
                    </span>
                    <button
                      type="submit"
                      disabled={!newPostContent.trim()}
                      className="px-4 py-2 rounded-xl bg-white text-black font-extrabold text-xs flex items-center space-x-1.5 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish Idea</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Filter Tags */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    playSound('click');
                    setSelectedTag(tag);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-white text-black shadow-xs font-extrabold'
                      : 'bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Feed Cards */}
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <div
                  key={post.id}
                  className="bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-3 transition-all hover:border-white/[0.14]"
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                        {post.avatar}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-white">{post.author}</span>
                          {post.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/20">
                              {post.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400">{post.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] font-republic-mono text-[11px] text-gray-300 font-bold">
                        {post.symbol}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold font-republic-display ${
                        post.sentiment === 'bullish'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : post.sentiment === 'bearish'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-white/10 text-gray-300'
                      }`}>
                        {post.sentiment.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">{post.title}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">{post.content}</p>
                    {post.targetPrice && (
                      <div className="mt-2.5 inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1 text-xs">
                        <span className="text-gray-400">Target Level:</span>
                        <span className="font-republic-mono font-bold text-emerald-400">${post.targetPrice.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Post Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs text-gray-400">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-1.5 transition-colors cursor-pointer ${
                          post.isLiked ? 'text-rose-400 font-bold' : 'hover:text-white'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-rose-400' : ''}`} />
                        <span>{post.likes}</span>
                      </button>

                      <button 
                        onClick={() => playSound('click')}
                        className="flex items-center space-x-1.5 hover:text-white transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{post.comments} Comments</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        playSound('click');
                        onSwitchToTrade();
                      }}
                      className="flex items-center space-x-1 text-xs font-bold text-white hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <span>Trade {post.symbol}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Sentiment Radar & Top Traders Leaderboard */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Market Sentiment Radar */}
            <div className="bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-republic-display font-bold text-sm text-white flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Market Sentiment</span>
                </h3>
                <span className="text-[10px] text-gray-400 font-republic-mono">Live Index</span>
              </div>

              {/* Fear & Greed Gauge */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Fear & Greed Index</span>
                  <span className="font-bold text-emerald-400 font-republic-mono">74 • Greed</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                  <div className="h-full bg-linear-to-r from-rose-500 via-amber-400 to-emerald-500" style={{ width: '74%' }} />
                </div>
              </div>

              {/* Long vs Short Ratio */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Global Long / Short</span>
                  <span className="font-republic-mono text-emerald-400 font-bold">61.4% Long</span>
                </div>
                <div className="w-full h-2 bg-rose-500 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500" style={{ width: '61.4%' }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-republic-mono">
                  <span className="text-emerald-400">61.4% Buyers</span>
                  <span className="text-rose-400">38.6% Sellers</span>
                </div>
              </div>
            </div>

            {/* Top Traders Leaderboard */}
            <div className="bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-republic-display font-bold text-sm text-white flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Top Traders (30D)</span>
                </h3>
                <span className="text-[10px] text-emerald-400 font-republic-mono">Verified PnL</span>
              </div>

              <div className="divide-y divide-white/[0.06]">
                {TOP_TRADERS.map(trader => (
                  <div key={trader.name} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        trader.rank === 1 ? 'bg-amber-400 text-black' :
                        trader.rank === 2 ? 'bg-gray-300 text-black' :
                        trader.rank === 3 ? 'bg-amber-700 text-white' : 'bg-white/10 text-gray-400'
                      }`}>
                        {trader.rank}
                      </span>
                      <div>
                        <div className="font-bold text-white">{trader.name}</div>
                        <div className="text-[10px] text-gray-400">Win Rate: {trader.winRate}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-republic-mono font-extrabold text-emerald-400">{trader.pnl30d}</div>
                      <button
                        onClick={() => {
                          playSound('click');
                          onSwitchToTrade();
                        }}
                        className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer"
                      >
                        View Orders
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
