import EditClient from "./EditClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <EditClient slug={slug} />;
}

export function generateStaticParams() {
  return [{ slug: "_" }];
}
