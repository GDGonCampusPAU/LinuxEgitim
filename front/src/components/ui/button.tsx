import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#071016] disabled:cursor-not-allowed disabled:opacity-55",
        variant === "primary" &&
          "bg-[#ffcf24] text-[#101014] shadow-[0_10px_30px_rgba(255,207,36,0.25)] hover:bg-[#ffe05d] focus:ring-[#ffcf24]",
        variant === "secondary" &&
          "bg-white text-[#101014] hover:bg-[#eef4f8] focus:ring-white",
        variant === "ghost" &&
          "border border-white/14 bg-white/6 text-white hover:bg-white/10 focus:ring-white/50",
        variant === "danger" &&
          "bg-[#ff4d6d] text-white hover:bg-[#ff6a84] focus:ring-[#ff4d6d]",
        className,
      )}
      {...props}
    />
  );
}
