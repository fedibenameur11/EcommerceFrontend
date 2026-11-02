import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, ClipboardList, Users, BarChart3, TicketPercent, ScrollText, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/analytics', label: 'Statistiques', icon: BarChart3, end: false },
  { to: '/admin/products', label: 'Produits', icon: Package, end: false },
  { to: '/admin/categories', label: 'Catégories', icon: Tags, end: false },
  { to: '/admin/orders', label: 'Commandes', icon: ClipboardList, end: false },
  { to: '/admin/coupons', label: 'Codes promo', icon: TicketPercent, end: false },
  { to: '/admin/returns', label: 'Retours', icon: Undo2, end: false },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users, end: false },
  { to: '/admin/audit', label: "Journal d'audit", icon: ScrollText, end: false },
];

/**
 * Admin area layout: sidebar navigation + page content
 */
export function AdminLayout() {
  return (
    <div className="container mx-auto flex flex-col gap-6 px-4 py-8 md:flex-row">
      <aside className="md:w-56 md:shrink-0">
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="min-w-0 flex-1">
        <Outlet />
      </section>
    </div>
  );
}

export default AdminLayout;
