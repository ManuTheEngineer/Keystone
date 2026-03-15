interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddings = {
  sm: "p-2.5",
  md: "p-4",
  lg: "p-5",
};

export function Card({ children, className, padding = "md" }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-[var(--radius)] ${paddings[padding]} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
