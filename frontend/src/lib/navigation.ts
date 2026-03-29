import {
  LayoutDashboard, BookOpen, GraduationCap,
  FolderOpen, Calendar, User, Compass,
  FileText, Shield, Calculator,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Shared navigation items (Single Source of Truth) ───────────

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: 'count' | null;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/applications', icon: BookOpen,        label: 'Applications', badge: 'count' },
  { href: '/universities', icon: GraduationCap,   label: 'Universities' },
  { href: '/documents',    icon: FolderOpen,      label: 'Documents' },
  { href: '/calendar',     icon: Calendar,        label: 'Calendar' },
  { href: '/profile',      icon: User,            label: 'My Profile' },
  { href: '/resources',    icon: Compass,         label: 'Resources' },
];

/** Breadcrumb lookup derived from NAV_ITEMS — keeps Navbar in sync. */
export const BREADCRUMBS: Record<string, string> = Object.fromEntries(
  NAV_ITEMS.map((item) => [item.href, item.label]),
);

// Override label where the title differs from the nav label
BREADCRUMBS['/resources'] = 'Resources & Tools';

export const QUICK_ACTIONS = [
  { label: 'Add Application',           href: '/applications?action=add',            icon: BookOpen,    group: 'Actions' },
  { label: 'Upload Document',           href: '/documents?action=upload',            icon: FileText,    group: 'Actions' },
  { label: 'Create Event',              href: '/calendar?action=create',             icon: Calendar,    group: 'Actions' },
  { label: 'Visa & APS Guide',          href: '/resources',                          icon: Shield,      group: 'Actions' },
  { label: 'Blocked Account Calculator',href: '/resources?tab=blocked-account',      icon: Calculator,  group: 'Actions' },
];
