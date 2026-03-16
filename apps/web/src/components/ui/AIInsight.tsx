import {
  Lightbulb,
  AlertTriangle,
  Shield,
  TrendingUp,
  Flag,
  Sparkles,
} from "lucide-react";

interface AIInsightProps {
  type: "tip" | "warning" | "risk" | "recommendation" | "milestone";
  title: string;
  content: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const TYPE_CONFIG = {
  tip: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-50/50",
    iconColor: "text-emerald-600",
    Icon: Lightbulb,
  },
  warning: {
    border: "border-l-amber-500",
    bg: "bg-amber-50/50",
    iconColor: "text-amber-600",
    Icon: AlertTriangle,
  },
  risk: {
    border: "border-l-red-500",
    bg: "bg-red-50/50",
    iconColor: "text-red-600",
    Icon: Shield,
  },
  recommendation: {
    border: "border-l-blue-500",
    bg: "bg-blue-50/50",
    iconColor: "text-blue-600",
    Icon: TrendingUp,
  },
  milestone: {
    border: "border-l-clay",
    bg: "bg-warm/40",
    iconColor: "text-clay",
    Icon: Flag,
  },
};

export function AIInsight({ type, title, content, action }: AIInsightProps) {
  const config = TYPE_CONFIG[type];
  const { Icon } = config;

  const actionEl = action?.href ? (
    <a
      href={action.href}
      className="inline-block mt-2 text-[12px] text-clay hover:underline font-medium"
    >
      {action.label}
    </a>
  ) : action?.onClick ? (
    <button
      onClick={action.onClick}
      className="mt-2 text-[12px] text-clay hover:underline font-medium cursor-pointer"
    >
      {action.label}
    </button>
  ) : null;

  return (
    <div
      className={`rounded-xl p-4 border-l-[3px] ${config.border} ${config.bg}`}
    >
      <div className="flex items-start gap-2.5">
        <Icon size={14} className={`${config.iconColor} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={9} className="text-muted shrink-0" />
            <span className="text-[9px] uppercase tracking-wider text-muted font-medium">
              Keystone AI
            </span>
          </div>
          <p className="text-[13px] font-semibold text-earth leading-snug">
            {title}
          </p>
          <p className="text-[12px] text-muted leading-relaxed mt-0.5">
            {content}
          </p>
          {actionEl}
        </div>
      </div>
    </div>
  );
}
