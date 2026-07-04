'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin, ShieldAlert, Award, Globe, Edit2, Check, Loader2,
  Lock, Eye, User, Shield, Briefcase, GraduationCap
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const sessionParams = useParams();
  const { data: session, update: updateSession } = useSession();
  
  const [profileUsername, setProfileUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Profile state
  const [userObj, setUserObj] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [editing, setEditing] = useState(false);

  // Edit form states
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profession, setProfession] = useState('');
  const [education, setEducation] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [hideExactLocation, setHideExactLocation] = useState(false);
  const [showOnlyCity, setShowOnlyCity] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const username = sessionParams?.username as string;
      if (!username) return;
      setProfileUsername(username);

      const res = await fetch(`/api/profile/${username}`);
      if (!res.ok) {
        setError('Failed to fetch user profile');
        return;
      }

      const data = await res.json();
      setUserObj(data.user);
      setProfile(data.profile);

      // Determine if this profile belongs to the authed user
      const own = session?.user?.id === data.user.id;
      setIsOwnProfile(own);

      // Populate edit fields
      if (data.profile) {
        setName(data.profile.name || '');
        setBio(data.profile.bio || '');
        setProfession(data.profile.profession || '');
        setEducation(data.profile.education || '');
        setLanguages(data.profile.languages || []);
        setSkills(data.profile.skills || []);
        setHideExactLocation(data.profile.hideExactLocation || false);
        setShowOnlyCity(data.profile.showOnlyCity || false);
      }
    } catch (e) {
      console.error(e);
      setError('Internal error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [sessionParams?.username, session?.user?.id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          bio,
          profession,
          education,
          languages,
          skills,
          hideExactLocation,
          showOnlyCity,
          country: profile?.country || 'India',
          state: profile?.state || 'Karnataka',
          city: profile?.city || 'Bengaluru',
          area: profile?.area || '',
          society: profile?.society || '',
          apartment: profile?.apartment || '',
          latitude: profile?.latitude,
          longitude: profile?.longitude,
          interests: profile?.interests?.map((i: any) => i.name) || [],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setEditing(false);
        
        // Update local session cache if name changed
        updateSession({
          name: data.profile.name,
          image: data.profile.avatar,
        });

        fetchProfile();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <p className="text-xs">Loading profile parameters...</p>
      </div>
    );
  }

  if (error || !userObj) {
    return (
      <div className="glass p-8 rounded-2xl border border-red-500/10 text-center text-slate-500 max-w-md mx-auto">
        <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm font-semibold">{error || 'Profile not found'}</p>
        <button
          onClick={() => router.push('/feed')}
          className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg text-xs font-semibold text-white"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Cover and Avatar Panel */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/5 relative">
        <div className="h-44 bg-slate-900 overflow-hidden relative">
          <img
            src={profile?.coverImage || 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=800'}
            className="w-full h-full object-cover opacity-60"
            alt="cover"
          />
        </div>

        <div className="px-6 pb-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 mb-4">
            <div className="w-28 h-28 rounded-full border-4 border-slate-950 bg-slate-900 overflow-hidden relative shadow-lg">
              <img
                src={profile?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userObj.username}`}
                className="w-full h-full object-cover"
                alt="avatar"
              />
            </div>
            
            <div className="flex gap-2">
              {isOwnProfile ? (
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              ) : (
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all">
                  Connect Request
                </button>
              )}
            </div>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-extrabold text-white">{profile?.name || userObj.username}</h2>
            <p className="text-slate-500 text-sm">@{userObj.username} • {profile?.profession || 'Local Connect Member'}</p>
            
            <p className="text-slate-400 text-xs sm:text-sm pt-2 max-w-xl leading-relaxed">
              {profile?.bio || 'No bio written yet.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Details and settings grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Metadata Details */}
        <div className="md:col-span-2 space-y-6">
          
          {editing ? (
            /* Editing form block */
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Edit Profile Settings</h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 glass-input text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2 glass-input text-slate-200 h-20 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Profession</label>
                    <input
                      type="text"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full px-3.5 py-2 glass-input text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Education</label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className="w-full px-3.5 py-2 glass-input text-slate-200"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-4 space-y-3">
                  <h4 className="font-bold text-slate-300">Privacy Preferences</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hideGps"
                      checked={hideExactLocation}
                      onChange={(e) => setHideExactLocation(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <label htmlFor="hideGps" className="text-xs text-slate-400 select-none cursor-pointer">
                      Hide Exact Location (Obfuscate Coordinates)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="onlyCity"
                      checked={showOnlyCity}
                      onChange={(e) => setShowOnlyCity(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <label htmlFor="onlyCity" className="text-xs text-slate-400 select-none cursor-pointer">
                      Show Only City (Hide Area/Society details)
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/10 flex items-center gap-1"
                  >
                    {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Check className="w-3.5 h-3.5" /> Save Changes</>}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Public/Authed Profile details Display */
            <div className="space-y-6">
              <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-400" /> About & Skills
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl space-y-1">
                    <p className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Profession
                    </p>
                    <p className="text-slate-200 font-bold">{profile?.profession || 'Not Specified'}</p>
                  </div>

                  <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl space-y-1">
                    <p className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" /> Education
                    </p>
                    <p className="text-slate-200 font-bold">{profile?.education || 'Not Specified'}</p>
                  </div>
                </div>

                {/* Skills tags list */}
                <div className="space-y-2">
                  <h4 className="text-slate-300 font-bold text-xs">Skills & Talents</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill: string) => (
                        <span key={skill} className="px-2.5 py-1 bg-slate-900 text-slate-400 text-[10px] font-bold rounded-lg border border-slate-800">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500">No skills added.</span>
                    )}
                  </div>
                </div>

                {/* Interests tags list */}
                <div className="space-y-2">
                  <h4 className="text-slate-300 font-bold text-xs">Interests</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile?.interests && profile.interests.length > 0 ? (
                      profile.interests.map((interest: any) => (
                        <span key={interest.id} className="px-2.5 py-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-300 text-[10px] font-bold rounded-lg border border-indigo-500/10">
                          {interest.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500">No interests selected.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Location metadata and privacy badges */}
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-purple-400" /> Geographic Info
            </h3>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-900/60">
                <span className="text-slate-500 font-semibold">City</span>
                <span className="font-bold">{profile?.city || 'Not Specified'}</span>
              </div>
              
              {!profile?.showOnlyCity && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-500 font-semibold">Area / Neighborhood</span>
                    <span className="font-bold">{profile?.area || 'Not Specified'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-500 font-semibold">Society / Apartment</span>
                    <span className="font-bold">{profile?.society || 'Not Specified'}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between py-1 border-b border-slate-900/60">
                <span className="text-slate-500 font-semibold">Latitude</span>
                <span className="font-mono text-[10px] font-bold">
                  {profile?.hideExactLocation ? '[Redacted]' : profile?.latitude || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-semibold">Longitude</span>
                <span className="font-mono text-[10px] font-bold">
                  {profile?.hideExactLocation ? '[Redacted]' : profile?.longitude || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Privacy summary panel */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-3 text-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" /> Privacy Badges
            </h3>
            
            <div className="flex items-center gap-2 p-2 bg-slate-900/40 rounded-xl border border-slate-900">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-200 text-[11px]">Location Obfuscation</p>
                <p className="text-[10px] text-slate-500 leading-normal">
                  {profile?.hideExactLocation ? 'Active: GPS coordinates hidden' : 'Disabled: GPS details public'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-slate-900/40 rounded-xl border border-slate-900">
              <Eye className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-200 text-[11px]">Neighborhood Exposure</p>
                <p className="text-[10px] text-slate-500 leading-normal">
                  {profile?.showOnlyCity ? 'City Only: Area, Society tags filtered' : 'Full Exposure: District, Society public'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
