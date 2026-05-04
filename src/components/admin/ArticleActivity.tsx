import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { sql, count } from "drizzle-orm";

interface DayStat {
  day: string;
  total: number;
  auto: number;
  manual: number;
}

interface HourStat {
  hour: number;
  total: number;
  auto: number;
  manual: number;
}

async function getActivityData() {
  const [daily, hourly] = await Promise.all([
    db
      .select({
        day: sql<string>`TO_CHAR(created_at, 'YYYY-MM-DD')`,
        total: count(),
        auto: sql<number>`CAST(SUM(CASE WHEN trend_id IS NOT NULL THEN 1 ELSE 0 END) AS INTEGER)`,
        manual: sql<number>`CAST(SUM(CASE WHEN trend_id IS NULL THEN 1 ELSE 0 END) AS INTEGER)`,
      })
      .from(posts)
      .where(sql`created_at >= NOW() - INTERVAL '7 days'`)
      .groupBy(sql`TO_CHAR(created_at, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(created_at, 'YYYY-MM-DD') DESC`) as Promise<DayStat[]>,

    db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM created_at)::integer`,
        total: count(),
        auto: sql<number>`CAST(SUM(CASE WHEN trend_id IS NOT NULL THEN 1 ELSE 0 END) AS INTEGER)`,
        manual: sql<number>`CAST(SUM(CASE WHEN trend_id IS NULL THEN 1 ELSE 0 END) AS INTEGER)`,
      })
      .from(posts)
      .where(sql`created_at::date = CURRENT_DATE`)
      .groupBy(sql`EXTRACT(HOUR FROM created_at)`)
      .orderBy(sql`EXTRACT(HOUR FROM created_at)`) as Promise<HourStat[]>,
  ]);

  return { daily, hourly };
}

function formatDayLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = (today.getTime() - d.getTime()) / 86400000;
  if (diff < 1) return "Today";
  if (diff < 2) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatHourLabel(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

export async function ArticleActivity() {
  const { daily, hourly } = await getActivityData();

  const todayRow = daily[0] && formatDayLabel(daily[0].day) === "Today" ? daily[0] : null;
  const todayTotal = todayRow?.total ?? 0;
  const todayAuto = todayRow?.auto ?? 0;
  const todayManual = todayRow?.manual ?? 0;

  const maxDaily = Math.max(...daily.map((d) => d.total), 1);
  const maxHourly = Math.max(...hourly.map((h) => h.total), 1);

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
          <div className="flex items-end gap-1 h-16">
            {hourly.map((h) => (
              <div key={h.hour} className="flex-1 flex flex-col items-center gap-0.5" title={`${formatHourLabel(h.hour)}: ${h.total} (${h.auto} AI, ${h.manual} manual)`}>
                <div className="w-full rounded-sm overflow-hidden flex flex-col-reverse" style={{ height: `${Math.max(4, (h.total / maxHourly) * 56)}px` }}>
                  <div className="bg-blue-500 dark:bg-blue-400" style={{ height: `${(h.auto / Math.max(h.total, 1)) * 100}%` }} />
                  <div className="bg-purple-400 dark:bg-purple-500" style={{ height: `${(h.manual / Math.max(h.total, 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>11 PM</span>
          </div>
        </div>
      )}

      {/* Last 7 days table */}
      {daily.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Last 7 days</p>
          <div className="space-y-1.5">
            {daily.map((row) => (
              <div key={row.day} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20 shrink-0">{formatDayLabel(row.day)}</span>
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="bg-blue-500 dark:bg-blue-400 h-full rounded-full"
                    style={{ width: `${(row.auto / maxDaily) * 100}%` }}
                    title={`${row.auto} AI`}
                  />
                  <div
                    className="bg-purple-400 dark:bg-purple-500 h-full"
                    style={{ width: `${(row.manual / maxDaily) * 100}%` }}
                    title={`${row.manual} manual`}
                  />
                </div>
                <span className="text-xs font-semibold w-6 text-right shrink-0">{row.total}</span>
              </div>
            ))}
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
