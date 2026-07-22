"use client";

import { motion, type HTMLMotionProps, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@frontend/lib/cn";

type FadeInProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: ReactNode;
  delay?: number;
  y?: number;
  /** Use mount animation instead of scroll-triggered (for above-the-fold). */
  immediate?: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function FadeIn({
  className,
  delay = 0,
  y = 16,
  immediate = false,
  children,
  ...props
}: FadeInProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  if (immediate) {
    return (
      <motion.div
        className={cn(className)}
        initial={{ opacity: 0, y }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease, delay }}
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
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.45, ease, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
  className,
  delay = 0,
  children,
  ...props
}: FadeInProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
