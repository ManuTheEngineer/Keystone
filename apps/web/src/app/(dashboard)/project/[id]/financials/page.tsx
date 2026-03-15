import { FinancialsClient } from "./_client";
export function generateStaticParams() { return [{ id: "_" }]; }
export default function FinancialsPage() { return <FinancialsClient />; }
