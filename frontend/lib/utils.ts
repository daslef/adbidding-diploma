import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export const formatDateTime = (date) => {
  if (!date) return "";

  try {
    return new Date(date).toLocaleString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Europe/Moscow", // Consistent timezone for all users
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "";
  }
};

export function formatTimeLeft(milliseconds: number): string {
  if (milliseconds <= 0) {
    return "Auction ended";
  }

  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days} дней ${hours} ч. ${minutes} мин.`;
  }

  return `${hours}:${minutes}:${seconds}`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => func(...args), wait);
  };
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function calculateTimeLeft(endDate: string): {
  milliseconds: number;
  formatted: string;
} {
  const endTime = new Date(endDate).getTime();
  const now = new Date().getTime();
  const difference = endTime - now;

  return {
    milliseconds: Math.max(0, difference),
    formatted: formatTimeLeft(Math.max(0, difference)),
  };
}

export const createCache = <T>(maxSize = 100, expiryTime = 5 * 60 * 1000) => {
  const cache = new Map<string, { data: T; timestamp: number }>();

  return {
    get: (key: string): T | undefined => {
      const item = cache.get(key);

      if (!item) return undefined;

      const isExpired = Date.now() - item.timestamp > expiryTime;

      if (isExpired) {
        cache.delete(key);
        return undefined;
      }

      return item.data;
    },

    set: (key: string, data: T): void => {
      // If cache is full, remove oldest item
      if (cache.size >= maxSize) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
      }

      cache.set(key, { data, timestamp: Date.now() });
    },

    remove: (key: string): void => {
      cache.delete(key);
    },

    clear: (): void => {
      cache.clear();
    },
  };
};
