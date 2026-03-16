import Link from "next/link";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-12 animate-fade-in">
      <div
        className="relative w-[80px] h-[80px] rounded-full bg-warm flex items-center justify-center shadow-[inset_0_2px_4px_rgba(44,24,16,0.06)]"
      >
        {/* Decorative line pattern behind icon */}
        <div
          className="absolute inset-0 rounded-full opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 4px, var(--color-earth) 4px, var(--color-earth) 5px)",
          }}
        />
        <span className="relative text-clay [&>svg]:w-12 [&>svg]:h-12">{icon}</span>
      </div>
      <h3 className="text-[20px] text-earth mt-4">{title}</h3>
      <p className="text-[13px] text-muted mt-2 max-w-sm text-center">{description}</p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="btn-primary mt-4"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="btn-primary mt-4"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
