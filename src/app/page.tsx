'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MapPin, Users, Calendar, ShoppingBag, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'authenticated') {
      router.push('/feed');
    }
  }, [status, router]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 flex flex-col justify-between">
      {/* Animated Glow Backdrops */}
      <div className="bg-glow bg-glow-right" />
      <div className="bg-glow bg-glow-left" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            NearMe
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:scale-[1.02]"
          >
            Join Now
          </Link>
        </div>
      </header>

      {/* Main Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-12 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6 tracking-wide uppercase">
          <MapPin className="w-3.5 h-3.5" /> Next-Gen Hyperlocal Network
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
          Connect Locally,<br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Belong Community
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          The premium platform bridging the gap between social media and physical proximity. Connect with verified neighbors, establish interest clubs, list marketplace deals, and co-ordinate events in your exact coordinates.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/auth/register"
            className="px-8 py-4 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2 group hover:scale-[1.02]"
          >
            Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-4 text-base font-medium text-slate-300 hover:text-white glass rounded-xl transition-all flex items-center justify-center hover:bg-white/5"
          >
            Explore Nearby
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <div className="glass-card p-6 rounded-2xl text-left">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Local Feed</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Stay in the loop with what's happening around you. Filter by society, area, city, or coordinate boundaries.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-left">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Messaging</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Instant 1-to-1 chats, group chats, typing statuses, read receipts, and WebRTC caller signaling.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-left">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4 text-pink-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">RSVP Events</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Discover and organize local meetups, sports events, festivals, or blood donation drives.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Marketplace</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Buy, sell, rent, or swap items with nearby neighbors, minimizing travel distances and shipping fees.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-left">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Interest Groups</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Create and join location-based groups for coders, musicians, athletes, or apartment clusters.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-left">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 text-orange-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Moderated Safety</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Advanced admin moderation dashboard, content reporting, spam protection, and privacy radius toggles.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} NearMe. All rights reserved.</p>
      </footer>
    </div>
  );
}
