import type { Metadata } from 'next';
import { ProfileView } from '@/components/profile/ProfileView';
export const metadata: Metadata = { title: 'My Profile' };
export default function ProfilePage() { return <ProfileView />; }
