# HexaNovaUpdates Design System

## 1. Brand Identity
- **Name**: HexaNovaUpdates
- **Personality**: Bold, trustworthy, editorial, modern news platform
- **Voice**: Confident, informative, energetic

## 2. Color Palette
- **Brand**: `oklch(0.55 0.22 260)` — indigo/violet (primary accent)
- **Tech**: `#3b82f6` (blue-500)
- **Celebs**: `#ec4899` (pink-500)
- **Viral**: `#f97316` (orange-500)
- **Finance**: `#10b981` (emerald-500)
- **Health**: `#22c55e` (green-500)
- **Travel**: `#06b6d4` (cyan-500)
- **Background (light)**: `oklch(0.99 0 0)` — near white
- **Background (dark)**: `oklch(0.09 0.005 285)` — near black
- **Footer**: Always `#09090b` (zinc-950) with light text

## 3. Typography
- **Font**: Inter (system-ui fallback)
- **Hero titles**: 3xl–5xl, font-black, tracking-tight
- **Section headings**: 2xl–3xl, font-black, tracking-tight
- **Card titles**: base–xl, font-extrabold
- **Body**: sm–base, font-normal, leading-relaxed
- **Labels/badges**: xs, font-black, uppercase, tracking-widest

## 4. Component Patterns
- **Cards**: `rounded-2xl`, `border border-border/70`, `border-l-4 {cat-color}`, `shadow-sm`, hover lifts 4px with shadow-xl
- **Section headings**: 1.5px left bar + big bold text + fade-right line
- **Image overlays**: Category pill (top-left) + reading time pill (top-right) on card images
- **Hero**: Full-bleed image, multi-layer gradient overlay (from-black/95 via-black/50), white text
- **Badges**: Rounded-full, category color background, white text, font-black uppercase
- **Buttons primary**: `bg-brand text-white rounded-xl shadow-md shadow-brand/30`
- **Buttons ghost**: `border border-border hover:bg-muted rounded-xl`

## 5. Header / Footer
- **Header**: Sticky, `bg-background/95 backdrop-blur-xl`, 3px gradient top bar (brand → purple → pink), active nav links show colored underline dot
- **Footer**: Always dark (`bg-zinc-950`), same 3px gradient top bar, 4-column grid

## 6. Design System Notes for Stitch Generation
Use a dark editorial news aesthetic. Bold section headings with colored left-bar accents. Cards with left-side colored category borders and hover shadow lifts. Header has a thin rainbow-to-brand gradient line at top. Footer is always dark zinc-950 with colored category dots. Breaking news ticker on dark background with LIVE badge. Newsletter section is dark zinc-950 with glowing brand color blobs. Category pages have a dark gradient hero banner matching the category color.
