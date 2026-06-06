import { searchEntries } from "@/lib/entries";
import { SearchClient } from "@/components/search/SearchClient";
import { requireUser } from "@/lib/dal";

export const metadata = { title: "Search · Mindline" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireUser();
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchEntries(query) : [];

  return (
    <div className="animate-fade-in">
      <header className="mb-7">
        <p className="text-sm font-medium text-accent-strong">Discover</p>
        <h1 className="mt-0.5 font-serif text-3xl font-semibold tracking-tight">
          Search
        </h1>
      </header>
      <SearchClient initialQuery={query} initialResults={results} />
    </div>
  );
}
