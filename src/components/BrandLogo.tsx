import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  showSubtitle?: boolean;
  showBadge?: boolean;
  compact?: boolean;
};

export default function BrandLogo({
  href = "/",
  className = "",
  iconClassName = "h-10 w-10 rounded-xl",
  titleClassName = "text-lg",
  subtitleClassName = "text-[11px]",
  showSubtitle = true,
  showBadge = true,
  compact = false,
}: BrandLogoProps) {
  return (
    <Link href={href} className={`group flex items-center gap-3 ${className}`}>
      <div
        className={`relative flex shrink-0 items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-lg shadow-blue-500/20 transition group-hover:scale-105 ${iconClassName}`}
      >
        <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-blue-400 to-purple-500 opacity-30 blur-md" />

        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="relative h-1/2 w-1/2"
          stroke="white"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M8 12a4 4 0 018 0M6 12a6 6 0 0112 0" strokeLinecap="round" />
          <circle cx="8" cy="12" r="1" fill="white" />
          <circle cx="16" cy="12" r="1" fill="white" />
          <circle cx="12" cy="8" r="1" fill="white" />
          <circle cx="12" cy="16" r="1" fill="white" />
          <path d="M10 14l2-2 2 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {!compact ? (
        <div className="flex min-w-0 flex-col leading-tight">
          <span
            className={`truncate bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text font-extrabold tracking-tight text-transparent ${titleClassName}`}
          >
            Career Mentor
          </span>

          {showSubtitle ? (
            <div className="flex items-center gap-2">
              <span className={`truncate uppercase tracking-widest text-zinc-500 ${subtitleClassName}`}>
                AI Guidance
              </span>

              {showBadge ? (
                <span className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-2 py-[2px] text-[9px] font-bold text-white">
                  AI
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </Link>
  );
}
