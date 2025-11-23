import React, { forwardRef } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const InteractiveHoverButton = forwardRef(function InteractiveHoverButton(
  { children, className, ...props },
  ref
) {
  return (
    <button
  ref={ref}
  className={cn(
    "group relative w-auto cursor-pointer overflow-hidden rounded-lg border bg-background p-2 px-6 text-center transition-all duration-300 hover:border-primary hover:bg-black hover:text-white hover:shadow-md hover:scale-[1.02]",
    className
  )}
  {...props}
>

      <div className="flex items-center gap-2">
        
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
        <span>{children}</span>
        <ArrowRight />
      </div>
    </button>
  );
});
