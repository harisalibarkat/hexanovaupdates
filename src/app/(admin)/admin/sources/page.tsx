import { db } from "@/lib/db";
import { rssSources } from "@/lib/db/schema";
import { SourcesManager } from "@/components/admin/SourcesManager";

export const metadata = { title: "RSS Sources" };

export default async function SourcesPage() {
  const sources = await db.query.rssSources.findMany({
    orderBy: (s, { asc }) => [asc(s.category), asc(s.name)],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">RSS Sources</h1>
      </div>
      <SourcesManager sources={sources} />
    </div>
  );
}
