'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Check, Plus, Loader2, ArrowRight } from 'lucide-react';

const INTERESTS = [
  'Technology', 'Business', 'Education', 'Sports', 'Music', 'Movies',
  'Fitness', 'Photography', 'Travel', 'Food', 'Gaming', 'Pets',
  'Politics', 'Fashion', 'Finance', 'Reading', 'Coding', 'Entrepreneurship'
];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Profile fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profession, setProfession] = useState('');
  const [education, setEducation] = useState('');
  
  // Location fields
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Karnataka');
  const [city, setCity] = useState('Bengaluru');
  const [district, setDistrict] = useState('Urban Bangalore');
  const [area, setArea] = useState('Indiranagar');
  const [society, setSociety] = useState('Indira Heights');
  const [apartment, setApartment] = useState('');
  const [lat, setLat] = useState<number | null>(12.97189);
  const [lng, setLng] = useState<number | null>(77.64115);

  // Interests selection
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      setSelectedInterests((prev) => [...prev, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  // Simulate Geolocation lookup
  const handleGpsSimulation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          // Set to default coordinates for Bangalore Indiranagar if it outputs generic responses
        },
        () => {
          // Fallback simulation
          setLat(12.97189 + (Math.random() - 0.5) * 0.01);
          setLng(77.64115 + (Math.random() - 0.5) * 0.01);
        }
      );
    } else {
      setLat(12.97189);
      setLng(77.64115);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !country || !state || !city || !area) {
      setError('Please fill out your Name and Location (Country, State, City, Area)');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          bio,
          profession,
          education,
          country,
          state,
          city,
          district,
          area,
          society,
          apartment,
          latitude: lat,
          longitude: lng,
          interests: selectedInterests,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
          coverImage: 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=800',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save profile');
      } else {
        router.push('/feed');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 py-12 px-6 flex items-center justify-center overflow-x-hidden">
      <div className="bg-glow bg-glow-right" />
      <div className="bg-glow bg-glow-left" />

      <div className="relative z-10 w-full max-w-2xl glass-card rounded-3xl p-8 border border-white/5 shadow-2xl animate-slide-up">
        {/* Onboarding Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Onboarding</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-2">Configure Your Profile</h1>
        <p className="text-slate-400 text-sm mb-8">
          NearMe relies on location tags and interests to build your hyperlocal feed and recommendations.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 pb-1.5 border-b border-slate-800">1. Basic Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5" htmlFor="name">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Alice Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input text-slate-200 text-sm focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5" htmlFor="profession">
                  Profession
                </label>
                <input
                  id="profession"
                  type="text"
                  placeholder="Software Engineer"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input text-slate-200 text-sm focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-slate-300 text-xs font-medium mb-1.5" htmlFor="bio">
                Short Bio
              </label>
              <textarea
                id="bio"
                placeholder="Tell your neighbors about yourself, your hobbies, or what you're building..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 glass-input text-slate-200 text-sm focus:border-indigo-500 h-24 resize-none"
              />
            </div>
          </div>

          {/* Section 2: Location Hierarchy */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-1.5 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">2. Local Location</h3>
              <button
                type="button"
                onClick={handleGpsSimulation}
                className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" /> GPS Coordinates
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5" htmlFor="country">
                  Country *
                </label>
                <input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input text-slate-200 text-sm focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5" htmlFor="state">
                  State *
                </label>
                <input
                  id="state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input text-slate-200 text-sm focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5" htmlFor="city">
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input text-slate-200 text-sm focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5" htmlFor="district">
                  District
                </label>
                <input
                  id="district"
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input text-slate-200 text-sm focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5" htmlFor="area">
                  Area / Neighborhood *
                </label>
                <input
                  id="area"
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input text-slate-200 text-sm focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5" htmlFor="society">
                  Society / Colony
                </label>
                <input
                  id="society"
                  type="text"
                  value={society}
                  onChange={(e) => setSociety(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input text-slate-200 text-sm focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">Latitude</span>
                <span className="text-slate-300 text-sm font-semibold">{lat ? lat.toFixed(5) : 'Not specified'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">Longitude</span>
                <span className="text-slate-300 text-sm font-semibold">{lng ? lng.toFixed(5) : 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Interests */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 pb-1.5 border-b border-slate-800">3. Select Interests</h3>
            
            <div className="flex flex-wrap gap-2.5 mb-6">
              {INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-md shadow-indigo-600/25 scale-[1.03]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {interest}
                  </button>
                );
              })}
            </div>

            {/* Custom Interest Input */}
            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add custom interest..."
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                className="flex-1 px-3 py-1.5 glass-input text-slate-200 text-xs focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddCustomInterest}
                className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Save & Continue to Feed <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
