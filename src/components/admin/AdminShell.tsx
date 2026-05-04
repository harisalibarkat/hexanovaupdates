"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/Sidebar";
import type { User } from "next-auth";

interface Props {
  user?: User;
  children: React.ReactNode;
}

export function AdminShell({ user, children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when navigating (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <AdminSidebar user={user} isOpen={open} onClose={() => setOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile-only top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0 z-30">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
            aria-label="Open navigation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" x2="21" y1="6" y2="6"/>
              <line x1="3" x2="21" y1="12" y2="12"/>
              <line x1="3" x2="21" y1="18" y2="18"/>
            </svg>
          </button>
          <span className="font-bold text-sm">
            <span className="text-brand">Hexa</span>Nova Admin
          </span>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
