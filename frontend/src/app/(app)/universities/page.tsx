import type { Metadata } from 'next';
import { UniversitiesView } from '@/components/universities/UniversitiesView';
export const metadata: Metadata = { title: 'Universities' };
export default function UniversitiesPage() { return <UniversitiesView />; }
