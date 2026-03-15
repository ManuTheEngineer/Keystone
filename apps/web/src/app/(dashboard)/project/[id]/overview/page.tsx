import { OverviewClient } from "./_client";
export default function OverviewPage({ params }: { params: Promise<{ id: string }> }) {
  return <OverviewClient />;
}
