import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center animate-fade-in">
      <div className="text-center max-w-md px-6">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-amber-100 text-3xl dark:bg-amber-900/30">
          📓
        </div>
        <h1 className="font-serif text-4xl font-semibold tracking-tight">
          404
        </h1>
        <p className="mt-1 font-serif text-lg text-muted-foreground">
          Page not found
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Let&apos;s get you back on track.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-ember px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:brightness-105 active:scale-[0.98]"
          >
            ← Back to journal
          </Link>
        </div>
      </div>
    </div>
  );
}
