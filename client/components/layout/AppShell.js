import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Inbox, Search, PenSquare, Activity, Settings,
  Plug, LogOut, Mail, Menu, X, Wifi, WifiOff,
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useGmailStore from '@/store/gmailStore';
import useUiStore from '@/store/uiStore';
import api from '@/services/api';

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Inbox',        icon: Inbox },
  { href: '/search',       label: 'Search',       icon: Search },
  { href: '/compose',      label: 'Compose',      icon: PenSquare },
  { href: '/activity',     label: 'Activity',     icon: Activity },
  { href: '/integrations', label: 'Integrations', icon: Plug },
  { href: '/settings',     label: 'Settings',     icon: Settings },
];

function NavItem({ href, label, icon: Icon, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-150 group
        ${active
          ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
          : 'text-[#9898b0] hover:bg-[#22222e] hover:text-[#f0f0f8] border border-transparent'}
      `}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-400' : 'text-[#60607a] group-hover:text-[#9898b0]'}`} aria-hidden="true" />
      {label}
    </Link>
  );
}

function GmailStatusBadge({ isConnected, gmailEmail }) {
  return (
    <div className={`
      flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
      ${isConnected
        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}
    `}>
      {isConnected
        ? <Wifi className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        : <WifiOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
      <span className="truncate">
        {isConnected ? (gmailEmail || 'Gmail connected') : 'Gmail not connected'}
      </span>
    </div>
  );
}

export default function AppShell({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, clearUser } = useAuthStore();
  const { isConnected, gmailEmail, clearGmailStatus } = useGmailStore();
  const { showSuccess, showError } = useUiStore();

  const currentPath = router.pathname;

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
      clearUser();
      clearGmailStatus();
      showSuccess('Logged out successfully.');
      router.replace('/login');
    } catch {
      showError('Logout failed. Please try again.');
    }
  }

  const sidebar = (
    <aside
      className="flex flex-col h-full w-64 bg-[#1a1a24] border-r border-[#2a2a38]"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[#2a2a38]">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <Mail className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#f0f0f8] leading-none">Email Assistant</p>
          <p className="text-xs text-[#60607a] mt-0.5">AI-powered</p>
        </div>
      </div>

      {/* Gmail status */}
      <div className="px-3 pt-4">
        <GmailStatusBadge isConnected={isConnected} gmailEmail={gmailEmail} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={currentPath === item.href}
            onClick={() => setSidebarOpen(false)}
          />
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4 border-t border-[#2a2a38] pt-4 space-y-2">
        <div className="px-3 py-2 rounded-lg bg-[#22222e]">
          <p className="text-sm font-medium text-[#f0f0f8] truncate">{user?.name}</p>
          <p className="text-xs text-[#60607a] truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#9898b0] hover:bg-[#22222e] hover:text-red-400 transition-all duration-150 border border-transparent"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#0f0f14] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 flex">
            {sidebar}
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[#2a2a38] bg-[#1a1a24]">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 rounded-lg text-[#9898b0] hover:text-[#f0f0f8] hover:bg-[#22222e] transition-colors"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <Mail className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-[#f0f0f8]">Email Assistant</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
