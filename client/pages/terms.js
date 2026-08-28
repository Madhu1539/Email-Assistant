import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service — Intelligent Email Assistant</title>
        <meta name="description" content="Terms of Service for Intelligent Email Assistant" />
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
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold">Terms of Service</h1>
          </div>

          <p className="text-xs text-[#9898b0] mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-[#c0c0d8] text-sm leading-relaxed">
            <section className="bg-[#1a1a24] border border-[#2a2a38] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-[#f0f0f8] mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Intelligent Email Assistant, you agree to comply with and be bound by these Terms of Service.
              </p>
            </section>

            <section className="bg-[#1a1a24] border border-[#2a2a38] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-[#f0f0f8] mb-3">2. Description of Service</h2>
              <p>
                Intelligent Email Assistant provides productivity tools for Gmail, including email reading, organization, AI summaries, and draft generation.
              </p>
            </section>

            <section className="bg-[#1a1a24] border border-[#2a2a38] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-[#f0f0f8] mb-3">3. User Responsibilities</h2>
              <p>
                You are responsible for safeguarding your account credentials and ensuring the legitimacy of messages sent using this assistant.
              </p>
            </section>

            <section className="bg-[#1a1a24] border border-[#2a2a38] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-[#f0f0f8] mb-3">4. Limitation of Liability</h2>
              <p>
                The service is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis. We are not liable for any indirect or consequential damages arising from the use of the service.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
