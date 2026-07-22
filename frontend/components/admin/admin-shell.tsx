"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { cn } from "@frontend/lib/cn";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "◈" },
  { href: "/admin/businesses", label: "Businesses", icon: "▣" },
];

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-white transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">
            F
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight">FeedbackFlow</p>
            <p className="text-[11px] text-muted">Admin console</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-soft text-brand"
                    : "text-muted hover:bg-slate-50 hover:text-foreground",
                )}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:bg-slate-50 hover:text-foreground"
          >
            ← Public site
          </Link>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/80 bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <div className="relative hidden flex-1 md:block">
            <input
              type="search"
              placeholder="Search businesses, feedback…"
              className="w-full max-w-md rounded-xl border border-border bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-[var(--ring)]"
              aria-label="Search"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted hover:bg-slate-50"
              aria-label="Notifications"
            >
              🔔
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand" />
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-border px-2.5 py-1.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                A
              </span>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold">Admin</p>
                <p className="text-[10px] text-muted">Pilot access</p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
