import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(title: string, suffixLength = 10): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");

  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < suffixLength; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return base ? `${base}-${suffix}` : suffix;
}

export function formatIDR(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value) || value === null || value === undefined)
    return "Rp 0";
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
  return `Rp ${formatted}`;
}
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
