import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Menu,
  X,
  LogOut,
  User,
  Heart,
  ChevronDown,
  Package,
  LayoutDashboard,
  Store,
  Truck,
  ShieldCheck,
  LayoutGrid,
  Tag,
  LifeBuoy,
  Home,
  Undo2,
  ArrowRight,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SearchBox } from '@/components/layout/SearchBox';
import { Badge } from '@/components/ui/badge';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCartItemCount } from '@/store/slices/cartSlice';
import { fetchCategories, selectCategories } from '@/store/slices/productSlice';
import { selectWishlistItems, fetchWishlist, clearWishlist } from '@/store/slices/wishlistSlice';
import { useAuth } from '@/hooks/useAuth';
import { useDismiss } from '@/hooks/useDismiss';
import { useNotification } from '@/context/NotificationContext';
import { cn } from '@/lib/utils';
import { roleLabel } from '@/utils/labels';

const navBase = 'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors';
const navIdle = 'text-foreground/75 hover:bg-muted hover:text-foreground';
const navActive = 'bg-primary/10 text-primary';

const navItemClass = ({ isActive }: { isActive: boolean }) => cn(navBase, isActive ? navActive : navIdle);

/**
 * Header : bandeau d'annonce (défile avec la page) puis une seule barre fixe —
 * logo, navigation avec méga-menu des catégories, recherche, favoris, panier et compte.
 */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartItemCount = useAppSelector(selectCartItemCount);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const categories = useAppSelector(selectCategories);
  const { user, isAuthenticated, logout } = useAuth();
  const { showNotification } = useNotification();
  const wishlistCount = useAppSelector(selectWishlistItems).length;
  // Les clients et les vendeurs peuvent acheter (un vendeur ne peut pas acheter ses propres produits)
  const isCustomer = isAuthenticated && (user?.role === 'Customer' || user?.role === 'Seller');

  const catRef = useDismiss<HTMLDivElement>(catOpen, () => setCatOpen(false));
  const userRef = useDismiss<HTMLDivElement>(userOpen, () => setUserOpen(false));

  // Ombre et flou de la barre dès que la page défile
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // La liste de souhaits est chargée à la connexion d'un client et vidée à la déconnexion
  useEffect(() => {
    if (isCustomer) dispatch(fetchWishlist());
    else dispatch(clearWishlist());
  }, [isCustomer, dispatch]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Ferme tous les menus à chaque navigation (réinitialisation pendant le rendu, sans effet)
  const locationKey = location.pathname + location.search;
  const [prevLocationKey, setPrevLocationKey] = useState(locationKey);
  if (prevLocationKey !== locationKey) {
    setPrevLocationKey(locationKey);
    setIsMenuOpen(false);
    setCatOpen(false);
    setUserOpen(false);
  }

  const handleLogout = () => {
    const firstName = user?.firstName;
    setUserOpen(false);
    setIsMenuOpen(false);
    logout();
    navigate('/');
    showNotification(`À bientôt${firstName ? `, ${firstName}` : ''} ! Vous avez été déconnecté.`, 'success');
  };

  const dashboardLink =
    user?.role === 'Admin'
      ? { to: '/admin', label: 'Administration', icon: LayoutDashboard }
      : user?.role === 'Seller'
        ? { to: '/seller', label: 'Espace vendeur', icon: Store }
        : user?.role === 'Delivery'
          ? { to: '/delivery', label: 'Mes livraisons', icon: Truck }
          : null;

  const badge = (count: number) =>
    count > 0 && (
      <Badge
        key={count}
        className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full px-1 text-[10px]"
        variant="destructive"
      >
        {count > 99 ? '99+' : count}
      </Badge>
    );

  return (
    <>
      {/* Bandeau d'annonce : défile avec la page, seule la barre principale reste fixée */}
      <div className="hidden bg-slate-900 text-slate-100 sm:block">
        <div className="container mx-auto flex h-9 items-center justify-between px-4 text-xs">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-sky-300" />
              Livraison partout en Tunisie
            </span>
            <span className="hidden items-center gap-1.5 md:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-300" />
              Paiement à la livraison
            </span>
          </div>
          <a href="#aide" className="flex items-center gap-1.5 transition-colors hover:text-white">
            <LifeBuoy className="h-3.5 w-3.5" />
            Aide &amp; contact
          </a>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b transition-[background-color,box-shadow] duration-300',
          scrolled ? 'bg-background/90 shadow-md backdrop-blur-md' : 'bg-background'
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-3 lg:gap-5">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 lg:hidden"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-expanded={isMenuOpen}
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo */}
            <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="TounsiBuy - Accueil">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 shadow-md shadow-primary/30">
                <span className="text-lg font-extrabold text-primary-foreground">T</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                Tounsi<span className="text-primary">Buy</span>
              </span>
            </Link>

            {/* Navigation - desktop */}
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
              <NavLink to="/" end className={navItemClass}>
                Accueil
              </NavLink>

              {/* Méga-menu catégories */}
              <div ref={catRef} className="relative">
                <button
                  type="button"
                  onClick={() => setCatOpen((v) => !v)}
                  aria-expanded={catOpen}
                  aria-haspopup="true"
                  className={cn(navBase, catOpen ? navActive : navIdle)}
                >
                  Catégories
                  <ChevronDown className={cn('h-4 w-4 transition-transform', catOpen && 'rotate-180')} />
                </button>

                {catOpen && (
                  <div className="absolute left-0 top-full mt-3 w-[40rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border bg-popover p-3 shadow-2xl animate-fade-in">
                    {categories.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground">Aucune catégorie disponible.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-1 xl:grid-cols-3">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            to={`/?category=${category.id}#produits`}
                            className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-accent"
                          >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                              {category.imageUrl ? (
                                <img src={category.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                              ) : (
                                <Tag className="h-4 w-4 text-muted-foreground" />
                              )}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium group-hover:text-primary">
                                {category.name}
                              </span>
                              {category.productCount !== undefined && (
                                <span className="block text-xs text-muted-foreground">
                                  {category.productCount} produit{category.productCount > 1 ? 's' : ''}
                                </span>
                              )}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2.5 text-sm">
                      <span className="text-muted-foreground">{categories.length} catégories</span>
                      <Link to="/categories" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                        Voir toutes les catégories <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <NavLink
                to="/?sort=price-asc#produits"
                className={() => cn(navItemClass({ isActive: false }), 'hidden xl:inline-flex')}
              >
                Meilleurs prix
              </NavLink>
              {isCustomer && (
                <NavLink to="/orders" className={(s) => cn(navItemClass(s), 'hidden xl:inline-flex')}>
                  Mes commandes
                </NavLink>
              )}
              {dashboardLink && (
                <NavLink
                  to={dashboardLink.to}
                  className={(s) => cn(navItemClass(s), !s.isActive && 'text-primary hover:bg-primary/10 hover:text-primary')}
                >
                  <dashboardLink.icon className="h-4 w-4" /> {dashboardLink.label}
                </NavLink>
              )}
            </nav>

            {/* Recherche - desktop, centrée dans l'espace restant */}
            <div className="hidden min-w-0 flex-1 justify-center lg:flex">
              <div className="w-full max-w-md">
                <SearchBox />
              </div>
            </div>

            {/* Actions */}
            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5 lg:ml-0">
              {isCustomer && (
                <Link to="/wishlist" aria-label="Liste de souhaits" title="Liste de souhaits">
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Heart className="h-5 w-5" />
                    {badge(wishlistCount)}
                  </Button>
                </Link>
              )}

              <Link to="/cart" aria-label="Panier" title="Panier">
                <Button variant="ghost" size="icon" className="relative rounded-full" data-cart-target>
                  <ShoppingCart className="h-5 w-5" />
                  {badge(cartItemCount)}
                </Button>
              </Link>

              {isAuthenticated ? (
                <div ref={userRef} className="relative ml-1">
                  <button
                    type="button"
                    onClick={() => setUserOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={userOpen}
                    className="flex items-center gap-2 rounded-full border bg-background py-1 pl-1 pr-1 text-sm font-medium transition-colors hover:bg-accent xl:pr-3"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-600 text-sm font-bold uppercase text-primary-foreground">
                      {user?.firstName?.charAt(0) ?? <User className="h-4 w-4" />}
                    </span>
                    <span className="hidden max-w-[7rem] truncate xl:inline">{user?.firstName}</span>
                    <ChevronDown
                      className={cn('hidden h-4 w-4 text-muted-foreground transition-transform xl:block', userOpen && 'rotate-180')}
                    />
                  </button>

                  {userOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border bg-popover p-1.5 shadow-2xl animate-fade-in"
                    >
                      <div className="mb-1 flex items-center gap-3 border-b px-3 pb-3 pt-2.5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-600 font-bold uppercase text-primary-foreground">
                          {user?.firstName?.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                          <Badge variant="secondary" className="mt-1.5">
                            {roleLabel(user?.role ?? 'Customer')}
                          </Badge>
                        </div>
                      </div>
                      {dashboardLink && (
                        <MenuLink to={dashboardLink.to} icon={dashboardLink.icon} highlight>
                          {dashboardLink.label}
                        </MenuLink>
                      )}
                      <MenuLink to="/profile" icon={User}>Mon profil</MenuLink>
                      {user?.role !== 'Delivery' && (
                        <MenuLink to="/orders" icon={Package}>Mes commandes</MenuLink>
                      )}
                      {isCustomer && <MenuLink to="/returns" icon={Undo2}>Mes retours</MenuLink>}
                      {isCustomer && (
                        <MenuLink to="/wishlist" icon={Heart}>
                          Liste de souhaits{wishlistCount > 0 && ` (${wishlistCount})`}
                        </MenuLink>
                      )}
                      <div className="my-1 border-t" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden items-center gap-1.5 pl-1 sm:flex">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="rounded-full">Connexion</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="rounded-full px-5 shadow-md shadow-primary/25">Inscription</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        <div
          className={cn(
            'overflow-hidden bg-background transition-all duration-300 lg:hidden',
            isMenuOpen ? 'max-h-[36rem] border-t' : 'max-h-0'
          )}
        >
          <div className="container mx-auto space-y-4 px-4 py-4">
            <SearchBox />

            <nav className="grid gap-1" aria-label="Navigation mobile">
              <MobileLink to="/" icon={Home}>Accueil</MobileLink>
              <MobileLink to="/categories" icon={LayoutGrid}>Toutes les catégories</MobileLink>
              <MobileLink to="/?sort=price-asc#produits" icon={Tag}>Meilleurs prix</MobileLink>
              {isAuthenticated && user?.role !== 'Delivery' && (
                <MobileLink to="/orders" icon={Package}>Mes commandes</MobileLink>
              )}
              {isCustomer && (
                <MobileLink to="/wishlist" icon={Heart}>Liste de souhaits ({wishlistCount})</MobileLink>
              )}
              {dashboardLink && (
                <MobileLink to={dashboardLink.to} icon={dashboardLink.icon}>{dashboardLink.label}</MobileLink>
              )}
              {isAuthenticated && <MobileLink to="/profile" icon={User}>Mon profil</MobileLink>}
            </nav>

            <div className="border-t pt-4">
              {isAuthenticated ? (
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login"><Button variant="outline" className="w-full">Connexion</Button></Link>
                  <Link to="/register"><Button className="w-full">Inscription</Button></Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

interface LinkProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  highlight?: boolean;
}

function MenuLink({ to, icon: Icon, children, highlight }: LinkProps) {
  return (
    <Link
      to={to}
      role="menuitem"
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent',
        highlight && 'font-medium text-primary'
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}

function MobileLink({ to, icon: Icon, children }: LinkProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {children}
    </Link>
  );
}
