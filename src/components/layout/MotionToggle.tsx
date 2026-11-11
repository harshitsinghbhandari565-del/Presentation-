"use client";
import { Move3d, Pause } from "lucide-react";
import { toggleMotionPaused, useMotionStatus } from "./motion-state";
import { useProjectorMode } from "@/components/projector/ProjectorModeToggle";

export default function MotionToggle() {
  const status = useMotionStatus();
  const projector = useProjectorMode();
  if (projector) return null;

  const isOff = status !== "active";
  const label =
    status === "os-blocked"
      ? "OS Reduced Motion is on — tap to enable 3D scroll animations"
      : status === "paused"
        ? "Resume 3D scroll animations"
        : "Pause 3D scroll animations";

  return (
    <button
      type="button"
      className={status === "os-blocked" ? "motion-pill motion-pill-alert" : "icon-button motion-header-btn"}
      aria-pressed={isOff}
      aria-label={label}
      title={label}
      onClick={() => toggleMotionPaused()}
    >
      {isOff ? <Move3d size={17} /> : <Pause size={16} />}
      {status === "os-blocked" && <span>Enable 3D</span>}
    </button>
  );
}
