'use client';

import React, { useEffect, useState } from 'react';
import { useLocation } from '@/context/LocationContext';
import { Users, Plus, Loader2, MapPin, Tag } from 'lucide-react';

export default function GroupsPage() {
  const { location } = useLocation();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Creation state
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('interest');
  const [type, setType] = useState('PUBLIC');
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups?city=${location.city}`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [location.city]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          category,
          type,
          country: location.country,
          state: location.state,
          city: location.city,
          area: location.area || '',
        }),
      });

      if (res.ok) {
        setName('');
        setDescription('');
        setCreateOpen(false);
        fetchGroups();
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
          <Users className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">Interest Groups ({location.city})</h2>
        </div>
        
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Group
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
        </div>
      ) : groups.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500 rounded-2xl border border-white/5">
          <p className="text-sm">No community groups found in {location.city}.</p>
          <p className="text-xs mt-1">Start a community group for local fitness, technology, or neighborhood discussion!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="glass-card p-5 rounded-2xl border border-white/5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/15 font-bold uppercase tracking-wider">
                    {group.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">{group._count?.members || 1} members</span>
                </div>
                <h3 className="text-sm font-bold text-white">{group.name}</h3>
                <p className="text-xs text-slate-400 leading-normal line-clamp-3">{group.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-900/60 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-600" /> {group.area || group.city}</span>
                <button className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold rounded-lg transition-colors cursor-pointer">
                  Join Room
                </button>
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

            <h3 className="text-base font-bold text-white mb-4">Create Local Group</h3>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. Indiranagar Cycling Club"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 glass-input text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Description</label>
                <textarea
                  placeholder="Write what this club is about, when you meet, and who should join..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 glass-input text-slate-200 h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 glass-input text-slate-300"
                  >
                    <option value="interest">Interest</option>
                    <option value="sports">Sports</option>
                    <option value="gaming">Gaming</option>
                    <option value="college">College</option>
                    <option value="apartment">Apartment</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Privacy Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2 glass-input text-slate-300"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                  </select>
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
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
// simple helper
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  );
}
