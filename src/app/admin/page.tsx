'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, AlertTriangle, Users, TrendingUp, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const USER_GROWTH_DATA = [
  { month: 'Jan', Users: 12 },
  { month: 'Feb', Users: 19 },
  { month: 'Mar', Users: 32 },
  { month: 'Apr', Users: 54 },
  { month: 'May', Users: 89 },
  { month: 'Jun', Users: 145 },
];

const CONTENT_STATS = [
  { category: 'Posts', Count: 142 },
  { category: 'Reels', Count: 68 },
  { category: 'Events', Count: 24 },
  { category: 'Listings', Count: 48 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Fetch reports from mock or actual DB queries
  const fetchReports = async () => {
    try {
      setLoading(true);
      // For development, we populate standard reports since database starts empty of reports
      // We can also fetch them from /api/admin/reports
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      } else {
        // Mock fallback if route isn't created yet to guarantee runtime out-of-the-box
        setReports([
          { id: 'rep-1', targetType: 'post', targetId: 'p-123', reason: 'Spam / Advertising cryptocurrency links', reporter: { username: 'bob_fitness' }, resolved: false, createdAt: new Date() },
          { id: 'rep-2', targetType: 'user', targetId: 'u-456', reason: 'Fake profile impersonating local city council member', reporter: { username: 'alice_tech' }, resolved: false, createdAt: new Date() }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MODERATOR') {
      // Access denied
      return;
    }

    fetchReports();
  }, [status, session]);

  const handleResolveReport = async (reportId: string) => {
    try {
      setResolvingId(reportId);
      // Simulate resolving
      setTimeout(() => {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
        setResolvingId(null);
      }, 800);
    } catch (e) {
      console.error(e);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <p className="text-sm">Loading security clearances...</p>
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MODERATOR') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto space-y-4">
        <Shield className="w-12 h-12 text-red-500" />
        <h2 className="text-lg font-bold text-white">Access Denied</h2>
        <p className="text-xs text-slate-500">
          Only users with administrative or moderator privileges can view the NearMe Safety Moderation panel.
        </p>
        <button
          onClick={() => router.push('/feed')}
          className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-semibold text-white cursor-pointer"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-900 pb-4">
        <Shield className="w-5 h-5 text-indigo-400" />
        <h2 className="text-base font-bold text-white">Admin Administration Panel</h2>
      </div>

      {/* Cards stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm">
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Total Neighbors</p>
            <p className="text-xl font-bold text-white">145</p>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Growth Factor</p>
            <p className="text-xl font-bold text-emerald-400">+18.4%</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Moderation queue</p>
            <p className="text-xl font-bold text-amber-500">{reports.length} pending</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Graphs charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Neighbor Growth Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={USER_GROWTH_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                <Line type="monotone" dataKey="Users" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Content Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CONTENT_STATS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                <Bar dataKey="Count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Safety Reports Moderation queue */}
      <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-4.5 h-4.5 text-amber-500" /> Pending Safety Reports
        </h3>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          </div>
        ) : reports.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-400">Queue is completely clear!</p>
            <p>No user content has been flagged.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-900/60">
            {reports.map((report) => (
              <div key={report.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold uppercase text-[9px] border border-red-500/20">
                      Flagged {report.targetType}
                    </span>
                    <span className="text-slate-500 text-[10px]">Reporter: @{report.reporter.username}</span>
                  </div>
                  <p className="text-slate-200 font-medium">{report.reason}</p>
                  <p className="text-[10px] text-slate-500">Target ID: {report.targetId}</p>
                </div>
                <button
                  onClick={() => handleResolveReport(report.id)}
                  disabled={resolvingId === report.id}
                  className="px-3.5 py-1.5 bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg border border-emerald-500/20 hover:border-transparent font-bold transition-all shrink-0 cursor-pointer self-start sm:self-center"
                >
                  {resolvingId === report.id ? 'Resolving...' : 'Dismiss / Resolve'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
