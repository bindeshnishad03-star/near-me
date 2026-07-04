'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useLocation } from '@/context/LocationContext';
import {
  MapPin, Users, Calendar, ShoppingBag, MessageSquare, Compass, Shield,
  LogOut, User, Settings, Search, Menu, X, SlidersHorizontal, Map, Loader2
} from 'lucide-react';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

function SidebarLink({ href, icon, label, active }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { location, updateLocation, resetToProfile } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Local filter states
  const [searchCity, setSearchCity] = useState(location.city);
  const [searchArea, setSearchArea] = useState(location.area || '');
  const [searchSociety, setSearchSociety] = useState(location.society || '');
  const [searchRadius, setSearchRadius] = useState(location.radiusKm);
  const [useGps, setUseGps] = useState(location.useGps);

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <p className="text-sm">Authenticating session...</p>
      </div>
    );
  }

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    updateLocation({
      city: searchCity,
      area: searchArea || undefined,
      society: searchSociety || undefined,
      radiusKm: searchRadius,
      useGps: useGps,
    });
    setFilterOpen(false);
    router.refresh();
  };

  const navLinks = [
    { href: '/feed', icon: <MapPin className="w-4 h-4" />, label: 'Local Feed' },
    { href: '/explore', icon: <Compass className="w-4 h-4" />, label: 'Explore Nearby' },
    { href: '/messages', icon: <MessageSquare className="w-4 h-4" />, label: 'Messaging' },
    { href: '/groups', icon: <Users className="w-4 h-4" />, label: 'Interest Groups' },
    { href: '/marketplace', icon: <ShoppingBag className="w-4 h-4" />, label: 'Marketplace' },
    { href: '/events', icon: <Calendar className="w-4 h-4" />, label: 'Local Events' },
    { href: `/profile/${session?.user?.username || ''}`, icon: <User className="w-4 h-4" />, label: 'My Profile' },
  ];

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <Link href="/feed" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
              <MapPin className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white hidden sm:inline-block">NearMe</span>
          </Link>
        </div>

        {/* Global Location context selector */}
        <div className="flex items-center gap-2 max-w-lg flex-1 mx-4 sm:mx-8">
          <div
            onClick={() => setFilterOpen(true)}
            className="flex-1 max-w-[280px] sm:max-w-md px-3.5 py-1.5 glass rounded-xl text-slate-300 hover:text-white text-xs font-medium border border-white/5 flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">
                {location.useGps
                  ? `GPS Proximity (${location.radiusKm}km)`
                  : `${location.city}${location.area ? ` • ${location.area}` : ''}`}
              </span>
            </div>
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0 ml-2" />
          </div>
        </div>

        {/* User drop-down info */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-slate-200">{session?.user?.name}</p>
            <p className="text-[10px] text-slate-500 font-medium">@{session?.user?.username}</p>
          </div>
          
          <img
            src={session?.user?.image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${session?.user?.username}`}
            alt="avatar"
            className="w-9 h-9 rounded-full object-cover border border-white/10"
          />
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 hidden md:block"
            title="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-0 sm:px-6 py-6 gap-6">
        {/* Left Sidebar (Desktop) */}
        <aside className="w-64 hidden md:flex flex-col gap-2 shrink-0">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <SidebarLink
                  key={link.href}
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  active={active}
                />
              );
            })}

            {isAdmin && (
              <SidebarLink
                href="/admin"
                icon={<Shield className="w-4 h-4" />}
                label="Admin Panel"
                active={pathname === '/admin'}
              />
            )}
          </nav>

          <div className="mt-auto border-t border-slate-900 pt-6 px-4">
            <div className="glass p-4 rounded-xl text-xs text-slate-500">
              <p className="font-semibold text-slate-400 mb-1">Local Proximity Mode</p>
              <p className="leading-relaxed">Filtering posts within neighborhood coordinates.</p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-slate-950/90 backdrop-blur-md flex flex-col p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold text-white">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                      active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    pathname === '/admin' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
            </nav>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="mt-auto py-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 font-semibold text-sm rounded-xl border border-red-600/20 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}

        {/* Location filter overlay modal */}
        {filterOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl relative animate-slide-up">
              <button
                onClick={() => setFilterOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-4.5 h-4.5" />
              </button>
              
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" /> Location Filter Context
              </h3>

              <form onSubmit={handleApplyFilters} className="space-y-4">
                <div className="flex items-center gap-4 py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl mb-4">
                  <input
                    type="checkbox"
                    id="gpsToggle"
                    checked={useGps}
                    onChange={(e) => setUseGps(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                  <label htmlFor="gpsToggle" className="text-xs font-semibold text-slate-300 select-none cursor-pointer">
                    Use GPS Coordinates (Radius Search)
                  </label>
                </div>

                {useGps ? (
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2">
                      Search Radius: {searchRadius} km
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={searchRadius}
                      onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>1 km</span>
                      <span>50 km</span>
                      <span>100 km</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                        className="w-full px-3 py-2 glass-input text-xs text-slate-200 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">
                        Area / Neighborhood
                      </label>
                      <input
                        type="text"
                        value={searchArea}
                        onChange={(e) => setSearchArea(e.target.value)}
                        placeholder="e.g. Indiranagar"
                        className="w-full px-3 py-2 glass-input text-xs text-slate-200 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">
                        Society / Colony
                      </label>
                      <input
                        type="text"
                        value={searchSociety}
                        onChange={(e) => setSearchSociety(e.target.value)}
                        placeholder="e.g. Indira Heights"
                        className="w-full px-3 py-2 glass-input text-xs text-slate-200 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-slate-900 mt-4">
                  <button
                    type="button"
                    onClick={resetToProfile}
                    className="flex-1 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Reset to Profile
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/10"
                  >
                    Apply Filters
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dynamic Center Page Payload */}
        <main className="flex-1 min-w-0 bg-transparent flex flex-col">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <footer className="md:hidden sticky bottom-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-t border-slate-900 py-3 flex items-center justify-around px-4">
        {navLinks.slice(0, 5).map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                active ? 'text-indigo-500 scale-[1.05]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {link.icon}
            </Link>
          );
        })}
      </footer>
    </div>
  );
}
