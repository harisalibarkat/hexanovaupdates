import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, trim: true });
}

export function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + "...";
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    tech: "Technology",
    celebs: "Celebrities",
    viral: "Viral",
    finance: "Finance",
    health: "Health",
    travel: "Travel",
  };
  return labels[category] ?? category;
}

export const CATEGORIES = [
  "tech",
  "celebs",
  "viral",
  "finance",
  "health",
  "travel",
] as const;

export type Category = (typeof CATEGORIES)[number];
