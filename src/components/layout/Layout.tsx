import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Main layout wrapper component
 * Includes Header, main content area, and Footer
 */
export function Layout() {
  const { pathname, hash } = useLocation();

  // À chaque changement de page on revient en haut (sauf lien vers une ancre, ex. /#produits)
  useLayoutEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* La clé relance l'animation d'entrée à chaque changement de page */}
      <main key={pathname} className="flex-1 animate-page-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
