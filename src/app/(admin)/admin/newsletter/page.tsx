import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import { desc, eq, ilike, count } from "drizzle-orm";
import type { Subscriber } from "@/lib/db/schema";
import { unsubscribeUser, deleteSubscriber } from "./actions";
import Link from "next/link";

export const metadata = { title: "Newsletter Subscribers" };

interface Props {
  searchParams: Promise<{ search?: string }>;
}

export default async function NewsletterPage({ searchParams }: Props) {
  const { search } = await searchParams;

  let rows: Subscriber[] = [];
  let totalCount = 0;
  let activeCount = 0;
  let unsubscribedCount = 0;

  try {
    const whereClause = search
      ? ilike(subscribers.email, `%${search}%`)
      : undefined;

    rows = await db.query.subscribers.findMany({
      where: whereClause,
      orderBy: [desc(subscribers.createdAt)],
    });

    const totals = await db
      .select({ status: subscribers.status, total: count() })
      .from(subscribers)
      .groupBy(subscribers.status);

    for (const row of totals) {
      totalCount += row.total;
      if (row.status === "active") activeCount = row.total;
      if (row.status === "unsubscribed") unsubscribedCount = row.total;
    }
  } catch (err) {
    console.error("newsletter page fetch error:", err);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Newsletter</h1>
        <span className="text-sm text-muted-foreground">{rows.length} result{rows.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{totalCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Subscribers</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Active</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{unsubscribedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Unsubscribed</p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" className="mb-4">
        <div className="flex gap-2 max-w-sm">
          <input
            type="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search by email…"
            className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Search
          </button>
          {search && (
            <Link
              href="/admin/newsletter"
              className="px-4 py-2 border border-border text-sm rounded-lg hover:bg-muted transition-colors"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subscribed</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No subscribers found.
                </td>
              </tr>
            ) : (
              rows.map((sub) => (
                <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{sub.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{sub.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        sub.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-destructive"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {sub.createdAt.toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {sub.status === "active" && (
                        <form action={unsubscribeUser.bind(null, sub.id)}>
                          <button
                            type="submit"
                            className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            Unsubscribe
                          </button>
                        </form>
                      )}
                      <form action={deleteSubscriber.bind(null, sub.id)}>
                        <button
                          type="submit"
                          className="text-xs px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
