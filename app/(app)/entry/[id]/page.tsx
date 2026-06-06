import { notFound } from "next/navigation";
import { EntryPageWrapper } from "@/components/editor/EntryPageWrapper";
import { getEntry } from "@/lib/entries";
import { requireUser } from "@/lib/dal";

export const metadata = { title: "Entry · Mindline" };

export default async function EntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const entry = await getEntry(id);

  if (!entry) notFound();

  return <EntryPageWrapper entry={entry} />;
}
