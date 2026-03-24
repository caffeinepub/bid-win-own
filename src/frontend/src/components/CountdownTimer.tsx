import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { formatTimeRemaining, isEnded, isEndingSoon } from "../utils/format";

interface Props {
  endTimeNanos: bigint;
  className?: string;
}

export default function CountdownTimer({
  endTimeNanos,
  className = "",
}: Props) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const ended = isEnded(endTimeNanos);
  const endingSoon = isEndingSoon(endTimeNanos);
  const timeStr = formatTimeRemaining(endTimeNanos);

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        ended
          ? "text-muted-foreground"
          : endingSoon
            ? "text-destructive animate-pulse"
            : "text-foreground"
      } ${className}`}
    >
      <Clock className="h-3 w-3" />
      {timeStr}
    </span>
  );
}
