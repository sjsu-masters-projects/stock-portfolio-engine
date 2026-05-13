import { HTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "glass rounded-2xl p-6 transition-all duration-300",
          hover && "hover:-translate-y-1 hover:shadow-xl",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";
