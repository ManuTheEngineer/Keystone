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
      <div className="w-[80px] h-[80px] rounded-full bg-warm flex items-center justify-center">
        <span className="text-clay [&>svg]:w-12 [&>svg]:h-12">{icon}</span>
      </div>
      <h3 className="text-[20px] text-earth mt-4">{title}</h3>
      <p className="text-[13px] text-muted mt-2 max-w-sm text-center">{description}</p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="mt-4 bg-earth text-warm rounded-xl py-3 px-6 text-[13px] font-medium hover:bg-earth-light transition-colors"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="mt-4 bg-earth text-warm rounded-xl py-3 px-6 text-[13px] font-medium hover:bg-earth-light transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
