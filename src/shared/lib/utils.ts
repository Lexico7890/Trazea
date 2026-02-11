import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { LOADER_TEXTS } from "../model/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getLoadingText = (context: keyof typeof LOADER_TEXTS): string => {
  return LOADER_TEXTS[context];
};
