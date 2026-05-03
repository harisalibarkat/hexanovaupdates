---
page: search
---
Redesign the search results page (`src/app/(public)/search/page.tsx`) to match the new premium editorial aesthetic.

**Goals:**
- Search input bar at top — large, prominent, with a magnifying glass icon, dark bg version of the site's card style
- "X results for 'query'" heading using the same section-heading pattern (left bar accent + bold text)
- Results displayed as ArticleCard grid (already imported, just needs layout wiring)
- Empty state with a nice illustration-style message
- Suggested categories below results

**DESIGN SYSTEM (REQUIRED):**
Use a dark editorial news aesthetic. Bold section headings with colored left-bar accents. Cards with left-side colored category borders and hover shadow lifts. Header has a thin rainbow-to-brand gradient line at top. Footer is always dark zinc-950 with colored category dots. Breaking news ticker on dark background with LIVE badge. Newsletter section is dark zinc-950 with glowing brand color blobs. Category pages have a dark gradient hero banner matching the category color.

**Page Structure:**
1. Full-width search bar hero section (dark bg, gradient accent)
2. "Showing N results for 'query'" with bold section heading pattern
3. ArticleCard 3-column grid for results
4. Empty state if no results
5. Category browse section at bottom (links to all 6 categories)
