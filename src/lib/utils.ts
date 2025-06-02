import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getExpReward(difficulty: 'E' | 'D' | 'C' | 'B' | 'A'): number {
  switch (difficulty) {
    case 'E':
      return 50;
    case 'D':
      return 150;
    case 'C':
      return 300;
    case 'B':
      return 500;
    case 'A':
      return 1000;
    default:
      return 0;
  }
}
