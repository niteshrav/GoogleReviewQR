"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { AdminLogoutButton } from "@frontend/components/admin/admin-logout-button";
import { cn } from "@frontend/lib/cn";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/businesses", label: "Businesses" },
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
          className="fixed inset-0 z-40 bg-foreground/25 lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/admin" className="text-base font-semibold tracking-tight">
            FeedbackFlow
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
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
                  "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-soft text-brand"
                    : "text-muted hover:bg-background hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center rounded-xl px-3 py-2 text-sm text-muted hover:bg-background hover:text-foreground"
          >
            Public site
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-white/90 px-4 backdrop-blur-sm sm:px-6">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <p className="hidden text-sm text-muted md:block">
            {pathname.startsWith("/admin/businesses")
              ? "Businesses & QR codes"
              : "Admin"}
          </p>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-muted sm:inline">Admin</span>
            <AdminLogoutButton />
          </div>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
