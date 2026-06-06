import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in · Mindline" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ember lg:block">
        <div className="absolute inset-0 opacity-[0.14] [background:radial-gradient(circle_at_28%_18%,#fff_0,transparent_42%),radial-gradient(circle_at_82%_72%,#fff_0,transparent_38%)]" />
        {/* Decorative oversized monogram */}
        <span className="pointer-events-none absolute -bottom-16 -right-8 font-serif text-[22rem] font-semibold leading-none text-white/[0.07] select-none">
          M
        </span>
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/25 font-serif text-xl font-semibold">
              M
            </span>
            <div className="flex flex-col leading-none">
              <span className="font-serif text-lg font-semibold">Mindline</span>
              <span className="mt-1 text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-white/55">
                Est. 2026 · Personal Almanac
              </span>
            </div>
          </div>
          <div className="max-w-md">
            <div className="mb-6 h-px w-16 bg-white/30" />
            <p className="font-serif text-[2.75rem] leading-[1.08] tracking-tight">
              <span className="italic">“Fill your paper</span> with the breathings
              of your heart.”
            </p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
              — William Wordsworth
            </p>
          </div>
          <p className="text-sm text-white/65">
            Your private space to reflect, one day at a time.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-scale-in">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ember font-serif text-lg font-semibold text-white shadow-glow">
              M
            </span>
            <span className="font-serif text-xl font-semibold tracking-tight">
              Mindline
            </span>
          </div>
          <p className="eyebrow">Welcome back</p>
          <h1 className="mt-1.5 font-serif text-[2.5rem] font-semibold leading-[1.05] tracking-tight">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Continue to your private journal.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
