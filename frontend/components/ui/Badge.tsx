import { HTMLAttributes } from "react";
import clsx from "clsx";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "danger" | "neutral" | "brand";
}

export function Badge({ variant = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-tight",
        {
          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400": variant === "success",
          "bg-red-500/15 text-red-700 dark:text-red-400": variant === "danger",
          "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300": variant === "neutral",
          "bg-brand-500/15 text-brand-700 dark:text-brand-400": variant === "brand",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
