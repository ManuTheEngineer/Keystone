"use client";

import { useState, useCallback } from "react";
import {
  LayoutGrid,
  BarChart3,
  DollarSign,
  FileText,
  MessageSquare,
  Settings,
  Key,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Tour step definition                                               */
/* ------------------------------------------------------------------ */

interface TourStep {
  title: string;
  content: string;
  illustration: React.ReactNode;
}

interface OnboardingTourProps {
  onComplete: () => void;
}

/* ------------------------------------------------------------------ */
/*  Keystone icon for the welcome step                                 */
/* ------------------------------------------------------------------ */

function KeystoneIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 4L6 22H42L24 4Z"
        stroke="var(--color-clay)"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M20 16L24 8L28 16L27 19H21L20 16Z"
        stroke="var(--color-earth)"
        strokeWidth="1.5"
        fill="var(--color-sand)"
        strokeLinejoin="round"
      />
      <rect
        x="10"
        y="22"
        width="28"
        height="20"
        stroke="var(--color-clay)"
        strokeWidth="2"
        fill="none"
        rx="1"
      />
      <rect
        x="20"
        y="30"
        width="8"
        height="12"
        stroke="var(--color-sand)"
        strokeWidth="1.5"
        fill="none"
        rx="1"
      />
      <circle cx="26" cy="36" r="1" fill="var(--color-clay)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Tour steps data                                                    */
/* ------------------------------------------------------------------ */

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Keystone",
    content:
      "Your construction project management platform. We have set up a demo project so you can explore how everything works.",
    illustration: <KeystoneIcon />,
  },
  {
    title: "Your Dashboard",
    content:
      "This is your home base. See all your projects at a glance with budget tracking, progress, and recent activity.",
    illustration: <LayoutGrid size={48} className="text-clay" />,
  },
  {
    title: "Project Overview",
    content:
      "Each project has a phase-adaptive dashboard that changes as your construction progresses. During the Build phase, you will see spend tracking, milestone timelines, and risk alerts.",
    illustration: <BarChart3 size={48} className="text-clay" />,
  },
  {
    title: "Budget Tracking",
    content:
      "Track every dollar with market-aware cost benchmarks. Visual charts show where your money is going and flag potential overruns before they become problems.",
    illustration: <DollarSign size={48} className="text-clay" />,
  },
  {
    title: "Document Generation",
    content:
      "Generate construction contracts, bid requests, checklists, and payment receipts from templates tailored to your market. Print or save as PDF.",
    illustration: <FileText size={48} className="text-clay" />,
  },
  {
    title: "AI Construction Advisor",
    content:
      "Ask questions about your project, get budget analysis, schedule recommendations, and risk assessments. Your AI advisor knows your market, phase, and budget.",
    illustration: <MessageSquare size={48} className="text-clay" />,
  },
  {
    title: "Set your preferences",
    content:
      "Head to Settings to choose your language (English, French, or Spanish), timezone, and currency. These customize your entire Keystone experience.",
    illustration: <Settings size={48} className="text-clay" />,
  },
  {
    title: "You are ready to build",
    content:
      "Explore the demo project to see how everything works, then create your own project when you are ready. Welcome to Keystone.",
    illustration: <Key size={48} className="text-clay" />,
  },
];

/* ------------------------------------------------------------------ */
/*  OnboardingTour component                                           */
/* ------------------------------------------------------------------ */

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, onComplete]);

  const handlePrev = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleSkip}
      />

      {/* Tour card */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-surface rounded-2xl shadow-xl overflow-hidden">
        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5 pt-6 pb-2">
          {TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? "bg-earth w-4"
                  : idx < currentStep
                  ? "bg-sand"
                  : "bg-border"
              }`}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Illustration area */}
        <div className="mx-8 mt-4 mb-6 h-[160px] rounded-xl bg-warm flex items-center justify-center">
          {step.illustration}
        </div>

        {/* Content area */}
        <div className="px-8 pb-2">
          <p className="text-[10px] text-muted mb-2">
            Step {currentStep + 1} of {TOUR_STEPS.length}
          </p>
          <h2
            className="text-[22px] text-earth mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {step.title}
          </h2>
          <p className="text-[13px] text-muted leading-relaxed">
            {step.content}
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-8 pt-6 pb-8">
          <div>
            {!isFirstStep ? (
              <button
                onClick={handlePrev}
                className="text-[13px] text-muted hover:text-earth transition-colors"
              >
                Back
              </button>
            ) : (
              <button
                onClick={handleSkip}
                className="text-[13px] text-muted hover:text-earth transition-colors"
              >
                Skip tour
              </button>
            )}
          </div>
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-earth text-warm text-[14px] font-medium hover:bg-earth-light transition-colors"
          >
            {isLastStep ? "Get started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
