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
      {/* Keystone trapezoid */}
      <path
        d="M12 8L36 8L32 40L16 40Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Arch cutout */}
      <path
        d="M19 40L19 25A5 5 0 0 1 29 25L29 40Z"
        fill="#2C1810"
      />
      {/* Emerald accent bar */}
      <rect x="12" y="8" width="24" height="3" rx="0.5" fill="#059669" />
      {/* K letter */}
      <text
        x="24"
        y="34"
        fontFamily="serif"
        fontWeight="700"
        fontSize="10"
        fill="#D4A574"
        textAnchor="middle"
        dominantBaseline="central"
      >
        K
      </text>
    </svg>
  );
}
