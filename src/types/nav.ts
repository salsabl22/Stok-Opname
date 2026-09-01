import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Halaman sudah diimplementasikan secara fungsional (bukan placeholder) */
  implemented?: boolean;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}
