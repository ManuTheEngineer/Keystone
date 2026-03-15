type BadgeVariant = "success" | "warning" | "info" | "danger" | "emerald";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  info: "bg-info-bg text-info",
  danger: "bg-danger-bg text-danger",
  emerald: "bg-emerald-50 text-emerald-700",
};

export function Badge({ children, variant = "info", className }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center text-[9px] px-2.5 py-1 rounded-full font-medium
        ${variants[variant]}
        ${className ?? ""}
      `}
    >
      {children}
    </span>
  );
}
