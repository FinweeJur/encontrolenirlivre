/**
 * util oficial dos componentes Lightswind (padrão shadcn):
 * junta classes e resolve conflito do Tailwind.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
