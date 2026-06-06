import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in · Mindline" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ember lg:block">
        <div className="absolute inset-0 opacity-[0.12] [background:radial-gradient(circle_at_30%_20%,#fff_0,transparent_40%),radial-gradient(circle_at_80%_70%,#fff_0,transparent_35%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="text-2xl">📓</span>
            <span className="font-serif">Mindline</span>
          </div>
          <div className="max-w-md">
            <p className="font-serif text-4xl leading-tight tracking-tight">
              “Fill your paper with the breathings of your heart.”
            </p>
            <p className="mt-4 text-sm text-white/70">— William Wordsworth</p>
          </div>
          <p className="text-sm text-white/60">
            Your private space to reflect, one day at a time.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-scale-in">
          <div className="mb-8 lg:hidden">
            <span className="text-3xl">📓</span>
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to continue to your journal.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
