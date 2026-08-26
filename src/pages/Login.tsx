import { useState, type FormEvent } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { login } from "../services/authService";
import type { AuthUser } from "../types/auth";

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const user = await login({ username, password });
      onLoginSuccess(user); 
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan saat login.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zodiac-950 px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-zodiac-700/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-amber-accent/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-accent font-display text-lg font-bold text-zodiac-950">
            W
          </div>
          <h1 className="font-display text-xl font-semibold text-white">
            Warehouse Management System
          </h1>
          <p className="mt-1.5 text-sm text-zodiac-300">
            Masuk untuk mengelola operasional gudang CrewFlow
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-surface p-7 shadow-xl shadow-zodiac-950/40"
        >
          <div className="flex flex-col gap-4">
            <Input
              label="Username"
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {errorMessage && (
              <div
                role="alert"
                className="rounded-lg bg-[--color-danger-bg] px-3.5 py-2.5 text-sm text-[--color-danger]"
              >
                {errorMessage}
              </div>
            )}

            <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
              {isSubmitting ? "Memverifikasi..." : "Masuk"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-zodiac-400">
          CrewFlow Stock Opname Module — Internal Use Only
        </p>
      </div>
    </div>
  );
}
