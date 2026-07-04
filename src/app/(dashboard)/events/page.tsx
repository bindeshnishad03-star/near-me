'use client';

import React, { useEffect, useState } from 'react';
import { useLocation } from '@/context/LocationContext';
import { Calendar, Plus, Loader2, MapPin, Check } from 'lucide-react';

export default function EventsPage() {
  const { location } = useLocation();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Event compose states
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('meetup');
  const [eventDate, setEventDate] = useState('');
  const [address, setAddress] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events?city=${location.city}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [location.city]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !eventDate || !address) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          eventDate,
          address,
          mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
          country: location.country,
          state: location.state,
          city: location.city,
          area: location.area || '',
        }),
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setEventDate('');
        setAddress('');
        setMediaUrl('');
        setCreateOpen(false);
        fetchEvents();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRsvp = async (eventId: string, rsvpStatus: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: rsvpStatus }),
      });

      if (res.ok) {
        fetchEvents(); // Refresh RSVP totals
      }
    } catch (e) {
      console.error('Error rsvp:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">Local Events ({location.city})</h2>
        </div>
        
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {/* Events Board Grid */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500 rounded-2xl border border-white/5">
          <p className="text-sm">No community events found in {location.city}.</p>
          <p className="text-xs mt-1">Plan a weekend coding workshop, runners meetup, or neighborhood community service!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event.id} className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col justify-between shadow-sm">
              <div className="h-44 bg-slate-950 border-b border-slate-900 overflow-hidden relative">
                <img
                  src={event.mediaUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'}
                  alt="event image"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 px-2.5 py-0.5 bg-black/75 rounded text-[8px] font-bold uppercase tracking-wider text-indigo-400 border border-white/5">
                  {event.category}
                </span>
              </div>
              <div className="p-4 space-y-3 flex-grow flex flex-col justify-between text-xs">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white leading-tight">{event.title}</h4>
                  <p className="text-[10px] text-slate-500">{new Date(event.eventDate).toLocaleString()}</p>
                  <p className="text-slate-400 leading-normal line-clamp-3 pt-1">{event.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between text-[9px] text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.address}</span>
                  <span className="font-bold text-indigo-400">{event.rsvps?.length || 0} attending</span>
                </div>

                {/* RSVP control buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleRsvp(event.id, 'going')}
                    className="flex-1 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-transparent text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Attending
                  </button>
                  <button
                    onClick={() => handleRsvp(event.id, 'maybe')}
                    className="flex-grow py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Maybe
                  </button>
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

            <h3 className="text-base font-bold text-white mb-4">Host Nearby Event</h3>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. Local Connect Pitch & Hack"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 glass-input text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Description</label>
                <textarea
                  placeholder="What is happening? Who is welcome? Specify scheduling logs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 glass-input text-slate-200 h-20 resize-none"
                  required
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
                    <option value="meetup">Meetup</option>
                    <option value="sports">Sports</option>
                    <option value="community">Community Service</option>
                    <option value="donation">Blood Donation</option>
                    <option value="festival">Festival</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Event Date & Time</label>
                  <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2 glass-input text-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Full Venue Address</label>
                <input
                  type="text"
                  placeholder="e.g. Community Hall, 2nd Floor, Indira Heights"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 glass-input text-slate-200"
                  required
                />
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
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Host Event'}
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
