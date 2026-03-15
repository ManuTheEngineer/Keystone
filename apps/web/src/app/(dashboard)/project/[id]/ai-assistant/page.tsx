import { AIAssistantClient } from "./_client";
export default function AIAssistantPage({ params }: { params: Promise<{ id: string }> }) {
  return <AIAssistantClient />;
}
