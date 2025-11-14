import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function generateSlug(title: string, suffixLength = 10): string {
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

function formatIDR(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value) || value === null || value === undefined)
    return "Rp 0";
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
  return `Rp ${formatted}`;
}
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
const getStatusVariant = (status: string) => {
  switch (status) {
    case "active":
      return "default";
    case "inactive":
      return "destructive";
    case "draft":
      return "secondary";
    default:
      return "outline";
  }
};
const getWorkArrangementVariant = (arrangement: string) => {
  switch (arrangement) {
    case "remote":
      return "default";
    case "onsite":
      return "secondary";
    case "hybrid":
      return "outline";
    default:
      return "outline";
  }
};
const getExperienceLevel = (type: string) => {
  const typeMap: Record<string, string> = {
    internship: "Associate (0 - 3 years)",
    "full-time": "Mid-Level (3 - 5 years)",
    "part-time": "Associate (0 - 3 years)",
    contract: "Mid-Level (3 - 5 years)",
  };
  return typeMap[type.toLowerCase()] || "All levels";
};

export {
  cn,
  generateSlug,
  formatIDR,
  formatDate,
  getStatusVariant,
  getWorkArrangementVariant,
  getExperienceLevel,
};
