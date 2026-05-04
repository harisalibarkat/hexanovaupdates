"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { HexaLogo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import type { User } from "next-auth";

const navItems = [
  { href: "/admin",            label: "Dashboard",    icon: "📊" },
  { href: "/admin/posts",      label: "Articles",     icon: "📝" },
  { href: "/admin/comments",   label: "Comments",     icon: "💬" },
  { href: "/admin/newsletter", label: "Newsletter",   icon: "✉️" },
  { href: "/admin/analytics",  label: "Analytics",    icon: "📈" },
  { href: "/admin/seo",        label: "SEO Optimizer",icon: "🔍" },
  { href: "/admin/sources",    label: "RSS Sources",  icon: "📡" },
  { href: "/admin/settings",   label: "Settings",     icon: "⚙️" },
];

interface Props {
  user?: User;
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ user, isOpen, onClose }: Props) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto",
        "w-72 lg:w-64 bg-card border-r border-border flex flex-col",
        "transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link href="/" target="_blank" className="flex items-center gap-2 group">
          <HexaLogo size={28} />
          <div>
            <p className="font-bold text-sm leading-tight">
              <span className="text-brand">Hexa</span>Nova
              <span className="text-muted-foreground font-normal">Updates</span>
            </p>
            <p className="text-xs text-muted-foreground group-hover:text-brand transition-colors">
              View Site ↗
            </p>
          </div>
        </Link>

        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Close navigation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
        <Link
          href="/sitemap.xml"
          target="_blank"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-brand transition-colors px-3 py-1.5 rounded-lg hover:bg-muted w-full"
        >
          🗺️ View Sitemap
        </Link>
        <div className="text-xs text-muted-foreground px-3 py-1 truncate">{user?.email}</div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full text-sm text-muted-foreground hover:text-destructive transition-colors text-left px-3 py-2 rounded-lg hover:bg-muted"
          >
            🚪 Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
