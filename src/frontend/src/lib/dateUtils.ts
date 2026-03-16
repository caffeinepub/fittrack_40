import type { Date_ } from "../backend.d";

export function toDate_(d: Date): Date_ {
  return {
    day: BigInt(d.getDate()),
    month: BigInt(d.getMonth() + 1),
    year: BigInt(d.getFullYear()),
  };
}

export function fromDate_(d: Date_): Date {
  return new Date(Number(d.year), Number(d.month) - 1, Number(d.day));
}

export function formatDate_(d: Date_): string {
  const date = fromDate_(d);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function todayDate_(): Date_ {
  return toDate_(new Date());
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
