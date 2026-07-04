'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/context/SocketContext';
import {
  MessageSquare, Send, Phone, Video, Search, User, Loader2,
  X, CheckCheck, Smile, PhoneOff, Mic, MicOff, Camera, CameraOff, Monitor
} from 'lucide-react';

export default function MessagesPage() {
  const { data: session } = useSession();
  const { socket, onlineUsers } = useSocket();

  // Chat state
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Call simulation states
  const [callingState, setCallingState] = useState<'idle' | 'calling' | 'incoming' | 'connected'>('idle');
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [callerName, setCallerName] = useState('');
  const [callerAvatar, setCallerAvatar] = useState('');
  const [callRecipientId, setCallRecipientId] = useState('');
  
  // Call hardware toggles
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all user rooms
  const fetchRooms = async () => {
    try {
      setRoomsLoading(true);
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (e) {
      console.error('Error fetching chats:', e);
    } finally {
      setRoomsLoading(false);
    }
  };

  // Fetch messages for active room
  const fetchMessages = async (roomId: string) => {
    try {
      setMessagesLoading(true);
      const res = await fetch(`/api/messages?roomId=${roomId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error('Error fetching messages:', e);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Listen to socket connections & signals
  useEffect(() => {
    if (!socket) return;

    socket.on('receive-message', (message: any) => {
      // If the message is for the currently selected room, append it
      if (selectedRoom && message.roomId === selectedRoom.id) {
        setMessages((prev) => [...prev, message]);
      }
      // Update last message in the room list
      setRooms((prev) =>
        prev.map((r) => {
          if (r.id === message.roomId) {
            return { ...r, messages: [message] };
          }
          return r;
        })
      );
    });

    // WebRTC call handlers simulation
    socket.on('incoming-call', ({ from, name, avatar, signal }) => {
      setCallingState('incoming');
      setCallerName(name);
      setCallerAvatar(avatar);
      setCallRecipientId(from);
    });

    socket.on('call-accepted', () => {
      setCallingState('connected');
    });

    socket.on('call-ended', () => {
      setCallingState('idle');
    });

    return () => {
      socket.off('receive-message');
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('call-ended');
    };
  }, [socket, selectedRoom]);

  // Scroll to bottom on message appends
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectRoom = (room: any) => {
    setSelectedRoom(room);
    fetchMessages(room.id);
    if (socket) {
      socket.emit('join-room', room.id);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedRoom) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          content: inputText,
        }),
      });

      if (res.ok) {
        const { message } = await res.json();
        setMessages((prev) => [...prev, message]);
        setInputText('');

        // Emit message to Socket
        if (socket) {
          socket.emit('send-message', {
            roomId: selectedRoom.id,
            message,
          });
        }

        // Update last message in room list
        setRooms((prev) =>
          prev.map((r) => {
            if (r.id === selectedRoom.id) {
              return { ...r, messages: [message] };
            }
            return r;
          })
        );
      }
    } catch (e) {
      console.error('Error sending message:', e);
    }
  };

  // Simulate starting a voice or video call (WebRTC signal triggers)
  const handleStartCall = (type: 'voice' | 'video') => {
    if (!selectedRoom) return;
    
    // Find recipient profile in participants list
    const recipient = selectedRoom.participants.find(
      (p: any) => p.user.id !== session?.user?.id
    )?.user;

    if (!recipient) return;

    setCallType(type);
    setCallingState('calling');
    setCallerName(recipient.profile?.name || recipient.username);
    setCallerAvatar(recipient.profile?.avatar || '');
    setCallRecipientId(recipient.id);

    if (socket) {
      socket.emit('call-user', {
        userToCall: recipient.id,
        from: session?.user?.id,
        callerName: session?.user?.name,
        callerAvatar: session?.user?.image,
        signalData: 'sdp-handshake-mock-token',
      });
    }
  };

  // Accept incoming call
  const handleAcceptCall = () => {
    setCallingState('connected');
    if (socket) {
      socket.emit('answer-call', {
        to: callRecipientId,
        signal: 'sdp-handshake-accept-mock-token',
      });
    }
  };

  // Reject / Terminate call
  const handleEndCall = () => {
    setCallingState('idle');
    if (socket) {
      socket.emit('end-call', { to: callRecipientId });
    }
  };

  return (
    <div className="flex-1 flex glass border border-white/5 rounded-2xl overflow-hidden min-h-[calc(100vh-140px)] relative">
      
      {/* 1. Sidebar chat directory */}
      <div className="w-80 border-r border-slate-900 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-900 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4.5 h-4.5 text-indigo-400" /> Messaging
          </h2>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 glass-input text-xs text-slate-300 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {roomsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            </div>
          ) : rooms.length === 0 ? (
            <p className="text-xs text-slate-500 p-4 text-center">No active chats.</p>
          ) : (
            <div className="divide-y divide-slate-900/40">
              {rooms
                .filter((r) => {
                  if (r.isGroup) return r.name?.toLowerCase().includes(searchQuery.toLowerCase());
                  const otherPart = r.participants.find((p: any) => p.user.id !== session?.user?.id)?.user;
                  return otherPart?.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || otherPart?.username?.toLowerCase().includes(searchQuery.toLowerCase());
                })
                .map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  
                  // Extract recipient profile
                  let displayName = room.name || 'Group Chat';
                  let displayAvatar = room.avatar || '';
                  let otherUserId = '';
                  
                  if (!room.isGroup) {
                    const recipient = room.participants.find((p: any) => p.user.id !== session?.user?.id)?.user;
                    if (recipient) {
                      displayName = recipient.profile?.name || recipient.username;
                      displayAvatar = recipient.profile?.avatar || '';
                      otherUserId = recipient.id;
                    }
                  }

                  const isUserOnline = onlineUsers.has(otherUserId);
                  const lastMsg = room.messages && room.messages[0];

                  return (
                    <div
                      key={room.id}
                      onClick={() => handleSelectRoom(room)}
                      className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-600/10 border-l-2 border-indigo-500' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={displayAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${displayName}`}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {isUserOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-bold text-slate-200 truncate">{displayName}</p>
                        <p className="text-slate-500 truncate mt-0.5">
                          {lastMsg ? lastMsg.content : 'No messages yet.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Active Chat Stream */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/10">
        {selectedRoom ? (
          <>
            {/* Header info */}
            <div className="px-5 py-4 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedRoom.isGroup
                      ? selectedRoom.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedRoom.name}`
                      : selectedRoom.participants.find((p: any) => p.user.id !== session?.user?.id)?.user.profile?.avatar || ''
                  }
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                  alt="avatar"
                />
                <div>
                  <p className="text-sm font-bold text-white">
                    {selectedRoom.isGroup
                      ? selectedRoom.name
                      : selectedRoom.participants.find((p: any) => p.user.id !== session?.user?.id)?.user.profile?.name || 'Local User'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {selectedRoom.isGroup ? 'Community Chat' : 'Active Connection'}
                  </p>
                </div>
              </div>

              {/* Calling buttons (Only for 1-to-1) */}
              {!selectedRoom.isGroup && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartCall('voice')}
                    className="p-2.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                    title="Voice Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStartCall('video')}
                    className="p-2.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                    title="Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.senderId === session?.user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium ${
                          isOwn
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 mt-1">
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isOwn && <CheckCheck className="w-3.5 h-3.5 text-indigo-300" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-900 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 glass-input text-xs sm:text-sm text-slate-200 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6">
            <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
            <p className="text-sm font-semibold">Start a Conversation</p>
            <p className="text-xs text-slate-600 mt-1">Select a neighborhood contact to start chatting in real-time.</p>
          </div>
        )}
      </div>

      {/* 3. Calling Overlay Mockup */}
      {callingState !== 'idle' && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center animate-slide-up">
          {/* Caller Details */}
          <div className="space-y-4 mb-12">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 p-1 relative mx-auto">
              <img
                src={callerAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${callerName}`}
                className="w-full h-full rounded-full object-cover"
                alt="caller avatar"
              />
              {callingState === 'connected' && (
                <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{callerName}</h2>
              <p className="text-xs text-slate-500 mt-1">
                {callingState === 'calling' && 'Ringing...'}
                {callingState === 'incoming' && `Incoming ${callType} call...`}
                {callingState === 'connected' && `Connected • Live ${callType} transmission`}
              </p>
            </div>
          </div>

          {/* Video display overlay mockup (if call is connected & video is active) */}
          {callingState === 'connected' && callType === 'video' && cameraActive && (
            <div className="w-full max-w-sm h-48 bg-slate-900 border border-slate-800 rounded-xl mb-12 relative overflow-hidden flex items-center justify-center text-slate-600">
              <img
                src={callerAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${callerName}`}
                className="w-full h-full object-cover filter blur-[2px] opacity-40"
                alt="caller videofeed"
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-bold">
                [WebRTC Peer-to-Peer active]
              </span>
              <div className="absolute bottom-2 right-2 w-16 h-12 bg-black border border-white/10 rounded overflow-hidden">
                <img
                  src={session?.user?.image || ''}
                  className="w-full h-full object-cover"
                  alt="self preview"
                />
              </div>
            </div>
          )}

          {/* Action buttons controls */}
          <div className="flex items-center gap-4">
            {callingState === 'incoming' ? (
              <>
                <button
                  onClick={handleEndCall}
                  className="p-4 bg-red-600 hover:bg-red-500 rounded-full text-white cursor-pointer"
                  title="Decline"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
                <button
                  onClick={handleAcceptCall}
                  className="p-4 bg-emerald-600 hover:bg-emerald-500 rounded-full text-white cursor-pointer"
                  title="Accept"
                >
                  <Phone className="w-6 h-6 animate-pulse" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setMicActive(!micActive)}
                  className={`p-3 rounded-full border cursor-pointer ${
                    micActive ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-red-600 border-transparent text-white'
                  }`}
                  title={micActive ? 'Mute' : 'Unmute'}
                >
                  {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleEndCall}
                  className="p-4 bg-red-600 hover:bg-red-500 rounded-full text-white cursor-pointer"
                  title="End Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>

                {callType === 'video' && (
                  <button
                    onClick={() => setCameraActive(!cameraActive)}
                    className={`p-3 rounded-full border cursor-pointer ${
                      cameraActive ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-red-600 border-transparent text-white'
                    }`}
                    title={cameraActive ? 'Stop Video' : 'Start Video'}
                  >
                    {cameraActive ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
