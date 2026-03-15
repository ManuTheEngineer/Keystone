import { DailyLogClient } from "./_client";
export default function DailyLogPage({ params }: { params: Promise<{ id: string }> }) {
  return <DailyLogClient />;
}
