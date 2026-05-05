import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

type SlotType = "header" | "in_article" | "sidebar" | "footer";

interface Props {
  slot: SlotType;
  className?: string;
}

const SLOT_LABELS: Record<SlotType, string> = {
  header:     "Header Banner (728×90)",
  in_article: "In-Article Ad",
  sidebar:    "Sidebar Ad (300×250)",
  footer:     "Footer Banner (728×90)",
};

const SLOT_HEIGHTS: Record<SlotType, string> = {
  header:     "90px",
  in_article: "250px",
  sidebar:    "250px",
  footer:     "90px",
};

async function getAdSettings() {
  const rows = await db.query.settings.findMany({
    where: inArray(settings.key, [
      "ads_enabled", "adsense_publisher_id",
      "ad_slot_header", "ad_slot_in_article", "ad_slot_sidebar", "ad_slot_footer",
      "ad_custom_header",
    ]),
  });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function AdSlot({ slot, className = "" }: Props) {
  const s = await getAdSettings();

  // Master kill-switch — when ads are explicitly disabled, render nothing
  if (s.ads_enabled === "false") return null;

  const publisherId = s.adsense_publisher_id;
  const slotId      = s[`ad_slot_${slot}`];

  // Custom HTML override for header slot
  if (slot === "header" && s.ad_custom_header) {
    return (
      <div
        className={`ad-slot ad-slot-${slot} ${className}`}
        dangerouslySetInnerHTML={{ __html: s.ad_custom_header }}
      />
    );
  }

  // No publisher ID or slot ID → show a visible placeholder so the admin
  // knows the zone exists and where to configure it
  if (!publisherId || !slotId) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 bg-muted/40 border border-dashed border-border/70 rounded-lg text-muted-foreground/60 text-xs font-medium ${className}`}
        style={{ minHeight: SLOT_HEIGHTS[slot] }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect width="20" height="16" x="2" y="4" rx="2"/><path d="M2 9h20M9 4v16"/>
        </svg>
        <span>{SLOT_LABELS[slot]}</span>
        <span className="text-[10px] opacity-70">Configure slot ID in Admin → Advertising</span>
      </div>
    );
  }

  const formatMap: Record<SlotType, string> = {
    header:     "horizontal",
    in_article: "fluid",
    sidebar:    "vertical",
    footer:     "horizontal",
  };

  return (
    <div className={`ad-slot ad-slot-${slot} ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format={formatMap[slot]}
        data-full-width-responsive="true"
      />
    </div>
  );
}
