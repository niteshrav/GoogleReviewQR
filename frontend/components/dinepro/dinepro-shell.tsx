"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { AdminLogoutButton } from "@frontend/components/admin/admin-logout-button";
import { TrustTapLogo } from "@frontend/components/brand/trusttap-logo";
import { cn } from "@frontend/lib/cn";

const navItems = [
  { href: "/admin/dinepro", label: "Overview" },
  { href: "/admin/dinepro/floor", label: "Live Floor" },
  { href: "/admin/dinepro/tables", label: "Tables" },
  { href: "/admin/dinepro/feedback", label: "Feedback" },
  { href: "/admin/dinepro/issues", label: "Issues" },
  { href: "/admin/dinepro/menu", label: "Menu Insights" },
  { href: "/admin/dinepro/analytics", label: "Analytics" },
  { href: "/admin/dinepro/qr", label: "QR Manager" },
  { href: "/admin/dinepro/setup", label: "Setup" },
];

type DineProShellProps = {
  children: ReactNode;
  restaurantName?: string;
};

export function DineProShell({ children, restaurantName }: DineProShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/25 lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy text-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-white/10 bg-white px-4 py-3">
          <Link href="/admin/dinepro" aria-label="DinePro home">
            <TrustTapLogo variant="horizontal" tagline />
          </Link>
          <p className="mt-1 text-xs font-semibold tracking-wide text-brand">DinePro</p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active =
              item.href === "/admin/dinepro"
                ? pathname === "/admin/dinepro"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium",
                  active ? "bg-brand text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3 space-y-1">
          <Link
            href="/admin"
            className="flex rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            Classic admin
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur">
          <button
            type="button"
            className="rounded-xl border border-border px-3 py-1.5 text-sm lg:hidden"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {restaurantName ?? "Restaurant dashboard"}
            </p>
            <p className="text-xs text-muted">Every table tells a story.</p>
          </div>
          <Link href="/admin/dinepro/setup" className="text-sm font-medium text-brand">
            Setup
          </Link>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
