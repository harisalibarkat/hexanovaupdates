import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const row = await db.query.settings.findFirst({
    where: eq(settings.key, "adsense_publisher_id"),
  });
  const publisherId = row?.value?.trim() ?? "";

  if (!publisherId) {
    return new Response(
      "# ads.txt — set your AdSense Publisher ID in Admin → Settings → Advertising to enable this file\n",
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  // Standard Google AdSense ads.txt line
  // DIRECT = you own the ad inventory; f08c47fec0942fa0 = Google's certification authority ID
  const content = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
