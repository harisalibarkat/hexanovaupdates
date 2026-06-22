import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="bg-black py-3 text-center">
        <span className="cat-label text-white/60 tracking-[0.2em] text-xs">HEXANOVAUPDATES</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-xl">
          <span className="font-serif font-black text-[120px] sm:text-[160px] leading-none text-foreground/5 select-none block">
            404
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-4 -mt-4">
            Page Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            This page doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-black text-white cat-label px-8 py-3 hover:bg-black/80 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
