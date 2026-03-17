"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { KeystoneIcon } from "@/components/icons/KeystoneIcon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Target,
  Hammer,
  Key,
  Globe,
  MessageSquare,
  Calculator,
  FileText,
  Camera,
  GraduationCap,
  Check,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Don't auto-redirect — let logged-in users view landing page
  // They can navigate to dashboard via nav button

  useEffect(() => {
    function handleScroll() {
      setNavScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <KeystoneIcon size={48} className="text-earth animate-pulse" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Section 1: Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          navScrolled
            ? "bg-surface/95 backdrop-blur-sm shadow-[0_1px_8px_rgba(44,24,16,0.06)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <KeystoneIcon size={28} className="text-earth" />
            <span
              className="text-[18px] text-earth tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              KEYSTONE
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-6">
            <a
              href="#how-it-works"
              className="text-[14px] text-muted hover:text-earth transition-colors"
            >
              Learn
            </a>
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center px-5 py-2 text-[14px] font-medium rounded-full btn-earth btn-hover"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[14px] text-muted hover:text-earth transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-5 py-2 text-[14px] font-medium rounded-full btn-earth btn-hover"
                >
                  Start free
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile hamburger */}
          <div className="sm:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 text-earth"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile slide-out panel */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-surface border-t border-border shadow-lg animate-fade-in">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#how-it-works"
                className="block text-[14px] text-muted hover:text-earth py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Learn
              </a>
              <Link
                href="/login"
                className="block text-[14px] text-muted hover:text-earth py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="block w-full text-center px-5 py-3 text-[14px] font-medium rounded-full btn-earth"
                onClick={() => setMobileMenuOpen(false)}
              >
                Start free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Section 2: Hero */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ paddingTop: "64px" }}
      >
        {/* Topographic background pattern */}
        <div className="absolute inset-0 bg-topo opacity-100 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Left content - 60% (shown first on mobile) */}
            <div className="lg:col-span-3 animate-fade-in order-1">
              <h1
                className="text-[40px] sm:text-[48px] leading-[1.1] text-earth mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Build your home
                <br />
                with confidence
              </h1>
              <p className="text-[16px] sm:text-[18px] text-muted leading-relaxed mb-8 max-w-xl">
                The first platform that guides you from initial idea to final key,
                whether you are building in Houston or Lome.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center px-8 py-4 text-[15px] font-medium rounded-full btn-earth btn-hover"
                >
                  Start your project
                  <ArrowRight size={16} className="ml-2" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center px-8 py-4 text-[15px] font-medium rounded-full border border-earth text-earth hover:bg-earth hover:text-warm transition-colors btn-hover"
                >
                  See how it works
                </a>
              </div>
            </div>

            {/* Right illustration - 40% (shown second on mobile) */}
            <div className="lg:col-span-2 flex justify-center order-2">
              <svg
                viewBox="0 0 400 360"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full max-w-[400px]"
                aria-hidden="true"
              >
                {/* Foundation base */}
                <line x1="60" y1="300" x2="340" y2="300" stroke="var(--color-sand)" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="80" y1="310" x2="320" y2="310" stroke="var(--color-sand)" strokeWidth="1.5" strokeLinecap="round" />

                {/* Vertical framing studs */}
                <line x1="100" y1="300" x2="100" y2="160" stroke="var(--color-clay)" strokeWidth="2" strokeLinecap="round" />
                <line x1="160" y1="300" x2="160" y2="130" stroke="var(--color-clay)" strokeWidth="2" strokeLinecap="round" />
                <line x1="200" y1="300" x2="200" y2="115" stroke="var(--color-clay)" strokeWidth="2" strokeLinecap="round" />
                <line x1="240" y1="300" x2="240" y2="130" stroke="var(--color-clay)" strokeWidth="2" strokeLinecap="round" />
                <line x1="300" y1="300" x2="300" y2="160" stroke="var(--color-clay)" strokeWidth="2" strokeLinecap="round" />

                {/* Horizontal beam */}
                <line x1="90" y1="200" x2="310" y2="200" stroke="var(--color-sand)" strokeWidth="1.5" strokeLinecap="round" />

                {/* Roof peak outline */}
                <line x1="60" y1="160" x2="200" y2="70" stroke="var(--color-earth)" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="200" y1="70" x2="340" y2="160" stroke="var(--color-earth)" strokeWidth="2.5" strokeLinecap="round" />

                {/* Roof ridge beam */}
                <line x1="60" y1="160" x2="340" y2="160" stroke="var(--color-earth)" strokeWidth="1.5" strokeLinecap="round" />

                {/* Keystone at apex */}
                <path
                  d="M192 66 L208 66 L206 82 L194 82 Z"
                  fill="none"
                  stroke="var(--color-clay)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                {/* Door opening */}
                <rect x="180" y="240" width="40" height="60" rx="1" fill="none" stroke="var(--color-sand)" strokeWidth="1.5" />
                <path d="M180 240 Q200 228 220 240" fill="none" stroke="var(--color-sand)" strokeWidth="1.5" />

                {/* Window left */}
                <rect x="110" y="220" width="30" height="30" rx="1" fill="none" stroke="var(--color-sand)" strokeWidth="1.5" />
                <line x1="125" y1="220" x2="125" y2="250" stroke="var(--color-sand)" strokeWidth="1" />
                <line x1="110" y1="235" x2="140" y2="235" stroke="var(--color-sand)" strokeWidth="1" />

                {/* Window right */}
                <rect x="260" y="220" width="30" height="30" rx="1" fill="none" stroke="var(--color-sand)" strokeWidth="1.5" />
                <line x1="275" y1="220" x2="275" y2="250" stroke="var(--color-sand)" strokeWidth="1" />
                <line x1="260" y1="235" x2="290" y2="235" stroke="var(--color-sand)" strokeWidth="1" />

                {/* Construction detail lines */}
                <line x1="130" y1="160" x2="160" y2="115" stroke="var(--color-sand)" strokeWidth="1" strokeLinecap="round" strokeDasharray="4 4" />
                <line x1="270" y1="160" x2="240" y2="115" stroke="var(--color-sand)" strokeWidth="1" strokeLinecap="round" strokeDasharray="4 4" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-[28px] sm:text-[32px] text-earth text-center mb-16"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Three steps to your new home
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-surface rounded-xl p-8 shadow-[var(--shadow-sm)] card-hover">
              <span
                className="block text-[48px] text-clay/30 font-bold mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                01
              </span>
              <div className="w-12 h-12 rounded-full bg-warm flex items-center justify-center mb-4">
                <Target size={22} className="text-clay" />
              </div>
              <h3
                className="text-[20px] text-earth mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Define your vision
              </h3>
              <p className="text-[14px] text-muted leading-relaxed">
                Set your goals, choose your market, and establish a realistic budget.
                Our guided setup walks you through every decision with clear explanations.
              </p>
            </div>

            <div className="bg-surface rounded-xl p-8 shadow-[var(--shadow-sm)] card-hover">
              <span
                className="block text-[48px] text-clay/30 font-bold mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                02
              </span>
              <div className="w-12 h-12 rounded-full bg-warm flex items-center justify-center mb-4">
                <Hammer size={22} className="text-clay" />
              </div>
              <h3
                className="text-[20px] text-earth mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Build with guidance
              </h3>
              <p className="text-[14px] text-muted leading-relaxed">
                Manage contractors, track budgets, schedule milestones, and get AI-powered
                advice at every phase of construction.
              </p>
            </div>

            <div className="bg-surface rounded-xl p-8 shadow-[var(--shadow-sm)] card-hover">
              <span
                className="block text-[48px] text-clay/30 font-bold mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                03
              </span>
              <div className="w-12 h-12 rounded-full bg-warm flex items-center justify-center mb-4">
                <Key size={22} className="text-clay" />
              </div>
              <h3
                className="text-[20px] text-earth mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Move in with confidence
              </h3>
              <p className="text-[14px] text-muted leading-relaxed">
                Verify work quality with photo evidence, complete inspections,
                and transition smoothly to occupancy, rental, or sale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Features Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-[28px] sm:text-[32px] text-earth text-center mb-16"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Everything you need to build
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Globe,
                title: "Dual-market intelligence",
                description:
                  "Cost benchmarks, regulations, and construction methods for both the United States and West Africa.",
              },
              {
                icon: MessageSquare,
                title: "AI construction advisor",
                description:
                  "Ask questions about your project, get budget analysis, schedule recommendations, and risk assessments.",
              },
              {
                icon: Calculator,
                title: "Financial modeling",
                description:
                  "Loan qualification, rental yield projections, draw schedules, and currency conversion for diaspora builders.",
              },
              {
                icon: FileText,
                title: "Document generation",
                description:
                  "Generate contracts, bid requests, checklists, and payment receipts ready to print or share.",
              },
              {
                icon: Camera,
                title: "Photo verification",
                description:
                  "Timestamped, geotagged photos organized by phase and milestone for transparent progress tracking.",
              },
              {
                icon: GraduationCap,
                title: "Phase-by-phase education",
                description:
                  "Learn construction at every step with market-specific guides, glossary terms, and expert tips.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-surface border border-border rounded-xl p-6 card-hover"
              >
                <div className="w-12 h-12 rounded-full bg-warm flex items-center justify-center mb-4">
                  <feature.icon size={22} className="text-clay" />
                </div>
                <h3
                  className="text-[17px] text-earth mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {feature.title}
                </h3>
                <p className="text-[14px] text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Diaspora Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-warm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-[28px] sm:text-[32px] text-earth mb-6 leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Building from abroad?
                <br />
                We built this for you.
              </h2>
              <p className="text-[16px] text-muted leading-relaxed mb-6">
                Keystone was designed for diaspora builders who need to manage construction
                projects remotely. Monitor progress through verified photos, track milestone
                payments, navigate land title processes, and stay connected to your build
                from anywhere in the world.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Timestamped, geotagged photo verification",
                  "Milestone-based payment tracking",
                  "Titre foncier and land tenure guidance",
                  "Contractor accountability tools",
                  "CFA/USD currency conversion and alerts",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-earth/10 flex items-center justify-center mt-0.5 shrink-0">
                      <Check size={12} className="text-earth" />
                    </div>
                    <span className="text-[14px] text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-4 text-[15px] font-medium rounded-full btn-earth btn-hover"
              >
                Start building remotely
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>

            {/* Mock monitor card */}
            <div className="bg-surface rounded-xl shadow-[var(--shadow-lg)] p-6 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-[12px] font-medium text-earth">Live project monitor</span>
              </div>
              <div className="space-y-4">
                <div className="bg-background rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] text-muted">Phase 6: Build</span>
                    <span className="text-[11px] font-data text-success">68% complete</span>
                  </div>
                  <div className="w-full h-2 bg-warm rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: "68%" }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background rounded-lg p-3">
                    <span className="block text-[10px] text-muted mb-1">Budget remaining</span>
                    <span className="text-[16px] font-data text-earth">4,200,000 FCFA</span>
                  </div>
                  <div className="bg-background rounded-lg p-3">
                    <span className="block text-[10px] text-muted mb-1">Photos this week</span>
                    <span className="text-[16px] font-data text-earth">12</span>
                  </div>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <span className="block text-[10px] text-muted mb-1">Latest milestone</span>
                  <span className="text-[13px] text-earth">Roofing complete. Awaiting inspection.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Pricing */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-[28px] sm:text-[32px] text-earth text-center mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Simple, transparent pricing
          </h2>
          <p className="text-[16px] text-muted text-center mb-16 max-w-xl mx-auto">
            Start free and upgrade as your projects grow.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Foundation */}
            <div className="bg-surface rounded-xl p-6 border border-border card-hover">
              <h3
                className="text-[18px] text-earth mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Foundation
              </h3>
              <p className="text-[13px] text-muted mb-4">For first-time explorers</p>
              <div className="mb-6">
                <span
                  className="text-[36px] text-earth"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  $0
                </span>
                <span className="text-[14px] text-muted">/mo</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {[
                  "1 project",
                  "10 AI queries per day",
                  "Basic budget tracking",
                  "Photo uploads",
                  "Learning modules",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check size={14} className="text-success shrink-0" />
                    <span className="text-[13px] text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center py-3 text-[14px] font-medium rounded-full border border-earth text-earth hover:bg-earth hover:text-warm transition-colors"
              >
                Get started
              </Link>
            </div>

            {/* Builder */}
            <div className="bg-surface rounded-2xl p-6 border border-border card-hover">
              <h3
                className="text-[18px] text-earth mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Builder
              </h3>
              <p className="text-[13px] text-muted mb-4">For active owner-builders</p>
              <div className="mb-1">
                <span
                  className="text-[36px] text-earth"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  $19
                </span>
                <span className="text-[14px] text-muted">/mo</span>
              </div>
              <p className="text-[11px] text-muted mb-5">or $182/yr (save 20%)</p>
              <ul className="space-y-2.5 mb-6">
                {[
                  "3 active projects",
                  "50 AI queries per day",
                  "Document generation",
                  "PDF/CSV export",
                  "All market data",
                  "500 photo uploads",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check size={14} className="text-success shrink-0" />
                    <span className="text-[13px] text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center py-3 text-[14px] font-medium rounded-full border border-earth text-earth hover:bg-earth hover:text-warm transition-colors"
              >
                Start building
              </Link>
            </div>

            {/* Developer - highlighted */}
            <div className="bg-surface rounded-2xl p-6 border-2 border-emerald-500 relative card-hover">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-500 text-white text-[11px] font-medium rounded-full">
                Most popular
              </div>
              <h3
                className="text-[18px] text-earth mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Developer
              </h3>
              <p className="text-[13px] text-muted mb-4">For investors and multi-project builders</p>
              <div className="mb-1">
                <span
                  className="text-[36px] text-earth"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  $49
                </span>
                <span className="text-[14px] text-muted">/mo</span>
              </div>
              <p className="text-[11px] text-muted mb-5">or $470/yr (save 20%)</p>
              <ul className="space-y-2.5 mb-6">
                {[
                  "Unlimited projects",
                  "Unlimited AI queries",
                  "Advanced financial modeling",
                  "All document templates",
                  "Unlimited photos",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check size={14} className="text-success shrink-0" />
                    <span className="text-[13px] text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center py-3 text-[14px] font-medium rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Start building
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-surface rounded-2xl p-6 border border-border card-hover">
              <h3
                className="text-[18px] text-earth mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Enterprise
              </h3>
              <p className="text-[13px] text-muted mb-4">For teams and organizations</p>
              <div className="mb-1">
                <span
                  className="text-[36px] text-earth"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  $149
                </span>
                <span className="text-[14px] text-muted">/mo</span>
              </div>
              <p className="text-[11px] text-muted mb-5">or $1,430/yr (save 20%)</p>
              <ul className="space-y-2.5 mb-6">
                {[
                  "Everything in Developer",
                  "Team collaboration",
                  "SSO authentication",
                  "Audit logging",
                  "SLA guarantees",
                  "Dedicated support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check size={14} className="text-success shrink-0" />
                    <span className="text-[13px] text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="mailto:support@keystone.build"
                className="block w-full text-center py-3 text-[14px] font-medium rounded-full border border-earth text-earth hover:bg-earth hover:text-warm transition-colors"
              >
                Contact us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Footer -- stays dark in both modes */}
      <footer className="landing-footer py-12 sm:py-16 px-4 sm:px-6 bg-earth">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <KeystoneIcon size={24} className="text-sand" />
                <span
                  className="text-[16px] text-warm tracking-tight font-heading"
                >
                  KEYSTONE
                </span>
              </div>
              <p className="text-[13px] text-sand/60 leading-relaxed">
                From first idea to final key. The construction management platform
                for owner-builders worldwide.
              </p>
            </div>

            {/* Product links */}
            <div>
              <h4 className="text-[12px] uppercase tracking-[2px] text-sand/40 font-medium mb-4">
                Product
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="#how-it-works" className="text-[13px] text-sand/70 hover:text-warm transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-[13px] text-sand/70 hover:text-warm transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link href="/learn" className="text-[13px] text-sand/70 hover:text-warm transition-colors">
                    Learning center
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support links */}
            <div>
              <h4 className="text-[12px] uppercase tracking-[2px] text-sand/40 font-medium mb-4">
                Support
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/learn" className="text-[13px] text-sand/70 hover:text-warm transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@keystone.build" className="text-[13px] text-sand/70 hover:text-warm transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h4 className="text-[12px] uppercase tracking-[2px] text-sand/40 font-medium mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/privacy" className="text-[13px] text-sand/70 hover:text-warm transition-colors">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-[13px] text-sand/70 hover:text-warm transition-colors">
                    Terms of service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-sand/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <KeystoneIcon size={16} className="text-sand/40" />
              <span className="text-[12px] text-sand/40">
                2026 Keystone. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
