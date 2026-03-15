export async function generateStaticParams() {
  return [{ id: "_" }];
}

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
