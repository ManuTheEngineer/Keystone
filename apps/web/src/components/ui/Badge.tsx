type BadgeVariant = "success" | "warning" | "info" | "danger" | "emerald";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function Badge({ children, variant = "info", className }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center text-[10px] px-2.5 py-0.5 rounded-full font-medium border
        ${variants[variant]}
        ${className ?? ""}
      `}
    >
      {children}
    </span>
  );
}
