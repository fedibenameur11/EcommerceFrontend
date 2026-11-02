/**
 * 404 Not Found Page
 */

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const NotFoundPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="mb-2 text-6xl font-bold text-primary">404</h1>
        <h2 className="mb-2 text-2xl font-semibold">Page introuvable</h2>
        <p className="mb-6 text-muted-foreground">La page que vous recherchez n&apos;existe pas.</p>
        <Link to="/">
          <Button>Retour à l&apos;accueil</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
