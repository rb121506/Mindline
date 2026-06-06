import { EntryEditor } from "@/components/editor/EntryEditor";
import { requireUser } from "@/lib/dal";

export const metadata = { title: "New entry · Journal" };

export default async function NewEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireUser();
  const { date } = await searchParams;

  return (
    <div>
      <p className="mb-5 text-sm font-medium text-accent-strong">New entry</p>
      <EntryEditor initialDate={date} />
    </div>
  );
}
