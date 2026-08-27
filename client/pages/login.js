import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Mail } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import useAuthStore from '@/store/authStore';
import useUiStore from '@/store/uiStore';
import api from '@/services/api';
import { validateLogin, isValid, getApiError, getApiFieldErrors } from '@/utils/validators';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, setUser } = useAuthStore();
  const { showSuccess } = useUiStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect already-authenticated users
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateLogin(form);
    if (!isValid(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      const response = await api.post('/auth/login', {
        email: form.email.trim(),
        password: form.password,
      });

      const { user } = response.data.data;
      setUser(user);
      showSuccess(`Welcome back, ${user.name}!`);
      router.replace('/dashboard');
    } catch (err) {
      const fieldErrors = getApiFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setApiError(getApiError(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) return null;

  return (
    <>
      <Head>
        <title>Sign In — Intelligent Email Assistant</title>
        <meta name="description" content="Sign in to your Intelligent Email Assistant account." />
      </Head>

      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center px-4">
        <div className="w-full max-w-md fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="font-semibold text-[#f0f0f8] text-lg">Email Assistant</span>
            </Link>
            <h1 className="text-2xl font-bold text-[#f0f0f8]">Welcome back</h1>
            <p className="text-sm text-[#9898b0] mt-2">Sign in to your account to continue</p>
          </div>

          {/* Card */}
          <div className="bg-[#1a1a24] border border-[#2a2a38] rounded-2xl p-8">
            {/* API-level error */}
            {apiError && (
              <div
                role="alert"
                className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400"
              >
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                required
                autoComplete="email"
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isSubmitting}
                size="lg"
              >
                Sign in
              </Button>
            </form>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-[#9898b0] mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
