"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@frontend/lib/cn";

type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  /** Use mount animation instead of scroll-triggered (for above-the-fold). */
  immediate?: boolean;
};

export function FadeIn({
  className,
  delay = 0,
  y = 16,
  immediate = false,
  children,
  ...props
}: FadeInProps) {
  if (immediate) {
    return (
      <motion.div
        className={cn(className)}
        initial={{ opacity: 0, y }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ className, delay = 0, children, ...props }: FadeInProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
