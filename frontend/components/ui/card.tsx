import { HTMLAttributes } from "react";
import { cn } from "@frontend/lib/cn";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "article" | "section";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Card({
  as: Tag = "div",
  className,
  hover = false,
  padding = "md",
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-200",
        hover && "hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]",
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
