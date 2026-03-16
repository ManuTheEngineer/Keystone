interface KeystoneIconProps {
  size?: number;
  className?: string;
}

export function KeystoneIcon({ size = 32, className }: KeystoneIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Keystone"
    >
      {/*
        Keystone shape: tapered trapezoid wider at top, narrower at bottom.
        A small arch cutout at the bottom center represents a doorway.
        Uses fill-rule evenodd so the inner arch becomes transparent.
      */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 6 L38 6 L33 42 L15 42 Z M20 42 L20 30 A4 4 0 0 1 28 30 L28 42 Z"
        fill="currentColor"
      />
    </svg>
  );
}
