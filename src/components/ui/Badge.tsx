type BadgeTone = "success" | "warning" | "danger" | "neutral";

interface BadgeProps {
  tone: BadgeTone;
  children: React.ReactNode;
}

const TONE_STYLES: Record<BadgeTone, string> = {
  success: "bg-[--color-success-bg] text-[--color-success]",
  warning: "bg-[--color-warning-bg] text-[--color-warning]",
  danger: "bg-[--color-danger-bg] text-[--color-danger]",
  neutral: "bg-zodiac-50 text-zodiac-600",
};

export function Badge({ tone, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TONE_STYLES[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}
