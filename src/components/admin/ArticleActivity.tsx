import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { sql, count } from "drizzle-orm";

async function getDailyStats() {
  return db
    .select({
      day: sql<string>`TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
      total: count(),
      auto: sql<number>`CAST(SUM(CASE WHEN trend_id IS NOT NULL THEN 1 ELSE 0 END) AS INTEGER)`,
      manual: sql<number>`CAST(SUM(CASE WHEN trend_id IS NULL THEN 1 ELSE 0 END) AS INTEGER)`,
    })
    .from(posts)
    .where(sql`created_at >= NOW() - INTERVAL '7 days'`)
    .groupBy(sql`TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')`)
    .orderBy(sql`TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') DESC`);
}

async function getHourlyStats() {
  return db
    .select({
      hour: sql<number>`CAST(EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC') AS INTEGER)`,
      total: count(),
      auto: sql<number>`CAST(SUM(CASE WHEN trend_id IS NOT NULL THEN 1 ELSE 0 END) AS INTEGER)`,
      manual: sql<number>`CAST(SUM(CASE WHEN trend_id IS NULL THEN 1 ELSE 0 END) AS INTEGER)`,
    })
    .from(posts)
    .where(sql`DATE(created_at AT TIME ZONE 'UTC') = CURRENT_DATE`)
    .groupBy(sql`CAST(EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC') AS INTEGER)`)
    .orderBy(sql`CAST(EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC') AS INTEGER)`);
}

function toNum(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function formatDayLabel(dateStr: string) {
  try {
    const d = new Date(dateStr + "T00:00:00Z");
    const nowUTC = new Date();
    const todayUTC = new Date(
      Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate())
    );
    const diff = (todayUTC.getTime() - d.getTime()) / 86400000;
    if (diff < 1) return "Today";
    if (diff < 2) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  } catch {
    return dateStr;
  }
}

function formatHourLabel(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

export async function ArticleActivity() {
  let daily: Awaited<ReturnType<typeof getDailyStats>> = [];
  let hourly: Awaited<ReturnType<typeof getHourlyStats>> = [];

  try {
    [daily, hourly] = await Promise.all([getDailyStats(), getHourlyStats()]);
  } catch (err) {
    console.error("[ArticleActivity] DB query failed:", err);
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-bold mb-1">Article Activity</h2>
        <p className="text-sm text-muted-foreground">Could not load activity data.</p>
      </div>
    );
  }

  const todayLabel = daily[0] ? formatDayLabel(daily[0].day) : "";
  const todayRow = todayLabel === "Today" ? daily[0] : null;
  const todayTotal = toNum(todayRow?.total);
  const todayAuto = toNum(todayRow?.auto);
  const todayManual = toNum(todayRow?.manual);

  const maxDaily = Math.max(...daily.map((d) => toNum(d.total)), 1);
  const maxHourly = Math.max(...hourly.map((h) => toNum(h.total)), 1);

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Article Activity</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Auto vs manually added articles</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{todayTotal}</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </div>
      </div>

      {/* Today summary pills */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
          {todayAuto} AI Generated
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
          {todayManual} Manual
        </span>
      </div>

      {/* Hourly chart for today */}
      {hourly.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Today by hour</p>
          <div className="flex items-end gap-0.5 h-16">
            {hourly.map((h) => {
              const tot = toNum(h.total);
              const aut = toNum(h.auto);
              const man = toNum(h.manual);
              const barH = Math.max(4, (tot / maxHourly) * 56);
              return (
                <div
                  key={h.hour}
                  className="flex-1"
                  title={`${formatHourLabel(toNum(h.hour))}: ${tot} (${aut} AI, ${man} manual)`}
                >
                  <div
                    className="w-full rounded-sm overflow-hidden flex flex-col-reverse"
                    style={{ height: `${barH}px` }}
                  >
                    <div
                      className="bg-blue-500 dark:bg-blue-400"
                      style={{ height: `${(aut / Math.max(tot, 1)) * 100}%` }}
                    />
                    <div
                      className="bg-purple-400 dark:bg-purple-500"
                      style={{ height: `${(man / Math.max(tot, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11 PM</span>
          </div>
        </div>
      )}

      {/* Last 7 days */}
      {daily.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Last 7 days</p>
          <div className="space-y-1.5">
            {daily.map((row) => {
              const tot = toNum(row.total);
              const aut = toNum(row.auto);
              const man = toNum(row.manual);
              return (
                <div key={row.day} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">
                    {formatDayLabel(row.day)}
                  </span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden flex">
                    <div
                      className="bg-blue-500 dark:bg-blue-400 h-full"
                      style={{ width: `${(aut / maxDaily) * 100}%` }}
                      title={`${aut} AI`}
                    />
                    <div
                      className="bg-purple-400 dark:bg-purple-500 h-full"
                      style={{ width: `${(man / maxDaily) * 100}%` }}
                      title={`${man} manual`}
                    />
                  </div>
                  <span className="text-xs font-semibold w-6 text-right shrink-0">{tot}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />AI Generated
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-400 inline-block" />Manual
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No articles in the last 7 days.</p>
      )}
    </div>
  );
}
