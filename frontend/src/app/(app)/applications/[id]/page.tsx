import type { Metadata } from 'next';
import { ApplicationDetail } from '@/components/applications/ApplicationDetail';

export const metadata: Metadata = { title: 'Application Detail' };
export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApplicationDetail id={id} />;
}
