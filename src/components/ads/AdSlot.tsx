import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

type SlotType = "header" | "in_article" | "sidebar" | "footer";

interface Props {
  slot: SlotType;
  className?: string;
}

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
  if (s.ads_enabled === "false") return null;

  const publisherId = s.adsense_publisher_id;
  const slotId = s[`ad_slot_${slot}`];

  // Custom HTML override for header
  if (slot === "header" && s.ad_custom_header) {
    return (
      <div className={`ad-slot ad-slot-${slot} ${className}`} dangerouslySetInnerHTML={{ __html: s.ad_custom_header }} />
    );
  }

  if (!publisherId || !slotId) {
    // Show placeholder in development
    if (process.env.NODE_ENV === "development") {
      return (
        <div className={`ad-slot-placeholder flex items-center justify-center bg-muted/50 border-2 border-dashed border-border rounded-xl text-muted-foreground text-xs font-medium ${className}`}
          style={{ minHeight: slot === "header" || slot === "footer" ? "90px" : "250px" }}>
          Ad Zone: {slot.replace("_", "-")} — Configure in Admin → Settings
        </div>
      );
    }
    return null;
  }

  const formatMap: Record<SlotType, string> = {
    header: "horizontal",
    in_article: "fluid",
    sidebar: "vertical",
    footer: "horizontal",
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
