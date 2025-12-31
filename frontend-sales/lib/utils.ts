/**
 * Core Utilities for Southern IOT
 *
 * This file contains the cn() function required by shadcn/ui components.
 * For additional utilities, see @/services/utils.ts
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence
 * Required by all shadcn/ui components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

