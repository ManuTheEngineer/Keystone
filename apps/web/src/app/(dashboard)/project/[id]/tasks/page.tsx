import { TasksClient } from "./_client";

export async function generateStaticParams() {
  return [{ id: "_" }];
}

export default function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  return <TasksClient />;
}
