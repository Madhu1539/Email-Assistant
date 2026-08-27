import Head from 'next/head';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import { Settings } from 'lucide-react';
import useAuthStore from '@/store/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute>
      <Head>
        <title>Settings — Intelligent Email Assistant</title>
      </Head>
      <AppShell>
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-8">
            <Settings className="w-5 h-5 text-indigo-400" aria-hidden="true" />
            <h1 className="text-base font-semibold text-[#f0f0f8]">Settings</h1>
          </div>

          <div className="bg-[#1a1a24] border border-[#2a2a38] rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[#9898b0] uppercase tracking-wider">Account</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#60607a] mb-0.5">Name</p>
                <p className="text-sm text-[#f0f0f8] font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-[#60607a] mb-0.5">Email</p>
                <p className="text-sm text-[#f0f0f8] font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-[#60607a] mb-0.5">Member since</p>
                <p className="text-sm text-[#f0f0f8] font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
