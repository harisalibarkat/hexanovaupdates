import Link from "next/link";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { CATEGORIES, categoryLabel } from "@/lib/utils";

async function getRecentByCategory(category: string) {
  return db.query.posts.findMany({
    where: and(eq(posts.category, category as "tech"), eq(posts.status, "published")),
    orderBy: [desc(posts.publishedAt)],
    limit: 3,
  });
}

export async function Footer() {
  const year = new Date().getFullYear();

  const [techPosts, celebsPosts] = await Promise.all([
    getRecentByCategory("tech"),
    getRecentByCategory("celebs"),
  ]);

  return (
    <footer className="bg-muted/30 border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-3">
              <span className="text-xl font-extrabold">
                <span className="text-brand">Hexa</span>
                <span className="text-foreground">Nova</span>
                <span className="text-muted-foreground font-normal">Updates</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered trending news across tech, celebrities, viral stories, finance, health, and travel.
            </p>
            <div className="mt-4 flex gap-3">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={`/${cat}`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  title={categoryLabel(cat)}
                >
                  {cat.slice(0, 3).toUpperCase()}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Categories</h4>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link href={`/${cat}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                    {categoryLabel(cat)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Tech */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Recent in Tech</h4>
            <ul className="space-y-3">
              {techPosts.length > 0 ? techPosts.map((p) => (
                <li key={p.id}>
                  <Link href={`/tech/${p.slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors line-clamp-2 leading-snug">
                    {p.title}
                  </Link>
                </li>
              )) : (
                <li className="text-sm text-muted-foreground">No posts yet</li>
              )}
            </ul>
          </div>

          {/* Legal + Recent Celebs */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Recent in Celebs</h4>
            <ul className="space-y-3 mb-6">
              {celebsPosts.length > 0 ? celebsPosts.map((p) => (
                <li key={p.id}>
                  <Link href={`/celebs/${p.slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors line-clamp-2 leading-snug">
                    {p.title}
                  </Link>
                </li>
              )) : (
                <li className="text-sm text-muted-foreground">No posts yet</li>
              )}
            </ul>
            <h4 className="font-semibold text-sm mb-2">Legal</h4>
            <ul className="space-y-1.5">
              <li><a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {year} HexaNovaUpdates. All rights reserved.</span>
          <span>Content generated with AI assistance.</span>
        </div>
      </div>
    </footer>
  );
}
