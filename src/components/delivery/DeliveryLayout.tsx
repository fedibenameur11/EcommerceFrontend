import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/delivery', label: 'Mes livraisons', icon: Truck, end: true },
  { to: '/delivery/stats', label: 'Statistiques', icon: BarChart3, end: false },
];

/** Espace livreur : onglets (livraisons, statistiques) et contenu centré */
export function DeliveryLayout() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-6 flex gap-1 border-b">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                '-mb-px flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}

export default DeliveryLayout;
