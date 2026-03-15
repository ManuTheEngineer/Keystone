import { DocumentsClient } from "./_client";
export default function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  return <DocumentsClient />;
}
