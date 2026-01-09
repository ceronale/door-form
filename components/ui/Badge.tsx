import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  interactive?: boolean;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, selected, interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
          {
            "bg-slate-100 text-slate-700": !selected,
            "bg-slate-900 text-white": selected,
            "cursor-pointer hover:bg-slate-200": interactive && !selected,
            "cursor-pointer": interactive && selected,
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export default Badge;





