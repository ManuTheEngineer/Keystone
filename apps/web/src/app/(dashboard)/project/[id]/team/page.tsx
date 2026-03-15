import { TeamClient } from "./_client";
export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  return <TeamClient />;
}
