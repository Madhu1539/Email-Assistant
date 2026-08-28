import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Mail, Sparkles, Shield, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import useAuthStore from '@/store/authStore';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-Powered Summaries',
    desc: 'Get instant email summaries and context without reading every word.',
  },
  {
    icon: Zap,
    title: 'Smart Reply Drafts',
    desc: 'Generate professional reply drafts with one click, then edit and send.',
  },
  {
    icon: Shield,
    title: 'Secure by Design',
    desc: 'OAuth 2.0, encrypted tokens, no Gmail password ever stored.',
  },
];

const BULLETS = [
  'Connect your Gmail with one click',
  'Read, search, and manage emails',
  'AI summaries and reply drafts',
  'Archive, star, and delete effortlessly',
];

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <>
      <Head>
        <title>Intelligent Email Assistant — AI-Powered Gmail Management</title>
        <meta
          name="description"
          content="Manage your Gmail smarter with AI summaries, reply drafts, and a beautiful dashboard. Secure OAuth 2.0 connection."
        />
      </Head>

      <div className="min-h-screen bg-[#0f0f14] text-[#f0f0f8] flex flex-col">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a38] max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-semibold text-[#f0f0f8]">Email Assistant</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[#9898b0] hover:text-[#f0f0f8] transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
            >
              Get started
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 max-w-4xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
            <span className="text-xs font-medium text-indigo-400">AI-Powered Email Management</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#f0f0f8] leading-tight mb-6">
            Email, but
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent"> smarter</span>
          </h1>

          <p className="text-lg text-[#9898b0] max-w-2xl mb-10 leading-relaxed">
            Connect your Gmail and let AI handle the heavy lifting — instant summaries,
            one-click reply drafts, and a clean dashboard that puts you back in control.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-16">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40"
            >
              Start for free
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-[#22222e] hover:bg-[#2a2a38] text-[#f0f0f8] px-8 py-3 rounded-xl font-semibold transition-all border border-[#2a2a38]"
            >
              Sign in
            </Link>
          </div>

          {/* Bullets */}
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {BULLETS.map((b) => (
              <li key={b} className="flex items-center gap-1.5 text-sm text-[#9898b0]">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
        </section>

        {/* Features */}
        <section className="py-20 px-6 border-t border-[#2a2a38]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-[#f0f0f8] mb-12">
              Everything you need, nothing you don&apos;t
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="bg-[#1a1a24] border border-[#2a2a38] rounded-2xl p-6 hover:border-indigo-500/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-indigo-400" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-[#f0f0f8] mb-2">{title}</h3>
                  <p className="text-sm text-[#9898b0] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#2a2a38] py-6 px-6 text-xs text-[#60607a] flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <div>
            &copy; {new Date().getFullYear()} Intelligent Email Assistant. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#f0f0f8] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#f0f0f8] transition-colors">
              Terms of Service
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}
