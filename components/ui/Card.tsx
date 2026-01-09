import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, selected, interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border-2 transition-all duration-200",
          {
            "border-slate-200 bg-white": !selected,
            "border-slate-900 bg-slate-50 shadow-md": selected,
            "cursor-pointer hover:border-slate-300 hover:shadow-sm":
              interactive && !selected,
            "cursor-pointer": interactive && selected,
          },
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export default Card;





