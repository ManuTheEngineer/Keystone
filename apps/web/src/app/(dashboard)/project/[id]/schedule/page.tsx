import { ScheduleClient } from "./_client";
export default function SchedulePage({ params }: { params: Promise<{ id: string }> }) {
  return <ScheduleClient />;
}
