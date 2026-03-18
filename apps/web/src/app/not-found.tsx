import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
      <div className="mb-6">
        <span className="text-[72px] font-bold text-sand/30 font-data">404</span>
      </div>
      <h1
        className="text-[24px] text-earth mb-3"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Page not found
      </h1>
      <p className="text-[14px] text-muted mb-8 max-w-md leading-relaxed">
        The page you are looking for does not exist or has been moved. Let us get you back on track.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="px-6 py-2.5 text-[14px] font-medium bg-earth text-warm rounded-xl hover:bg-earth-light transition-colors"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/"
          className="px-6 py-2.5 text-[14px] font-medium border border-border text-earth rounded-xl hover:bg-surface-alt transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
