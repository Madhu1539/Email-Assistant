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
import { validateRegistration, isValid, getApiError, getApiFieldErrors } from '@/utils/validators';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { showSuccess } = useUiStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
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
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateRegistration(form);
    if (!isValid(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        passwordConfirmation: form.passwordConfirmation,
      });

      showSuccess('Account created! Please sign in.');
      router.replace('/login');
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
        <title>Create Account — Intelligent Email Assistant</title>
        <meta name="description" content="Create your Intelligent Email Assistant account." />
      </Head>

      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="font-semibold text-[#f0f0f8] text-lg">Email Assistant</span>
            </Link>
            <h1 className="text-2xl font-bold text-[#f0f0f8]">Create your account</h1>
            <p className="text-sm text-[#9898b0] mt-2">Get started with AI-powered email management</p>
          </div>

          {/* Card */}
          <div className="bg-[#1a1a24] border border-[#2a2a38] rounded-2xl p-8">
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
                id="name"
                name="name"
                type="text"
                label="Full name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                required
                autoComplete="name"
              />

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
                helperText="At least 8 characters"
                required
                autoComplete="new-password"
              />

              <Input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                label="Confirm password"
                placeholder="••••••••"
                value={form.passwordConfirmation}
                onChange={handleChange}
                error={errors.passwordConfirmation}
                required
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isSubmitting}
                size="lg"
              >
                Create account
              </Button>
            </form>
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-[#9898b0] mt-6">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
