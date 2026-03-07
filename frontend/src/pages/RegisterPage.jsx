import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await register(email, name, password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-secondary/10 via-base-200 to-accent/10 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative text-center max-w-sm"
        >
          <div className="flex justify-center mb-6">
            <div className="size-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/30">
              <Sparkles className="size-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black gradient-text mb-3">Join Standor</h1>
          <p className="text-base-content/60 text-lg">Start conducting better technical interviews today</p>
          <div className="mt-8 p-4 bg-base-300/50 rounded-2xl border border-base-300 text-left">
            <p className="text-sm font-semibold mb-3 text-base-content/80">Free plan includes:</p>
            {[
              'Unlimited interview sessions',
              'Monaco code editor with sync',
              'AI analysis (OpenRouter)',
              'WebRTC video calls',
              'Email reports via Brevo'
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-base-content/70 mb-2">
                <div className="size-4 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                  <div className="size-1.5 rounded-full bg-success" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="size-5 text-white" />
            </div>
            <span className="font-black text-2xl gradient-text">Standor</span>
          </div>

          <h2 className="text-3xl font-black mb-2">Create account</h2>
          <p className="text-base-content/60 mb-8">Start your free account today. No credit card required.</p>

          {/* Google OAuth */}
          <div className="mb-6">
            <GoogleLogin
              onSuccess={async ({ credential }) => {
                try {
                  const { data } = await api.post('/auth/google', { credential });
                  localStorage.setItem('token', data.token);
                  localStorage.setItem('user', JSON.stringify(data.user));
                  window.location.href = '/dashboard';
                } catch {
                  toast.error('Google sign-up failed');
                }
              }}
              onError={() => toast.error('Google sign-up failed')}
              shape="rectangular"
              size="large"
              width="100%"
              text="signup_with"
            />
          </div>

          <div className="divider text-base-content/40 text-xs">OR REGISTER WITH EMAIL</div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label pb-1"><span className="label-text font-medium">Full Name</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered w-full pl-10"
                  placeholder="John Smith"
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label pb-1"><span className="label-text font-medium">Email</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label pb-1"><span className="label-text font-medium">Password</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full pl-10 pr-10"
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full rounded-xl" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
