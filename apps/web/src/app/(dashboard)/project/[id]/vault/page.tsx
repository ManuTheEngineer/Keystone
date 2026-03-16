import { VaultClient } from "./_client";
export default function VaultPage({ params }: { params: Promise<{ id: string }> }) {
  return <VaultClient />;
}
