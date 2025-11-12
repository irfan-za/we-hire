import { UserData } from "@/types";
import { toast } from "sonner";

export const getUserData = async (): Promise<UserData | null> => {
  if (typeof window === "undefined") return null;

  const cached = localStorage.getItem("userData");
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  if (cached) {
    if (cached === "null") return null;
    const cachedData = JSON.parse(cached);
    const isExpired = now - cachedData.timestamp > oneDay;

    if (!isExpired) {
      return cachedData.data as UserData;
    }

    localStorage.removeItem("userData");
  }

  const res = await fetch("/api/auth/me");
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.setItem("userData", "null");
    } else {
      toast.error("Oops, something went wrong!");
    }
    return null;
  }
  const { data, error } = await res.json();

  if (error) {
    toast.error("Oops, something went wrong!", {
      description: error.message,
    });
    return null;
  }

  const cacheData = {
    data,
    timestamp: now,
  };
  localStorage.setItem("userData", JSON.stringify(cacheData));
  return data as UserData;
};
export const clearLocalStorageCache = async () => {
  if (typeof window === "undefined") return null;

  localStorage.removeItem("userData");
};
