'use client';

import { LeftNav } from '@/components/LeftNav';
import { TopBar } from '@/components/TopBar';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Shield, Bell } from 'lucide-react';

const SECTIONS = [
  {
    id: 'profile',
    Icon: User,
    title: 'Profile',
    desc: 'Update your display name and avatar.',
  },
  {
    id: 'account',
    Icon: Mail,
    title: 'Account',
    desc: 'Manage email address and password.',
  },
  {
    id: 'security',
    Icon: Shield,
    title: 'Security',
    desc: 'Two-factor authentication and active sessions.',
  },
  {
    id: 'notifications',
    Icon: Bell,
    title: 'Notifications',
    desc: 'Email and in-app notification preferences.',
  },
];

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-bg-base">
      <LeftNav />
      <div className="flex flex-1 flex-col" style={{ marginLeft: 'var(--nav-w-collapsed)' }}>
        <TopBar />
        <main
          className="flex-1 overflow-y-auto px-6 lg:px-10"
          style={{ paddingTop: 'calc(var(--topbar-h) + 2rem)', paddingBottom: '2rem' }}
        >
          <div className="mb-8">
            <h1 className="text-h2 font-bold text-text-primary">Settings</h1>
            <p className="mt-1 text-sm text-text-secondary">Manage your account and preferences.</p>
          </div>

          {/* User card */}
          {user && (
            <div className="card mb-8 flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-lg font-bold text-teal-400">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-text-primary">{user.name}</p>
                <p className="text-sm text-text-secondary">{user.email}</p>
              </div>
            </div>
          )}

          {/* Settings sections */}
          <div className="space-y-2 max-w-2xl">
            {SECTIONS.map(({ id, Icon, title, desc }) => (
              <button
                key={id}
                className="card w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-bg-panel"
                aria-label={`Open ${title} settings`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-elevated text-text-secondary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary">{title}</p>
                  <p className="text-xs text-text-secondary">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
