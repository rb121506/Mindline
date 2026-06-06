import { Sidebar } from "@/components/nav/Sidebar";
import { BottomNav } from "@/components/nav/BottomNav";
import { CommandPalette } from "@/components/CommandPalette";
import { WriteFab } from "@/components/home/WriteFab";
import { requireUser } from "@/lib/dal";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Belt-and-suspenders: proxy also guards these routes, but enforce here too.
  await requireUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-5 pb-28 pt-7 md:px-10 md:pb-12 md:pt-10">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>
      <BottomNav />
      <WriteFab />
      <CommandPalette />
    </div>
  );
}
