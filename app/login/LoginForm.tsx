"use client";

import { useActionState } from "react";
import { login, type AuthState } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState | undefined, FormData>(
    login,
    undefined,
  );

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm shadow-soft outline-none transition-all placeholder:text-muted-foreground/60 focus:border-accent focus:ring-4 focus:ring-[var(--ring)]"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm shadow-soft outline-none transition-all placeholder:text-muted-foreground/60 focus:border-accent focus:ring-4 focus:ring-[var(--ring)]"
        />
      </div>

      {state?.error && (
        <div className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group relative w-full overflow-hidden rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Accounts are managed in Supabase.
      </p>
    </form>
  );
}
