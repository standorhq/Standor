import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, LogOut, Sparkles, Clock, CheckCircle, Activity,
  Copy, ChevronRight, Calendar, Code2, X, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const difficultyColor = { easy: 'badge-success', medium: 'badge-warning', hard: 'badge-error' };

function StatsCard({ label, value, icon: Icon, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-base-200 rounded-2xl p-5 border border-base-300 flex items-center gap-4"
    >
      <div className={`size-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="size-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-base-content/60 text-sm">{label}</p>
      </div>
    </motion.div>
  );
}

function SessionCard({ session, index }) {
  const navigate = useNavigate();
  const shareLink = `${window.location.origin}/session/${session.roomId}`;

  const copyLink = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-base-200 rounded-2xl p-5 border border-base-300 hover:border-primary/30 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold truncate group-hover:text-primary transition-colors">{session.problem}</h3>
          <p className="text-xs text-base-content/40 mt-0.5 font-mono">Room #{session.roomId}</p>
        </div>
        <span className={`badge ${difficultyColor[session.difficulty] || 'badge-ghost'} badge-sm capitalize flex-shrink-0`}>
          {session.difficulty}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm mb-3">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${session.status === 'active' ? 'bg-success animate-pulse' : 'bg-base-content/20'}`} />
          <span className={`capitalize text-xs ${session.status === 'active' ? 'text-success' : 'text-base-content/40'}`}>
            {session.status}
          </span>
        </div>
        <span className="text-xs text-base-content/40 flex items-center gap-1">
          <Calendar className="size-3" />
          {new Date(session.createdAt).toLocaleDateString()}
        </span>
      </div>

      {session.aiAnalysis && (
        <div className="mb-3 px-3 py-2 bg-base-300 rounded-xl flex items-center justify-between text-xs">
          <span className="text-base-content/50 flex items-center gap-1.5">
            <Sparkles className="size-3 text-primary" /> AI Score
          </span>
          <span className={`font-bold ${session.aiAnalysis.overallScore >= 70 ? 'text-success' : session.aiAnalysis.overallScore >= 50 ? 'text-warning' : 'text-error'}`}>
            {session.aiAnalysis.overallScore}/100
          </span>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={copyLink} className="btn btn-ghost btn-xs gap-1 flex-1 border border-base-300 rounded-lg">
          <Copy className="size-3" /> Copy Link
        </button>
        {session.status === 'active' ? (
          <Link to={`/session/${session.roomId}`} className="btn btn-primary btn-xs gap-1 flex-1 rounded-lg">
            Join <ChevronRight className="size-3" />
          </Link>
        ) : (
          <button disabled className="btn btn-ghost btn-xs flex-1 rounded-lg opacity-40">Ended</button>
        )}
      </div>
    </motion.div>
  );
}

function CreateSessionModal({ onClose }) {
  const [problem, setProblem] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: createSession, isPending } = useMutation({
    mutationFn: (data) => api.post('/sessions', data).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['sessions']);
      toast.success('Session created!');
      navigate(`/session/${data.session.roomId}`);
    },
    onError: () => toast.error('Failed to create session')
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal modal-open"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="modal-box max-w-md bg-base-200 relative"
      >
        <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle absolute right-4 top-4">
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Code2 className="size-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">New Interview Session</h3>
            <p className="text-xs text-base-content/50">Create a collaborative coding room</p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); createSession({ problem, difficulty }); }} className="space-y-4">
          <div className="form-control">
            <label className="label pb-1"><span className="label-text font-medium">Problem Name</span></label>
            <input
              type="text"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="input input-bordered"
              placeholder="e.g., Two Sum, Merge Intervals..."
              required
            />
          </div>

          <div className="form-control">
            <label className="label pb-1"><span className="label-text font-medium">Difficulty</span></label>
            <div className="flex gap-2">
              {[
                { val: 'easy', cls: 'btn-success' },
                { val: 'medium', cls: 'btn-warning' },
                { val: 'hard', cls: 'btn-error' }
              ].map(({ val, cls }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDifficulty(val)}
                  className={`flex-1 btn btn-sm capitalize rounded-xl ${difficulty === val ? cls : 'btn-ghost border border-base-300'}`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1 rounded-xl">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1 rounded-xl gap-2" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Create Room'}
            </button>
          </div>
        </form>
      </motion.div>
      <div className="modal-backdrop bg-base-100/50 backdrop-blur-sm" onClick={onClose} />
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data } = await api.get('/sessions/my-sessions');
      return data.sessions || [];
    }
  });

  const handleLogout = () => { logout(); navigate('/'); };

  const filteredSessions = filter === 'all' ? sessions : sessions.filter((s) => s.status === filter);
  const stats = {
    total: sessions.length,
    active: sessions.filter((s) => s.status === 'active').length,
    completed: sessions.filter((s) => s.status === 'completed').length,
    analyzed: sessions.filter((s) => s.aiAnalysis).length
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -56, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20">
              <Sparkles className="size-4 text-white" />
            </div>
            <span className="font-black text-lg gradient-text font-mono">Standor</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-base-200 rounded-full px-3 py-1.5 border border-base-300">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
                alt={user?.name}
                className="size-6 rounded-full"
              />
              <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm gap-2 rounded-xl">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black">
              Hey, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-base-content/60 mt-1">Manage your interview sessions</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary rounded-xl gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="size-5" />
            New Session
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard label="Total Sessions" value={stats.total} icon={Activity} color="bg-gradient-to-br from-primary to-blue-600" delay={0} />
          <StatsCard label="Active" value={stats.active} icon={Clock} color="bg-gradient-to-br from-success to-emerald-600" delay={0.05} />
          <StatsCard label="Completed" value={stats.completed} icon={CheckCircle} color="bg-gradient-to-br from-secondary to-violet-600" delay={0.1} />
          <StatsCard label="AI Analyzed" value={stats.analyzed} icon={Sparkles} color="bg-gradient-to-br from-accent to-pink-600" delay={0.15} />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {[
            { key: 'all', label: 'All Sessions' },
            { key: 'active', label: `Active (${stats.active})` },
            { key: 'completed', label: `Completed (${stats.completed})` }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`btn btn-sm rounded-xl ${filter === key ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sessions grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="size-20 rounded-3xl bg-base-200 border border-base-300 flex items-center justify-center mx-auto mb-4">
              <Code2 className="size-10 text-base-content/20" />
            </div>
            <p className="text-base-content/50 text-lg font-medium mb-1">No sessions found</p>
            <p className="text-base-content/30 text-sm">Create your first interview session to get started</p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm rounded-xl mt-5 gap-2">
              <Plus className="size-4" /> Create Session
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session, i) => (
              <SessionCard key={session._id} session={session} index={i} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && <CreateSessionModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
