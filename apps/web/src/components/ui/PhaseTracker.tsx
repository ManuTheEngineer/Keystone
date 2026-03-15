const PHASES = [
  "Define",
  "Finance",
  "Land",
  "Design",
  "Approve",
  "Assemble",
  "Build",
  "Verify",
  "Operate",
];

interface PhaseTrackerProps {
  currentPhase: number; // 0-8 index
  completedPhases: number; // number of completed phases
}

export function PhaseTracker({ currentPhase, completedPhases }: PhaseTrackerProps) {
  return (
    <div>
      <div className="flex gap-0.5 mb-1.5">
        {PHASES.map((_, i) => (
          <div
            key={i}
            className={`
              flex-1 h-[5px] rounded-sm
              ${
                i < completedPhases
                  ? "bg-success"
                  : i === currentPhase
                    ? "bg-earth"
                    : "bg-border"
              }
            `}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {PHASES.map((name, i) => (
          <span
            key={i}
            className={`
              text-[7px] tracking-wide
              ${i === currentPhase ? "font-semibold text-earth" : "text-muted"}
            `}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
