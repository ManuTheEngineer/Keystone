import { BudgetClient } from "./_client";
export default function BudgetPage({ params }: { params: Promise<{ id: string }> }) {
  return <BudgetClient />;
}
