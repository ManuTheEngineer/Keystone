import { PunchListClient } from "./_client";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function PunchListPage() {
  return <PunchListClient />;
}
