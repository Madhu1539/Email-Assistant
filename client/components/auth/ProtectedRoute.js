import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '@/store/authStore';
import Spinner from '@/components/ui/Spinner';

/**
 * ProtectedRoute HOC
 *
 * Wraps any page that requires authentication.
 * - Shows loading spinner while auth state is being initialized
 * - Redirects to /login if user is not authenticated
 * - Renders children if authenticated
 *
 * Usage:
 *   export default function MyPage() { ... }
 *   MyPage.requireAuth = true;
 *
 *   // In _app.js, wrap with ProtectedRoute if Component.requireAuth is true
 */
export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f14]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-[#9898b0]">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect is in progress; render nothing to prevent flash
    return null;
  }

  return children;
}
