import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — Intelligent Email Assistant</title>
        <meta name="description" content="Privacy Policy for Intelligent Email Assistant" />
      </Head>

      <div className="min-h-screen bg-[#0f0f14] text-[#f0f0f8] py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#9898b0] hover:text-[#f0f0f8] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>

          <p className="text-xs text-[#9898b0] mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-[#c0c0d8] text-sm leading-relaxed">
            <section className="bg-[#1a1a24] border border-[#2a2a38] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-[#f0f0f8] mb-3">1. Information We Collect</h2>
              <p>
                When you connect your Google Account, Intelligent Email Assistant accesses your Gmail messages and account email address via official Google OAuth 2.0 APIs with your explicit authorization. We do not store or see your Google account password.
              </p>
            </section>

            <section className="bg-[#1a1a24] border border-[#2a2a38] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-[#f0f0f8] mb-3">2. How We Use Information</h2>
              <p>
                We use your Gmail data solely to display your emails in your assistant dashboard, generate AI summaries, compose drafts upon your request, and perform email actions (such as mark as read, archive, or star) initiated by you.
              </p>
            </section>

            <section className="bg-[#1a1a24] border border-[#2a2a38] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-[#f0f0f8] mb-3">3. Data Security & Storage</h2>
              <p>
                All OAuth tokens are encrypted at rest using AES-256 encryption. We never sell, rent, or share your email data with any third parties or advertisers.
              </p>
            </section>

            <section className="bg-[#1a1a24] border border-[#2a2a38] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-[#f0f0f8] mb-3">4. Revoking Access</h2>
              <p>
                You can disconnect your Gmail account at any time directly from the Integrations page in the application, or via Google Account Security Settings.
              </p>
            </section>

            <section className="bg-[#1a1a24] border border-[#2a2a38] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-[#f0f0f8] mb-3">5. Contact Us</h2>
              <p>
                For questions regarding this policy, contact us at: <span className="text-indigo-400">madhuclgwork@gmail.com</span>
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
