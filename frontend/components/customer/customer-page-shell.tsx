import { ReactNode } from "react";
import { cn } from "@frontend/lib/cn";

type CustomerPageShellProps = {
  children: ReactNode;
  className?: string;
};

/** Shared mobile-first shell for QR scan customer flows. */
export function CustomerPageShell({ children, className }: CustomerPageShellProps) {
  return (
    <main
      className={cn(
        "bg-mesh mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-5 sm:py-10",
        className,
      )}
    >
      {children}
    </main>
  );
}
