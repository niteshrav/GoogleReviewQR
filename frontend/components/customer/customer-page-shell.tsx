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
        "bg-quiet mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-12",
        className,
      )}
    >
      {children}
    </main>
  );
}
