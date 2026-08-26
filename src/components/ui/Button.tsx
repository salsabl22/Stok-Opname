import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  children: ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-zodiac-800 text-white hover:bg-zodiac-700 focus-visible:ring-zodiac-600 disabled:bg-zodiac-300",
  secondary:
    "bg-white text-zodiac-800 border border-zodiac-200 hover:bg-zodiac-50 focus-visible:ring-zodiac-400",
  danger:
    "bg-white text-[--color-danger] border border-[--color-danger] hover:bg-[--color-danger-bg] focus-visible:ring-[--color-danger]",
  ghost:
    "bg-transparent text-zodiac-600 hover:bg-zodiac-50 focus-visible:ring-zodiac-400",
};

export function Button({
  variant = "primary",
  isLoading = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5
        text-sm font-medium transition-colors duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        ${VARIANT_STYLES[variant]} ${className}`}
      {...rest}
    >
      {isLoading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
