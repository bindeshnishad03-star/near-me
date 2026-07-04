'use client';

import React, { useState } from 'react';
import { Compass, Search, Heart, MessageCircle, Share2, Music, MapPin, Film, Users, Calendar, ShoppingBag } from 'lucide-react';

const REELS = [
  {
    id: 'reel-1',
    user: 'bob_fitness',
    name: 'Bob Smith',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-cell-phone-looking-at-a-map-40626-large.mp4',
    caption: 'Finding the best local running spots in Bengaluru 🗺️🏃‍♂️ #fitness #bengaluru',
    musicName: 'Original Sound - bob_fitness',
    location: 'Indiranagar Park, BLR',
    likes: 124,
    comments: 18,
  },
  {
    id: 'reel-2',
    user: 'dan_photos',
    name: 'Dan Evans',
    avatar: 'https://images.unsplash.com/photo-1527983359383-4758693f760c?w=150',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-photographer-capturing-photos-of-nature-34138-large.mp4',
    caption: 'Golden hour in San Francisco, capturing the fog roll in #sanfrancisco #photography',
    musicName: 'Calm Vibe - Lofi Beats',
    location: 'Mission Heights, SF',
    likes: 256,
    comments: 42,
  }
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<'reels' | 'search'>('reels');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      // Call recommendations or posts API
      const res = await fetch(`/api/recommendations?city=${searchQuery}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (e) {
      console.error('Error searching:', e);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col min-h-[calc(100vh-140px)]">
      
      {/* Search and Reels Toggle */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
        <div className="flex items-center gap-1.5">
          <Compass className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">Explore</h2>
        </div>
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('reels')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'reels' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Local Reels
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'search' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Global Search
          </button>
        </div>
      </div>

      {/* REELS VIEWPORT (Infinite scroll viewport simulation) */}
      {activeTab === 'reels' ? (
        <div className="flex-1 flex items-center justify-center p-2">
          <div className="w-full max-w-sm h-[600px] bg-black border border-slate-900 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-2xl">
            
            {/* Reels Video Scroller */}
            <div className="absolute inset-0 z-0">
              <video
                src={REELS[0].videoUrl}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>

            {/* Top Gradient Overlay */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

            {/* Reels Header */}
            <div className="relative z-10 p-4 flex items-center justify-between text-xs text-white">
              <span className="font-bold flex items-center gap-1">
                <Film className="w-4 h-4 text-indigo-400" /> Reels
              </span>
              <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-bold text-[9px]">{REELS[0].location}</span>
              </div>
            </div>

            {/* Bottom Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />

            {/* Right Action floating panel */}
            <div className="relative z-20 self-end mr-2 mb-20 flex flex-col items-center gap-5 text-white">
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="p-3 bg-black/40 border border-white/10 rounded-full hover:bg-black/60 transition-all">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </div>
                <span className="text-[10px] font-bold mt-1 shadow-sm">{REELS[0].likes}</span>
              </div>

              <div className="flex flex-col items-center cursor-pointer">
                <div className="p-3 bg-black/40 border border-white/10 rounded-full hover:bg-black/60 transition-all">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold mt-1 shadow-sm">{REELS[0].comments}</span>
              </div>

              <div className="flex flex-col items-center cursor-pointer">
                <div className="p-3 bg-black/40 border border-white/10 rounded-full hover:bg-black/60 transition-all">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold mt-1 shadow-sm">Share</span>
              </div>
            </div>

            {/* User metadata & details footer */}
            <div className="relative z-20 p-4 text-xs text-white space-y-2">
              <div className="flex items-center gap-2">
                <img
                  src={REELS[0].avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-white/10"
                />
                <div>
                  <p className="font-bold">@{REELS[0].user}</p>
                  <p className="text-[10px] text-slate-300">{REELS[0].name}</p>
                </div>
                <button className="ml-2 px-2.5 py-1 bg-indigo-600 rounded-lg font-bold text-[10px] border border-indigo-400">
                  Follow
                </button>
              </div>

              <p className="text-slate-200 leading-normal">{REELS[0].caption}</p>

              <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                <Music className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{REELS[0].musicName}</span>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* GLOBAL SEARCH VIEW */
        <div className="space-y-6 flex-1">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search neighborhood city (e.g. Bengaluru, San Francisco)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 glass-input text-xs sm:text-sm text-slate-200 focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-xs font-semibold shrink-0 cursor-pointer"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchResults ? (
            <div className="space-y-6">
              {/* Suggested neighbors section */}
              {searchResults.suggestedPeople && searchResults.suggestedPeople.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-400" /> People Found
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {searchResults.suggestedPeople.map((person: any) => (
                      <div key={person.id} className="glass-card p-4 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={person.avatar}
                            className="w-10 h-10 rounded-full object-cover"
                            alt="avatar"
                          />
                          <div>
                            <p className="font-bold text-white">{person.name}</p>
                            <p className="text-[10px] text-slate-500">{person.profession} • {person.area}, {person.city}</p>
                          </div>
                        </div>
                        <button className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold rounded-lg hover:bg-indigo-500/20">
                          Connect
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested groups found */}
              {searchResults.groups && searchResults.groups.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-400" /> Groups Found
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {searchResults.groups.map((group: any) => (
                      <div key={group.id} className="glass-card p-4 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white">{group.name}</p>
                          <p className="text-[10px] text-slate-500">{group.category} • {group.city}</p>
                        </div>
                        <button className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold rounded-lg hover:bg-indigo-500/20">
                          Join Group
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass p-8 rounded-2xl border border-white/5 text-center text-slate-500 max-w-lg">
              <Search className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs">Search for a localized city parameter above to trigger geographic recommendations queries.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
