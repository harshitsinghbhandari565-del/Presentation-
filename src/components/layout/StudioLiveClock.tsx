"use client";
import { useEffect, useState } from "react";

function formatLocalTime(): string {
  try {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tz =
      Intl.DateTimeFormat([], { timeZoneName: "short" })
        .formatToParts(now)
        .find(p => p.type === "timeZoneName")?.value ?? "LOCAL";
    return `${time} ${tz}`;
  } catch {
    return "";
  }
}

export default function StudioLiveClock() {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") {
        setLabel(formatLocalTime());
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  if (!label) return null;

  return (
    <span className="studio-live-clock" aria-hidden="true">
      <span className="studio-clock-dot" />
      <span>ORBITAL TELEMETRY · {label}</span>
    </span>
  );
}
