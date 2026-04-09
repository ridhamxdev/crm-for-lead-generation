'use client';

import Link from 'next/link';
import { TrendingUp, Users, BarChart3, MessageCircle, ArrowRight, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: Users,
    title: 'Lead Management',
    desc: 'Capture, organise, and track every lead from first contact to final close.',
  },
  {
    icon: BarChart3,
    title: 'Sales Dashboard',
    desc: 'Real-time pipeline analytics, conversion rates, and order value at a glance.',
  },
  {
    icon: MessageCircle,
    title: 'AI WhatsApp Messages',
    desc: 'Generate personalised follow-up messages powered by Google Gemini.',
  },
  {
    icon: Zap,
    title: 'Instant Status Updates',
    desc: 'Move leads through the pipeline with a single click — no page reloads.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Lead Generation CRM</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-slate-300 hover:text-white text-sm font-medium transition px-4 py-2 rounded-xl hover:bg-white/10"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition shadow-md shadow-indigo-900"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-24 max-w-3xl mx-auto">
        <span className="inline-block bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
          Lead Management · Made Simple
        </span>
        <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
          Close More Deals,{' '}
          <span className="text-indigo-400">Faster</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-10">
          Lead Generation CRM helps you manage leads from Meta Ads, Google Ads, walk-ins and
          referrals — all in one clean, fast workspace built for your team.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition shadow-xl shadow-indigo-900"
          >
            Create Free Account <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-2xl text-sm transition border border-white/10"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition"
            >
              <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-indigo-400" />
              </div>
              <h3 className="font-bold text-sm mb-2">{title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-6 pb-24">
        <div className="inline-block bg-white/5 border border-white/10 rounded-3xl px-12 py-10">
          <h2 className="text-2xl font-black mb-3">Ready to get started?</h2>
          <p className="text-slate-400 text-sm mb-6">
            Create your account in seconds — no credit card required.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl text-sm transition"
          >
            Create Account <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <footer className="text-center text-slate-600 text-xs pb-8">
        &copy; {new Date().getFullYear()} Lead Generation CRM. All rights reserved.
      </footer>
    </div>
  );
}
