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
        {PHASES.map((_, i) => {
          const isCompleted = i < completedPhases;
          const isCurrent = i === currentPhase;
          const isUpcoming = !isCompleted && !isCurrent;
          return (
            <div
              key={i}
              className="flex-1 relative"
            >
              <div
                className={`
                  h-[5px] rounded-sm transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-success"
                      : isCurrent
                        ? "bg-earth"
                        : "bg-border"
                  }
                `}
                style={
                  isCurrent && i > 0
                    ? { background: "linear-gradient(90deg, var(--color-success), var(--color-earth))" }
                    : isUpcoming && i > 0 && i - 1 === currentPhase
                      ? { background: "linear-gradient(90deg, var(--color-earth), var(--color-border))" }
                      : undefined
                }
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center">
        {PHASES.map((name, i) => {
          const isCurrent = i === currentPhase;
          return (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div
                className={`
                  rounded-full transition-all duration-300
                  ${
                    isCurrent
                      ? "w-[14px] h-[14px] bg-earth shadow-[0_0_0_3px_rgba(44,24,16,0.12)]"
                      : i < completedPhases
                        ? "w-[10px] h-[10px] bg-success"
                        : "w-[10px] h-[10px] bg-border"
                  }
                `}
              />
              <span
                className={`
                  text-[9px] sm:text-[10px] tracking-wide transition-all duration-150
                  ${isCurrent ? "font-semibold text-earth" : "text-muted"}
                `}
              >
                {name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
