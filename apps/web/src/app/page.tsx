"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { KeystoneIcon } from "@/components/icons/KeystoneIcon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ProductDemo } from "@/components/ui/ProductDemo";
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
  ChevronDown,
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
              How it works
            </a>
            <a
              href="#about"
              className="text-[14px] text-muted hover:text-earth transition-colors"
            >
              About
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
                How it works
              </a>
              <a
                href="#about"
                className="block text-[14px] text-muted hover:text-earth py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              {user ? (
                <Link
                  href="/dashboard"
                  className="block w-full text-center px-5 py-3 text-[14px] font-medium rounded-full btn-earth btn-hover"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
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
                </>
              )}
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
                whether you are building in the United States or West Africa.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center px-8 py-4 text-[15px] font-medium rounded-full btn-earth btn-hover"
                >
                  Start your project
                  <ArrowRight size={16} className="ml-2" />
                </Link>
                <Link
                  href="/register?redirect=/analyze"
                  className="inline-flex items-center px-8 py-4 text-[15px] font-medium rounded-full border border-clay text-clay hover:bg-clay hover:text-white transition-colors btn-hover"
                >
                  Analyze a deal
                  <Calculator size={16} className="ml-2" />
                </Link>
              </div>

              {/* Status line */}
              <p className="mt-6 text-[13px] text-muted/60">
                Free to start. No credit card required.
              </p>
            </div>

            {/* Right illustration - animated house build */}
            <div className="lg:col-span-2 flex justify-center order-2">
              <svg
                viewBox="0 0 400 360"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full max-w-[400px]"
                aria-hidden="true"
              >
                <style>{`
                  .draw { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: draw-line 1.5s ease-out forwards; }
                  .draw-d1 { animation-delay: 0.2s; } .draw-d2 { animation-delay: 0.5s; }
                  .draw-d3 { animation-delay: 0.8s; } .draw-d4 { animation-delay: 1.1s; }
                  .draw-d5 { animation-delay: 1.5s; } .draw-d6 { animation-delay: 1.8s; }
                  .draw-d7 { animation-delay: 2.1s; } .draw-d8 { animation-delay: 2.5s; }
                  .draw-d9 { animation-delay: 2.8s; } .draw-d10 { animation-delay: 3.2s; }
                  @keyframes draw-line { to { stroke-dashoffset: 0; } }
                  .fade-up { opacity: 0; transform: translateY(8px); animation: fade-up 0.6s ease-out forwards; }
                  .fade-d5 { animation-delay: 1.5s; } .fade-d6 { animation-delay: 1.8s; }
                  .fade-d7 { animation-delay: 2.2s; } .fade-d8 { animation-delay: 2.6s; }
                  .fade-d9 { animation-delay: 3.0s; } .fade-d10 { animation-delay: 3.5s; }
                  @keyframes fade-up { to { opacity: 1; transform: translateY(0); } }
                  .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; animation-delay: 3.5s; opacity: 0; }
                  @keyframes pulse-glow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
                `}</style>

                {/* Foundation base - draws first */}
                <line x1="60" y1="300" x2="340" y2="300" stroke="var(--color-sand)" strokeWidth="2.5" strokeLinecap="round" className="draw" />
                <line x1="80" y1="310" x2="320" y2="310" stroke="var(--color-sand)" strokeWidth="1.5" strokeLinecap="round" className="draw draw-d1" />

                {/* Vertical framing studs - grow upward */}
                <line x1="100" y1="300" x2="100" y2="160" stroke="var(--color-clay)" strokeWidth="2" strokeLinecap="round" className="draw draw-d2" />
                <line x1="160" y1="300" x2="160" y2="130" stroke="var(--color-clay)" strokeWidth="2" strokeLinecap="round" className="draw draw-d2" />
                <line x1="200" y1="300" x2="200" y2="115" stroke="var(--color-clay)" strokeWidth="2" strokeLinecap="round" className="draw draw-d3" />
                <line x1="240" y1="300" x2="240" y2="130" stroke="var(--color-clay)" strokeWidth="2" strokeLinecap="round" className="draw draw-d3" />
                <line x1="300" y1="300" x2="300" y2="160" stroke="var(--color-clay)" strokeWidth="2" strokeLinecap="round" className="draw draw-d4" />

                {/* Horizontal beam */}
                <line x1="90" y1="200" x2="310" y2="200" stroke="var(--color-sand)" strokeWidth="1.5" strokeLinecap="round" className="draw draw-d5" />

                {/* Roof peak outline */}
                <line x1="60" y1="160" x2="200" y2="70" stroke="var(--color-earth)" strokeWidth="2.5" strokeLinecap="round" className="draw draw-d6" />
                <line x1="200" y1="70" x2="340" y2="160" stroke="var(--color-earth)" strokeWidth="2.5" strokeLinecap="round" className="draw draw-d6" />

                {/* Roof ridge beam */}
                <line x1="60" y1="160" x2="340" y2="160" stroke="var(--color-earth)" strokeWidth="1.5" strokeLinecap="round" className="draw draw-d5" />

                {/* Keystone at apex - fades in */}
                <path d="M192 66 L208 66 L206 82 L194 82 Z" fill="none" stroke="var(--color-clay)" strokeWidth="2" strokeLinejoin="round" className="draw draw-d7" />

                {/* Door opening - fades up */}
                <g className="fade-up fade-d7">
                  <rect x="180" y="240" width="40" height="60" rx="1" fill="none" stroke="var(--color-sand)" strokeWidth="1.5" />
                  <path d="M180 240 Q200 228 220 240" fill="none" stroke="var(--color-sand)" strokeWidth="1.5" />
                </g>

                {/* Window left */}
                <g className="fade-up fade-d8">
                  <rect x="110" y="220" width="30" height="30" rx="1" fill="none" stroke="var(--color-sand)" strokeWidth="1.5" />
                  <line x1="125" y1="220" x2="125" y2="250" stroke="var(--color-sand)" strokeWidth="1" />
                  <line x1="110" y1="235" x2="140" y2="235" stroke="var(--color-sand)" strokeWidth="1" />
                </g>

                {/* Window right */}
                <g className="fade-up fade-d9">
                  <rect x="260" y="220" width="30" height="30" rx="1" fill="none" stroke="var(--color-sand)" strokeWidth="1.5" />
                  <line x1="275" y1="220" x2="275" y2="250" stroke="var(--color-sand)" strokeWidth="1" />
                  <line x1="260" y1="235" x2="290" y2="235" stroke="var(--color-sand)" strokeWidth="1" />
                </g>

                {/* Construction detail lines - dashed */}
                <line x1="130" y1="160" x2="160" y2="115" stroke="var(--color-sand)" strokeWidth="1" strokeLinecap="round" strokeDasharray="4 4" className="fade-up fade-d5" />
                <line x1="270" y1="160" x2="240" y2="115" stroke="var(--color-sand)" strokeWidth="1" strokeLinecap="round" strokeDasharray="4 4" className="fade-up fade-d5" />

                {/* Warm glow inside door - appears last */}
                <rect x="185" y="248" width="30" height="48" rx="1" fill="var(--color-warm)" className="pulse-glow" />

                {/* Ground shadow - subtle depth */}
                <ellipse cx="200" cy="315" rx="120" ry="6" fill="var(--color-sand)" opacity="0.15" className="fade-up fade-d10" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section id="how-it-works" className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-[28px] sm:text-[32px] text-earth text-center mb-10"
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

      {/* Section 3.5: Interactive Product Demo */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-[28px] sm:text-[32px] text-earth text-center mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            See it in action
          </h2>
          <p className="text-[15px] text-muted text-center max-w-lg mx-auto mb-12">
            From analyzing a deal to handing over the keys, Keystone guides you through every step of the building process.
          </p>
          <ProductDemo />
        </div>
      </section>

      {/* Section 4: Features Grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-[28px] sm:text-[32px] text-earth text-center mb-10"
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
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-warm">
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
      <section id="pricing" className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-[28px] sm:text-[32px] text-earth text-center mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Simple, transparent pricing
          </h2>
          <p className="text-[16px] text-muted text-center mb-10 max-w-xl mx-auto">
            Start free and upgrade as your projects grow.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Starter */}
            <div className="bg-surface rounded-xl p-6 border border-border card-hover flex flex-col">
              <h3
                className="text-[18px] text-earth mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Starter
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
              <ul className="space-y-2.5 mb-6 flex-1">
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
            <div className="bg-surface rounded-2xl p-6 border border-border card-hover flex flex-col">
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
              <ul className="space-y-2.5 mb-6 flex-1">
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
            <div className="bg-surface rounded-2xl p-6 border-2 border-emerald-500 relative card-hover flex flex-col">
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
              <ul className="space-y-2.5 mb-6 flex-1">
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
            <div className="bg-surface rounded-2xl p-6 border border-border card-hover flex flex-col">
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
              <ul className="space-y-2.5 mb-6 flex-1">
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
                href="mailto:ManuTheEngineer@outlook.com?subject=Keystone Support"
                className="block w-full text-center py-3 text-[14px] font-medium rounded-full border border-earth text-earth hover:bg-earth hover:text-warm transition-colors"
              >
                Contact us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section: FAQ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-surface">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[28px] sm:text-[32px] text-earth text-center mb-12" style={{ fontFamily: "var(--font-heading)" }}>
            Common questions
          </h2>
          <div className="space-y-0">
            {[
              { q: "Do I need construction experience to use Keystone?", a: "No. Keystone is built specifically for first-time builders with zero construction knowledge. Every step includes plain-language explanations, and the AI assistant can answer questions about any construction topic." },
              { q: "How does the free plan work?", a: "The free Starter plan lets you manage one full project with basic budget tracking, daily logs, photos, and 10 AI queries per day. No credit card required. Upgrade when you need more projects or advanced features." },
              { q: "Can I use Keystone for projects in West Africa?", a: "Yes. Keystone has dedicated support for Togo, Ghana, and Benin with local cost benchmarks, CFA franc currency, reinforced concrete construction methods, phased cash funding, and French language support." },
              { q: "How does the deal analyzer work?", a: "Enter your target location, property type, and size. Keystone pulls real Census, HUD, and BLS data to estimate costs, calculates a deal score from 0-100, and shows you exactly what your project would cost before you commit." },
              { q: "Is my project data secure?", a: "Your data is stored on Google Cloud (Firebase) with encryption at rest and in transit. Only you can access your project data. We never share or sell your information." },
              { q: "Can I manage a project remotely?", a: "Yes. The photo verification system, daily logs, and remote monitor are designed for diaspora builders who manage construction from abroad. Timestamped, geotagged photos provide transparent progress tracking." },
            ].map((faq, i) => (
              <details key={i} className="group border-b border-border/50">
                <summary className="flex items-center justify-between py-4 cursor-pointer text-[15px] text-earth font-medium hover:text-clay transition-colors list-none">
                  {faq.q}
                  <ChevronDown size={16} className="text-muted shrink-0 ml-4 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="pb-4 text-[14px] text-muted leading-relaxed -mt-1">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: About */}
      <section id="about" className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[3px] text-clay mb-3">
              About
            </p>
            <h2
              className="text-[28px] sm:text-[36px] text-earth leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Built by a builder, for builders
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <img
              src="/founder.jpg"
              alt="Emmanuel Abok, Founder of Keystone"
              className="w-28 h-28 rounded-2xl object-cover shrink-0"
            />

            <div className="flex-1 text-center md:text-left">
              <h3
                className="text-[20px] text-earth mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Emmanuel Abok
              </h3>
              <p className="text-[13px] text-clay font-medium mb-4">Founder & Lead Developer</p>
              <div className="space-y-3 text-[14px] text-muted leading-relaxed">
                <p>
                  Keystone was born from a personal need. As a mechanical engineer with roots in Togo, I watched family and friends navigate the overwhelming complexity of building homes across two continents, managing contractors remotely, tracking budgets across currencies, and making high-stakes decisions with zero construction experience.
                </p>
                <p>
                  The existing tools were built for professional contractors, not for the first-time owner-builder. There was nothing that combined education, project management, financial modeling, and remote monitoring in one platform. And certainly nothing that understood both the U.S. construction market and the realities of building in Togo, Ghana, or Benin.
                </p>
                <p>
                  Keystone is that tool. Every feature is designed to guide someone with zero construction knowledge through every phase of building a home, whether they are on-site or watching from thousands of miles away. The AI advisor, the dual-market intelligence, the phase-based learning system: these exist because I built what I wished existed when my own family started building.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Footer -- stays dark in both modes */}
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
                  <a href="#about" className="text-[13px] text-sand/70 hover:text-warm transition-colors">
                    About
                  </a>
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
                  <a href="#pricing" className="text-[13px] text-sand/70 hover:text-warm transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="mailto:ManuTheEngineer@outlook.com?subject=Keystone Support" className="text-[13px] text-sand/70 hover:text-warm transition-colors">
                    ManuTheEngineer@outlook.com
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
