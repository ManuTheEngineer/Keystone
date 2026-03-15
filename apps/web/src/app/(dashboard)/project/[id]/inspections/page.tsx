import { InspectionsClient } from "./_client";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function InspectionsPage() {
  return <InspectionsClient />;
}
