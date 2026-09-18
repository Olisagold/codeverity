import { DocPageView } from '@/components/docs/DocPageView';

export default async function DocsCatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <DocPageView slug={slug.join('/')} />;
}
