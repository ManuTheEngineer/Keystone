import { SettingsClient } from "./_client";

export async function generateStaticParams() {
  return [{ id: "_" }];
}

export default function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  return <SettingsClient />;
}
