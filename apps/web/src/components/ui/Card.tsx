interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddings = {
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function Card({ children, className, padding = "md" }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border/60 rounded-xl shadow-[0_1px_3px_rgba(44,24,16,0.04)] ${paddings[padding]} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
