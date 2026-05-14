import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-white/12 bg-[#0c1820] px-3 text-sm text-white outline-none transition placeholder:text-white/38 focus:border-[#23d18b] focus:ring-2 focus:ring-[#23d18b]/25",
        className,
      )}
      {...props}
    />
  );
}
