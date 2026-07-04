'use client';

import React, { useEffect, useState } from 'react';
import { useLocation } from '@/context/LocationContext';
import { ShoppingBag, Plus, Loader2, MapPin, Tag } from 'lucide-react';

export default function MarketplacePage() {
  const { location } = useLocation();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>(''); // empty for all, or SELL, RENT, EXCHANGE
  
  // Listing compose states
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('SELL');
  const [condition, setCondition] = useState('new');
  const [mediaUrl, setMediaUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ city: location.city });
      if (filterType) params.append('type', filterType);
      
      const res = await fetch(`/api/marketplace?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [location.city, filterType]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !price) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          type,
          condition,
          mediaUrls: mediaUrl ? [mediaUrl] : [],
          country: location.country,
          state: location.state,
          city: location.city,
          area: location.area || '',
        }),
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setPrice('');
        setMediaUrl('');
        setCreateOpen(false);
        fetchListings();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">Local Marketplace</h2>
        </div>
        
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Listing
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['', 'SELL', 'RENT', 'EXCHANGE'].map((typeOption) => (
          <button
            key={typeOption}
            onClick={() => setFilterType(typeOption)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
              filterType === typeOption
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {typeOption === '' ? 'All Offers' : typeOption}
          </button>
        ))}
      </div>

      {/* Listings list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
        </div>
      ) : listings.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500 rounded-2xl border border-white/5">
          <p className="text-sm">No marketplace items found in {location.city}.</p>
          <p className="text-xs mt-1">Declutter your house! Sell, rent, or trade with your neighbors.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {listings.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col justify-between shadow-sm">
              <div className="h-40 bg-slate-950 border-b border-slate-900 overflow-hidden relative">
                <img
                  src={item.mediaUrls && item.mediaUrls[0] ? item.mediaUrls[0] : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300'}
                  alt="item image"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/75 rounded text-[8px] font-bold uppercase tracking-wider text-indigo-400 border border-white/5">
                  {item.type}
                </span>
              </div>
              <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 font-bold">₹{item.price}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between text-[9px] text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item.area || item.city}</span>
                  <span className="capitalize font-bold text-slate-400">{item.condition.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl relative animate-slide-up">
            <button
              onClick={() => setCreateOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">Add Marketplace Listing</h3>

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Item Title</label>
                <input
                  type="text"
                  placeholder="e.g. Ergonomic Office Chair"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 glass-input text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Description</label>
                <textarea
                  placeholder="Describe your item, usage duration, pick-up details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 glass-input text-slate-200 h-20 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1500 (Enter 0 for swap)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2 glass-input text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Listing Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2 glass-input text-slate-350"
                  >
                    <option value="SELL">Sell</option>
                    <option value="RENT">Rent Out</option>
                    <option value="EXCHANGE">Exchange / Swap</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-3.5 py-2 glass-input text-slate-350"
                  >
                    <option value="new">Brand New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Image URL</label>
                  <input
                    type="text"
                    placeholder="Unsplash / external image link"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="w-full px-3.5 py-2 glass-input text-slate-200"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl mt-2 text-[10px] text-slate-500">
                <p>Location parameters: <strong className="text-slate-350">{location.city}, {location.area || 'All Areas'}</strong></p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="flex-grow py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-grow py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/10 flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  );
}
