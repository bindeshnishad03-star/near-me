'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocation } from '@/context/LocationContext';
import {
  MapPin, MessageSquare, ThumbsUp, Share2, Bookmark, BarChart3, Plus,
  Image, Film, FileText, Vote, Send, Loader2, Award, Calendar, ShoppingBag, Group
} from 'lucide-react';

export default function FeedPage() {
  const { data: session } = useSession();
  const { location, loading: locationLoading } = useLocation();

  // Recommendations data state
  const [posts, setPosts] = useState<any[]>([]);
  const [suggestedPeople, setSuggestedPeople] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Post composer state
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'TEXT' | 'IMAGE' | 'POLL'>('TEXT');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [mediaUrl, setMediaUrl] = useState('');
  const [locationTag, setLocationTag] = useState('');

  // Comment composer state
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const fetchFeed = async () => {
    if (locationLoading) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({
        city: location.city,
        area: location.area || '',
        society: location.society || '',
        radius: location.radiusKm.toString(),
        useGps: location.useGps.toString(),
      });
      if (location.latitude && location.longitude) {
        params.append('lat', location.latitude.toString());
        params.append('lng', location.longitude.toString());
      }

      const res = await fetch(`/api/recommendations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        setSuggestedPeople(data.suggestedPeople || []);
        setGroups(data.groups || []);
        setEvents(data.events || []);
        setListings(data.listings || []);
      }
    } catch (e) {
      console.error('Failed to fetch recommendations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [location, locationLoading]);

  // Handle post submit
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        content: postContent,
        type: postType,
        mediaUrls: mediaUrl ? [mediaUrl] : [],
        locationTag: locationTag || `${location.area || location.city}, ${location.state}`,
        latitude: location.latitude,
        longitude: location.longitude,
        pollOptions: postType === 'POLL' ? pollOptions.filter(o => o.trim() !== '') : [],
      };

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPostContent('');
        setMediaUrl('');
        setLocationTag('');
        setPollOptions(['', '']);
        setPostType('TEXT');
        fetchFeed(); // Refresh feed
      }
    } catch (e) {
      console.error('Error creating post:', e);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Post Liking
  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        // Optimistic toggle local state
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id === postId) {
              const currentUserId = session?.user?.id;
              const hasLiked = post.likes.some((l: any) => l.userId === currentUserId);
              const updatedLikes = hasLiked
                ? post.likes.filter((l: any) => l.userId !== currentUserId)
                : [...post.likes, { userId: currentUserId, postId }];
              return { ...post, likes: updatedLikes };
            }
            return post;
          })
        );
      }
    } catch (e) {
      console.error('Error liking post:', e);
    }
  };

  // Submit dynamic comment
  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      });

      if (res.ok) {
        const { comment } = await res.json();
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id === postId) {
              return { ...post, comments: [...(post.comments || []), comment] };
            }
            return post;
          })
        );
        setCommentText('');
      }
    } catch (e) {
      console.error('Error creating comment:', e);
    }
  };

  // Vote on poll
  const handlePollVote = async (postId: string, optionId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });

      if (res.ok) {
        const { vote } = await res.json();
        // Refresh local voting count
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id === postId) {
              return { ...post, votes: [...(post.votes || []), vote] };
            }
            return post;
          })
        );
      }
    } catch (e) {
      console.error('Error voting on poll:', e);
    }
  };

  // Send friend request
  const handleConnectWithUser = async (receiverId: string) => {
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId }),
      });
      if (res.ok) {
        alert('Friend connection request sent!');
        // Filter user out of recommendations list
        setSuggestedPeople((prev) => prev.filter((p) => p.userId !== receiverId));
      }
    } catch (e) {
      console.error('Error sending connection request:', e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Center Feed Column */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Stories Tray */}
        <div className="glass-card p-4 rounded-2xl border border-white/5 shadow flex gap-4 overflow-x-auto no-scrollbar">
          <div className="flex flex-col items-center shrink-0 cursor-pointer">
            <div className="w-14 h-14 rounded-full border-2 border-indigo-500 p-0.5 relative group">
              <img
                src={session?.user?.image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${session?.user?.username}`}
                className="w-full h-full rounded-full object-cover"
                alt="my story"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-semibold">Your Story</span>
          </div>

          {/* Seed stories */}
          <div className="flex flex-col items-center shrink-0 cursor-pointer">
            <div className="w-14 h-14 rounded-full border-2 border-indigo-500 p-0.5">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                className="w-full h-full rounded-full object-cover"
                alt="Alice"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-medium">alice_tech</span>
          </div>

          <div className="flex flex-col items-center shrink-0 cursor-pointer">
            <div className="w-14 h-14 rounded-full border-2 border-indigo-500 p-0.5">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
                className="w-full h-full rounded-full object-cover"
                alt="Emily"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-medium">emily_chef</span>
          </div>
        </div>

        {/* Post Composer */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 shadow-md">
          <form onSubmit={handleCreatePost}>
            <div className="flex items-start gap-4">
              <img
                src={session?.user?.image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${session?.user?.username}`}
                className="w-10 h-10 rounded-full object-cover"
                alt="avatar"
              />
              <div className="flex-1 space-y-3">
                <textarea
                  placeholder={`What's happening in ${location.area || location.city} today?`}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-transparent text-slate-200 text-sm placeholder-slate-500 focus:outline-none h-20 resize-none"
                  required
                />
                
                {postType === 'IMAGE' && (
                  <input
                    type="text"
                    placeholder="Enter Image URL (Unsplash/Imgur etc.)"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="w-full px-3 py-1.5 glass-input text-xs text-slate-300 focus:border-indigo-500"
                  />
                )}

                {postType === 'POLL' && (
                  <div className="space-y-2">
                    {pollOptions.map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...pollOptions];
                          updated[i] = e.target.value;
                          setPollOptions(updated);
                        }}
                        className="w-full px-3 py-1.5 glass-input text-xs text-slate-300 focus:border-indigo-500"
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setPollOptions([...pollOptions, ''])}
                      className="text-[10px] text-indigo-400 font-semibold hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      + Add Option
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-900/60 pt-4 mt-3">
              {/* Type Selectors */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPostType('TEXT')}
                  className={`p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-white/5 transition-colors cursor-pointer ${postType === 'TEXT' ? 'text-indigo-500 bg-white/5' : ''}`}
                  title="Text Post"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('IMAGE')}
                  className={`p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-white/5 transition-colors cursor-pointer ${postType === 'IMAGE' ? 'text-indigo-500 bg-white/5' : ''}`}
                  title="Image Post"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('POLL')}
                  className={`p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-white/5 transition-colors cursor-pointer ${postType === 'POLL' ? 'text-indigo-500 bg-white/5' : ''}`}
                  title="Poll"
                >
                  <Vote className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Location Tag"
                  value={locationTag}
                  onChange={(e) => setLocationTag(e.target.value)}
                  className="bg-transparent border-none text-[11px] text-slate-400 placeholder-slate-600 focus:outline-none w-28 text-right"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/10 flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      Post <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
            <p className="text-xs">Curating hyperlocal feeds...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl border border-white/5 text-center text-slate-500">
            <p className="text-sm">No neighborhood posts found around this location.</p>
            <p className="text-xs mt-1">Be the first to share something with your neighbors!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const currentUserId = session?.user?.id;
              const hasLiked = post.likes.some((l: any) => l.userId === currentUserId);
              const authorProfile = post.user?.profile;
              const postVotes = post.votes || [];
              const hasVoted = postVotes.some((v: any) => v.userId === currentUserId);

              return (
                <div key={post.id} className="glass-card p-5 rounded-2xl border border-white/5 shadow-sm space-y-4">
                  {/* Post Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={authorProfile?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user.username}`}
                        className="w-10 h-10 rounded-full object-cover border border-white/5"
                        alt="author"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">
                            {authorProfile?.name || post.user.username}
                          </span>
                          {post.user.id === session?.user?.id && (
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full font-bold">You</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          @{post.user.username} • {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-slate-400">
                      <MapPin className="w-3 h-3 text-indigo-400" />
                      <span className="text-[9px] font-bold">{post.locationTag || 'Nearby'}</span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Post Media (Image) */}
                  {post.type === 'IMAGE' && post.mediaUrls && post.mediaUrls[0] && (
                    <div className="relative rounded-xl overflow-hidden border border-white/5">
                      <img
                        src={post.mediaUrls[0]}
                        alt="Post media"
                        className="w-full max-h-96 object-cover"
                      />
                    </div>
                  )}

                  {/* Poll Widget */}
                  {post.type === 'POLL' && post.polls && post.polls.length > 0 && (
                    <div className="space-y-2 bg-slate-900/40 p-4 rounded-xl border border-slate-900">
                      {post.polls.map((opt: any) => {
                        const optVotes = postVotes.filter((v: any) => v.optionId === opt.id).length;
                        const totalVotes = postVotes.length || 1;
                        const percent = Math.round((optVotes / totalVotes) * 100);
                        const userVotedThis = postVotes.some((v: any) => v.userId === currentUserId && v.optionId === opt.id);

                        return (
                          <div key={opt.id} className="relative">
                            <button
                              type="button"
                              onClick={() => !hasVoted && handlePollVote(post.id, opt.id)}
                              disabled={hasVoted}
                              className={`w-full text-left py-2.5 px-4 rounded-lg text-xs font-semibold border flex items-center justify-between transition-all relative overflow-hidden cursor-pointer ${
                                userVotedThis
                                  ? 'border-indigo-500 text-white bg-indigo-500/10'
                                  : 'border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-white/5'
                              }`}
                            >
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-indigo-500/15 transition-all"
                                style={{ width: `${percent}%` }}
                              />
                              <span className="relative z-10">{opt.optionText}</span>
                              <span className="relative z-10 text-[10px] text-slate-500 font-bold">{percent}% ({optVotes})</span>
                            </button>
                          </div>
                        );
                      })}
                      <p className="text-[9px] text-slate-500 text-right">{postVotes.length} total votes</p>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center gap-6 border-t border-slate-900/60 pt-3 text-slate-400">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 text-xs hover:text-indigo-400 transition-colors cursor-pointer ${hasLiked ? 'text-indigo-500 font-bold' : ''}`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{post.likes.length}</span>
                    </button>
                    
                    <button
                      onClick={() =>
                        setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)
                      }
                      className="flex items-center gap-1.5 text-xs hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments ? post.comments.length : 0}</span>
                    </button>

                    <button className="flex items-center gap-1.5 text-xs hover:text-indigo-400 transition-colors cursor-pointer ml-auto">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-1.5 text-xs hover:text-indigo-400 transition-colors cursor-pointer">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Comments Section */}
                  {activeCommentsPostId === post.id && (
                    <div className="border-t border-slate-900/60 pt-4 space-y-4 animate-slide-up">
                      {/* Comments list */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-3.5 max-h-60 overflow-y-auto pr-2">
                          {post.comments.map((comment: any) => (
                            <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                              <img
                                src={comment.user.profile?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.user.username}`}
                                className="w-7 h-7 rounded-full object-cover border border-white/5"
                                alt="avatar"
                              />
                              <div className="flex-1 bg-slate-900/60 rounded-xl p-2.5 border border-slate-900">
                                <p className="font-bold text-slate-300">
                                  {comment.user.profile?.name || comment.user.username}
                                  <span className="text-[9px] text-slate-500 font-normal ml-2">@{comment.user.username}</span>
                                </p>
                                <p className="text-slate-400 mt-1 leading-normal">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Composer */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="flex-grow px-3.5 py-2 glass-input text-xs text-slate-300 focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Suggestions & Neighborhood Widgets */}
      <div className="space-y-6">
        
        {/* Suggested Neighbors */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 shadow-md space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-400" /> Suggested Neighbors
          </h3>
          {suggestedPeople.length === 0 ? (
            <p className="text-xs text-slate-500">No suggestions in this area yet.</p>
          ) : (
            <div className="space-y-3">
              {suggestedPeople.map((person) => (
                <div key={person.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={person.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${person.userId}`}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">{person.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{person.area || person.city}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnectWithUser(person.userId)}
                    className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-500/20 transition-all cursor-pointer hover:scale-[1.03]"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nearby Events */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 shadow-md space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-purple-400" /> Local Events
          </h3>
          {events.length === 0 ? (
            <p className="text-xs text-slate-500">No local events upcoming.</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="p-3 bg-slate-900/60 border border-slate-900 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-bold text-slate-200">{event.title}</p>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold shrink-0">{event.category}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{event.description}</p>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-semibold pt-1">
                    <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                    <span>{event.address}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Marketplace Highlight */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 shadow-md space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-pink-400" /> Nearby Deals
          </h3>
          {listings.length === 0 ? (
            <p className="text-xs text-slate-500">No trading listings in your city.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {listings.map((item) => (
                <div key={item.id} className="p-2 bg-slate-900/60 border border-slate-900 rounded-xl flex flex-col justify-between text-[11px] space-y-1">
                  <div className="rounded-lg overflow-hidden h-20 bg-slate-950 border border-slate-900 shrink-0">
                    <img
                      src={item.mediaUrls && item.mediaUrls[0] ? item.mediaUrls[0] : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150'}
                      alt="listing img"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-bold text-slate-200 truncate">{item.title}</p>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-semibold">₹{item.price}</span>
                    <span className="text-indigo-400 uppercase font-bold text-[8px]">{item.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
