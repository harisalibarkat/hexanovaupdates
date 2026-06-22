import Link from "next/link";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { CATEGORIES, categoryLabel } from "@/lib/utils";
import { Newsletter } from "./Newsletter";

async function getRecentByCategory(category: string) {
  return db.query.posts.findMany({
    where: and(eq(posts.category, category as "tech"), eq(posts.status, "published")),
    orderBy: [desc(posts.publishedAt)],
    limit: 4,
  });
}

const CAT_DOT: Record<string, string> = {
  tech:    "bg-blue-500",
  celebs:  "bg-pink-500",
  viral:   "bg-orange-500",
  finance: "bg-emerald-500",
  health:  "bg-green-500",
  travel:  "bg-cyan-500",
};

export async function Footer() {
  const year = new Date().getFullYear();
  const verticals = CATEGORIES.slice(0, 4);
  const network   = CATEGORIES.slice(4);

  return (
    <footer className="bg-black text-white mt-16 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
              <h2 className="text-xl font-black tracking-tight uppercase text-white">
                HexaNova<span className="font-light opacity-60">Updates</span>
              </h2>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6 italic">
              Editorial precision for the modern age.
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={`/${cat}`}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border border-zinc-800 hover:border-zinc-600 text-zinc-500 hover:text-white transition-all"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${CAT_DOT[cat] ?? "bg-white"}`} />
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Verticals */}
          <div>
            <h5 className="cat-label text-zinc-500 uppercase mb-5 pb-2 border-b border-zinc-800">
              Verticals
            </h5>
            <ul className="space-y-3">
              {verticals.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/${cat}`}
                    className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2.5 group"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${CAT_DOT[cat] ?? "bg-white"} opacity-60 group-hover:opacity-100 transition-opacity`} />
                    {categoryLabel(cat)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Network / Lifestyle + Legal */}
          <div>
            <h5 className="cat-label text-zinc-500 uppercase mb-5 pb-2 border-b border-zinc-800">
              Network
            </h5>
            <ul className="space-y-3 mb-8">
              {network.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/${cat}`}
                    className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2.5 group"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${CAT_DOT[cat] ?? "bg-white"} opacity-60 group-hover:opacity-100 transition-opacity`} />
                    {categoryLabel(cat)}
                  </Link>
                </li>
              ))}
            </ul>
            <h5 className="cat-label text-zinc-600 uppercase mb-3">Legal</h5>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="cat-label text-zinc-500 uppercase mb-5 pb-2 border-b border-zinc-800">
              Newsletter
            </h5>
            <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
              Curated insights on tech, culture, and finance — every Monday morning.
            </p>
            <Newsletter compact />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">© {year} HexaNovaUpdates. Editorial Precision.</p>
          <div className="flex items-center gap-6 text-xs text-zinc-700">
            <Link href="/privacy-policy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-zinc-400 transition-colors">Terms</Link>
            <Link href="/cookie-policy" className="hover:text-zinc-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
