import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, ArrowRight } from 'lucide-react';
import api, { API_BASE } from '../lib/api';
import StandorLogo from '../components/StandorLogo';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 12) {
      setError('Password must be at least 12 characters');
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the terms to continue.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', { name, email, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-950/50 border border-green-900/50 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Check your email</h2>
          <p className="text-[#a1a1aa] text-sm mb-6">
            We've sent a verification link to <strong className="text-white">{email}</strong>.
            Click the link to activate your account.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-lg font-semibold text-sm hover:bg-neutral-200 transition-colors"
          >
            Go to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] px-4 font-sans">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-12">
        <StandorLogo size={32} />
        <span className="text-white font-semibold text-xl tracking-tight">Standor</span>
      </div>

      <div className="w-full max-w-[440px] p-8 sm:p-10 border border-white/5 bg-[#0a0a0a] rounded-[1.5rem] shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create account</h1>
          <p className="text-[#a1a1aa] text-[15px]">Start conducting technical interviews for free.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div role="alert" data-testid="error-msg" className="p-3 bg-red-950/50 border border-red-900/50 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-[13px] text-[#a1a1aa] mb-2 font-medium">
              Name
            </label>
            <input
              id="name"
              data-testid="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              autoComplete="name"
              className="w-full px-4 py-3 bg-[#111111] border border-[#222222] rounded-[10px] text-white text-[15px] placeholder:text-[#555555] focus:outline-none focus:border-[#444] transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-[13px] text-[#a1a1aa] mb-2 font-medium">
              Email
            </label>
            <input
              id="email"
              data-testid="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
              className="w-full px-4 py-3 bg-[#111111] border border-[#222222] rounded-[10px] text-white text-[15px] placeholder:text-[#555555] focus:outline-none focus:border-[#444] transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-[13px] text-[#a1a1aa] mb-2 font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                data-testid="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 12 characters"
                required
                autoComplete="new-password"
                className="w-full pl-4 pr-12 py-3 bg-[#111111] border border-[#222222] rounded-[10px] text-white text-[15px] placeholder:text-[#555555] focus:outline-none focus:border-[#444] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors"
              >
                {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>
            <p className="text-[12px] text-[#555] mt-2">Must be at least 12 characters</p>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 mt-2">
            <div className="flex items-center h-5 mt-1">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 bg-[#111] border-[#333] rounded focus:ring-0 checked:bg-white checked:border-white transition-all cursor-pointer appearance-none relative before:content-[''] before:absolute before:hidden checked:before:block before:w-[4px] before:h-[8px] before:border-r-[2px] before:border-b-[2px] before:border-black before:rotate-45 before:left-[5.5px] before:top-[2.5px]"
              />
            </div>
            <label htmlFor="terms" className="text-[12px] leading-[18px] text-[#777] cursor-pointer">
              I agree to the <Link to="/privacy" className="text-white hover:underline">Privacy Policy</Link> and <Link to="/terms" className="text-white hover:underline">Terms of Service</Link>. I consent to my data being processed as described therein.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            data-testid="register-btn"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-[14px] bg-white text-black rounded-[10px] font-semibold text-[15px] hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-[#222]" />
          <span className="text-[11px] text-[#555]">or</span>
          <div className="flex-1 h-px bg-[#222]" />
        </div>

        {/* Google Register */}
        <button
          onClick={handleGoogleRegister}
          className="w-full flex items-center justify-center gap-3 px-4 py-[14px] bg-[#0A0A0A] text-white border border-[#222] rounded-[10px] font-medium text-[15px] hover:bg-[#111] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>
      </div>

      <p className="text-center text-[13px] text-[#777] mt-8">
        Already have an account?{' '}
        <Link to="/login" className="text-white hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
