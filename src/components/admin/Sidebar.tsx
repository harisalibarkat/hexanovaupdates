"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { HexaLogo } from "@/components/Logo";
import type { User } from "next-auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/posts", label: "Articles", icon: "📝" },
  { href: "/admin/comments", label: "Comments", icon: "💬" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "✉️" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/sources", label: "RSS Sources", icon: "📡" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

interface Props {
  user?: User;
}

export function AdminSidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <Link href="/" target="_blank" className="flex items-center gap-2 group">
          <HexaLogo size={28} />
          <div>
            <p className="font-bold text-sm leading-tight">
              <span className="text-brand">Hexa</span>Nova
              <span className="text-muted-foreground font-normal">Updates</span>
            </p>
            <p className="text-xs text-muted-foreground group-hover:text-brand transition-colors flex items-center gap-1">
              View Site ↗
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-brand transition-colors px-3 py-1.5 rounded-lg hover:bg-muted w-full"
        >
          🌐 View Public Site
        </Link>
        <div className="text-xs text-muted-foreground px-3 truncate">{user?.email}</div>
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
