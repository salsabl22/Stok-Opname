import { forwardRef, useId, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-zodiac-700"
        >
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-zodiac-900
            placeholder:text-zodiac-300 transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-zodiac-500 focus:border-transparent
            ${error ? "border-[--color-danger]" : "border-zodiac-200"}
            ${className}`}
          {...rest}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-[--color-danger]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
