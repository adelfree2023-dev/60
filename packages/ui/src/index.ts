import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export Radix UI primitives
export * from "@radix-ui/react-accordion";
export * from "@radix-ui/react-alert-dialog";
export * from "@radix-ui/react-avatar";
export * from "@radix-ui/react-checkbox";
export * from "@radix-ui/react-context-menu";
export * from "@radix-ui/react-dialog";
export * from "@radix-ui/react-dropdown-menu";
export * from "@radix-ui/react-hover-card";
export * from "@radix-ui/react-label";
export * from "@radix-ui/react-navigation-menu";
export * from "@radix-ui/react-popover";
export * from "@radix-ui/react-progress";
export * from "@radix-ui/react-select";
export * from "@radix-ui/react-separator";
export * from "@radix-ui/react-slider";
export * from "@radix-ui/react-switch";
export * from "@radix-ui/react-tabs";
export * from "@radix-ui/react-toast";
export * from "@radix-ui/react-toggle";
export * from "@radix-ui/react-toggle-group";
export * from "@radix-ui/react-tooltip";

// TanStack Table
export * from "@tanstack/react-table";
