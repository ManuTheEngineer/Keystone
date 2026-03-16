"use client";

import { Sun, Cloud, CloudRain, CloudLightning, Users, Clock } from "lucide-react";

interface DailyPulseBarProps {
  weather: string;
  crewSize: number;
  activeTrades: string[];
  lastLogHoursAgo: number;
}

function WeatherIcon({ weather }: { weather: string }) {
  const lower = weather.toLowerCase();
  const iconClass = "text-warm flex-shrink-0";

  if (lower.includes("rain") || lower.includes("shower")) {
    return <CloudRain size={18} className={iconClass} />;
  }
  if (lower.includes("storm") || lower.includes("thunder") || lower.includes("lightning")) {
    return <CloudLightning size={18} className={iconClass} />;
  }
  if (lower.includes("cloud") || lower.includes("overcast")) {
    return <Cloud size={18} className={iconClass} />;
  }
  return <Sun size={18} className={iconClass} />;
}

function formatLastLog(hoursAgo: number): { text: string; isWarning: boolean } {
  if (hoursAgo < 0) {
    return { text: "No log today", isWarning: true };
  }
  if (hoursAgo < 1) {
    const minutes = Math.round(hoursAgo * 60);
    return { text: `${minutes}m ago`, isWarning: false };
  }
  if (hoursAgo < 24) {
    return { text: `${Math.round(hoursAgo)}h ago`, isWarning: hoursAgo > 8 };
  }
  return { text: "No log today", isWarning: true };
}

export function DailyPulseBar({
  weather,
  crewSize,
  activeTrades,
  lastLogHoursAgo,
}: DailyPulseBarProps) {
  const lastLog = formatLastLog(lastLogHoursAgo);

  return (
    <div className="bg-earth rounded-[var(--radius)] px-4 py-3">
      <div className="flex items-center flex-wrap gap-y-2">
        {/* Weather */}
        <div className="flex items-center gap-2 pr-4">
          <WeatherIcon weather={weather} />
          <span className="text-warm text-sm">{weather}</span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-warm/20" />

        {/* Crew */}
        <div className="flex items-center gap-2 px-4">
          <Users size={16} className="text-warm flex-shrink-0" />
          <span className="font-data text-warm text-sm">{crewSize}</span>
          <span className="text-warm/60 text-xs">crew</span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-warm/20" />

        {/* Active trades */}
        <div className="flex items-center gap-2 px-4 flex-wrap">
          {activeTrades.length > 0 ? (
            activeTrades.map((trade) => (
              <span
                key={trade}
                className="text-xs bg-warm/10 text-warm px-2 py-0.5 rounded"
              >
                {trade}
              </span>
            ))
          ) : (
            <span className="text-xs text-warm/40">No active trades</span>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-warm/20" />

        {/* Last log */}
        <div className="flex items-center gap-2 pl-4">
          <Clock
            size={16}
            className={`flex-shrink-0 ${lastLog.isWarning ? "text-warning" : "text-warm"}`}
          />
          <span
            className={`text-sm ${
              lastLog.isWarning ? "text-warning font-medium" : "text-warm"
            }`}
          >
            {lastLog.text}
          </span>
        </div>
      </div>
    </div>
  );
}
