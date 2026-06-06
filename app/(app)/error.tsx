"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service in production.
    console.error("[Mindline]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center animate-fade-in">
      <div className="text-center max-w-md px-6">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-red-100 text-3xl dark:bg-red-900/30">
          ⚠️
        </div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          An unexpected error occurred while loading this page. This has been
          logged — try again and it may resolve itself.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-ember px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:brightness-105 active:scale-[0.98]"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card-muted"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
