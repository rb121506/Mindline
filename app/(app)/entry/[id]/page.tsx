import { notFound } from "next/navigation";
import { EntryEditor } from "@/components/editor/EntryEditor";
import { getEntry } from "@/lib/entries";
import { requireUser } from "@/lib/dal";

export const metadata = { title: "Entry · Journal" };

export default async function EntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const entry = await getEntry(id);

  if (!entry) notFound();

  return (
    <div className="py-2">
      <EntryEditor entry={entry} />
    </div>
  );
}
