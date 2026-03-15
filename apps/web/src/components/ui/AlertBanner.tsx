import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

type AlertVariant = "success" | "warning" | "info" | "danger";

interface AlertBannerProps {
  variant: AlertVariant;
  children: React.ReactNode;
}

const config: Record<AlertVariant, { bg: string; text: string; Icon: typeof Info }> = {
  success: { bg: "bg-success-bg", text: "text-success", Icon: CheckCircle },
  warning: { bg: "bg-warning-bg", text: "text-warning", Icon: AlertTriangle },
  info: { bg: "bg-info-bg", text: "text-info", Icon: Info },
  danger: { bg: "bg-danger-bg", text: "text-danger", Icon: XCircle },
};

export function AlertBanner({ variant, children }: AlertBannerProps) {
  const { bg, text, Icon } = config[variant];

  return (
    <div
      className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-[11px] leading-relaxed ${bg} ${text}`}
    >
      <Icon size={14} className="shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}
