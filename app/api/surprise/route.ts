import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getRandomEntryId } from "@/lib/entries";

export async function GET() {
  await requireUser();
  const id = await getRandomEntryId();
  redirect(id ? `/entry/${id}` : "/");
}
