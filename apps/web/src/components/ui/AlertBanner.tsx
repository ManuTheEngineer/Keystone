import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

type AlertVariant = "success" | "warning" | "info" | "danger";

interface AlertBannerProps {
  variant: AlertVariant;
  children: React.ReactNode;
}

const config: Record<AlertVariant, { bg: string; text: string; border: string; Icon: typeof Info }> = {
  success: { bg: "bg-success-bg", text: "text-success", border: "border-l-success", Icon: CheckCircle },
  warning: { bg: "bg-warning-bg", text: "text-warning", border: "border-l-warning", Icon: AlertTriangle },
  info: { bg: "bg-info-bg", text: "text-info", border: "border-l-info", Icon: Info },
  danger: { bg: "bg-danger-bg", text: "text-danger", border: "border-l-danger", Icon: XCircle },
};

export function AlertBanner({ variant, children }: AlertBannerProps) {
  const { bg, text, border, Icon } = config[variant];

  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border-l-[3px] text-[11px] leading-relaxed ${bg} ${text} ${border}`}
    >
      <Icon size={14} className="shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}
