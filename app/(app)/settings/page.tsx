import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { logout } from "@/app/actions/auth";
import { ReminderSettings } from "@/components/settings/ReminderSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { LogoutIcon, DownloadIcon, ChevronRightIcon } from "@/components/icons";

export const metadata = { title: "Settings · Journal" };

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="animate-fade-in">
      <header className="mb-7">
        <p className="text-sm font-medium text-accent-strong">Preferences</p>
        <h1 className="mt-0.5 font-serif text-3xl font-semibold tracking-tight">
          Settings
        </h1>
      </header>

      <div className="space-y-4">
        <AppearanceSettings />
        <ReminderSettings />

        <Link
          href="/export"
          className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:bg-muted"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent-strong">
              <DownloadIcon className="h-[18px] w-[18px]" />
            </span>
            <div>
              <h2 className="font-semibold">Export & backup</h2>
              <p className="text-sm text-muted-foreground">
                Download as Markdown or print to PDF
              </p>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
        </Link>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-semibold">Account</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">{user.email}</span>
          </p>
          <form action={logout} className="mt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <LogoutIcon className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
