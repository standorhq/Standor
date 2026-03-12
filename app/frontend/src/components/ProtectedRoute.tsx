import { Navigate, useLocation } from 'react-router-dom';
import { type ReactNode, useEffect, useState } from 'react';
import useStore from '../store/useStore';
import api from '../lib/api';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'ADMIN' | 'USER';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, token, setAuth, logout } = useStore();
  const location = useLocation();
  const [checking, setChecking] = useState(!user && !!token);

  useEffect(() => {
    // Check token expiration first
    if (token) {
      const store = useStore.getState();
      const isExpired = store.checkTokenExpiration();
      
      if (isExpired) {
        import('sonner').then(({ toast }) => {
          toast.error('Session Expired', {
            description: 'Your session has expired. Please log in again.',
          });
        });
        logout();
        setChecking(false);
        return;
      }
    }
    
    if (!user && token) {
      api.get('/auth/me')
        .then(({ data }) => {
          const u = data.user ?? data;
          // Use setAuth to persist user but preserve existing token expiration
          const existingExp = localStorage.getItem('standor_token_expiration');
          setAuth({
            id: u._id ?? u.id,
            _id: u._id ?? u.id,
            email: u.email,
            name: u.name,
            role: u.role ?? 'USER',
            avatar: u.avatar ?? u.profileImage,
            emailVerified: u.emailVerified,
            mfaEnabled: u.mfaEnabled ?? false,
          }, token);
          // Restore original expiration so refresh doesn't extend the timer
          if (existingExp) {
            localStorage.setItem('standor_token_expiration', existingExp);
          }
          setChecking(false);
        })
        .catch(() => {
          logout();
          setChecking(false);
        });
    } else {
      setChecking(false);
    }
  }, [user, token, setAuth, logout]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest">
            Authenticating
          </span>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
