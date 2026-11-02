import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/seller', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/seller/products', label: 'Mes produits', icon: Package, end: false },
  { to: '/seller/orders', label: 'Commandes', icon: ClipboardList, end: false },
];

/** Espace vendeur : navigation latérale + contenu */
export function SellerLayout() {
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
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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

export default SellerLayout;
