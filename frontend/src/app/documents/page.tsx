import type { Metadata } from 'next';
import { DocumentsVault } from '@/components/documents/DocumentsVault';
export const metadata: Metadata = { title: 'Documents' };
export default function DocumentsPage() { return <DocumentsVault />; }
