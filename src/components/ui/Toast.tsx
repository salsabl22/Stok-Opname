import { useEffect } from "react";

interface ToastProps {
  message: string;
  tone?: "success" | "danger";
  onDismiss: () => void;
}

export function Toast({ message, tone = "success", onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const toneStyles =
    tone === "success"
      ? "bg-zodiac-900 text-white"
      : "bg-[--color-danger] text-white";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl
        px-4 py-3 shadow-lg shadow-zodiac-900/20 animate-in fade-in slide-in-from-bottom-2
        ${toneStyles}`}
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        className="text-white/70 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
