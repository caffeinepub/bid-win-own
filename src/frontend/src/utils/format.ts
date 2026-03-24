export function formatUsd(cents: bigint): string {
  const dollars = Number(cents) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars);
}

export function shortenPrincipal(principal: { toString(): string }): string {
  const s = principal.toString();
  if (s.length <= 10) return s;
  return `${s.slice(0, 5)}...${s.slice(-3)}`;
}

export function nanosToMs(nanos: bigint): number {
  return Number(nanos) / 1_000_000;
}

export function formatTimeRemaining(endTimeNanos: bigint): string {
  const msLeft = nanosToMs(endTimeNanos) - Date.now();
  if (msLeft <= 0) return "Ended";
  const totalSeconds = Math.floor(msLeft / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function isEndingSoon(endTimeNanos: bigint): boolean {
  const msLeft = nanosToMs(endTimeNanos) - Date.now();
  return msLeft > 0 && msLeft < 3_600_000; // < 1 hour
}

export function isEnded(endTimeNanos: bigint): boolean {
  return nanosToMs(endTimeNanos) < Date.now();
}

export function timeAgo(timestampNanos: bigint): string {
  const ms = Date.now() - nanosToMs(timestampNanos);
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
