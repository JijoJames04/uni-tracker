import type { Metadata } from 'next';
import ResourcesContent from '@/components/resources/ResourcesContent';

export const metadata: Metadata = { title: 'Resources & Tools' };

export default function ResourcesPage() {
  return <ResourcesContent />;
}
